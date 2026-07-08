const crypto = require("crypto");
const { db } = require("../config/firebaseAdmin");
const { FieldValue } = require("firebase-admin/firestore");

async function chapaWebhook(req, res) {
    try {

        // ------------------------------------------------
        // Verify Chapa Signature
        // ------------------------------------------------

        const signature =
            req.headers["x-chapa-signature"] ||
            req.headers["chapa-signature"];

        if (!signature) {
            console.log("Missing webhook signature");
            return res.sendStatus(401);
        }

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.CHAPA_WEBHOOK_SECRET
            )
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (signature !== expectedSignature) {
            console.log("Invalid webhook signature");
            return res.sendStatus(401);
        }

        // ------------------------------------------------
        // Read Payload
        // ------------------------------------------------

        const event = req.body;

        console.log("========== CHAPA WEBHOOK ==========");
        console.log(event);
        console.log("===================================");

        const reference = event.reference;

        if (!reference) {
            return res.status(400).json({
                success: false,
                message: "Missing reference"
            });
        }

        // ------------------------------------------------
        // Find payout
        // ------------------------------------------------

        const snapshot = await db
            .collection("payout")
            .where("reference", "==", reference)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({
                success: false,
                message: "Payout not found"
            });
        }

        const payoutRef = snapshot.docs[0].ref;

        // ------------------------------------------------
        // Success
        // ------------------------------------------------

        if (
            event.event === "payout.success" ||
            event.status === "success"
        ) {

            await payoutRef.update({

                status: "paid",

                transferReference:
                    event.chapa_reference || null,

                bankReference:
                    event.bank_reference || null,

                bankName:
                    event.bank_name || null,

                charge:
                    Number(event.charge || 0),

                completedAt:
                    FieldValue.serverTimestamp(),

                webhook:
                    event

            });

            return res.sendStatus(200);

        }

        // ------------------------------------------------
        // Failed
        // ------------------------------------------------

        if (
            event.event === "payout.failed" ||
            event.status === "failed"
        ) {

            await payoutRef.update({

                status: "failed",

                failureReason:
                    event.failure_reason ||
                    "Transfer failed",

                webhook:
                    event

            });

            return res.sendStatus(200);

        }

        // ------------------------------------------------

        return res.sendStatus(200);

    }

    catch (err) {

        console.log(err);

        return res.sendStatus(500);

    }
}

module.exports = {
    chapaWebhook
};