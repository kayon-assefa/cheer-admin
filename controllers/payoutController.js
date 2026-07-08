const { db } = require("../config/firebaseAdmin");
const chapa = require("../services/chapa");
const { FieldValue } = require("firebase-admin/firestore");

/*
|--------------------------------------------------------------------------
| APPROVE PAYOUT
|--------------------------------------------------------------------------
*/

async function approvePayout(req, res) {
    try {
        const { payoutId } = req.body;

        if (!payoutId) {
            return res.status(400).json({
                success: false,
                message: "Missing payoutId"
            });
        }

        const payoutRef = db.collection("payout").doc(payoutId);
        const payoutDoc = await payoutRef.get();

        if (!payoutDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Payout not found"
            });
        }

        const payout = payoutDoc.data();

        if (payout.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This payout has already been processed."
            });
        }

        // Create unique reference
      // Create short unique reference (under 36 characters)
const reference =
    "CHR" +
    Math.random().toString(36).substring(2, 8).toUpperCase() +
    Date.now().toString().slice(-8);
    
        // Mark processing
        await payoutRef.update({
            status: "processing",
            reference,
            approvedAt: FieldValue.serverTimestamp()
        });

        // Send to Chapa
        const transfer = await chapa.transfer({
            ...payout,
            id: payoutId,
            reference
        });

        if (!transfer.success) {

           await payoutRef.update({
    status: "failed",
    failureReason:
        typeof transfer.error === "string"
            ? transfer.error
            : JSON.stringify(transfer.error)
});

            return res.status(500).json({
                success: false,
                message: "Transfer failed",
                error: transfer.error
            });
        }

        // Waiting for webhook confirmation
      await payoutRef.update({
    status: "sent",
    transferReference: transfer.transferId || null
});

        return res.json({
            success: true,
            message: "Transfer submitted successfully.",
            reference
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }
}

/*
|--------------------------------------------------------------------------
| REJECT PAYOUT
|--------------------------------------------------------------------------
*/

async function verifyPayout(req, res) {
    try {

        const { payoutId } = req.body;

        if (!payoutId) {
            return res.status(400).json({
                success: false,
                message: "Missing payoutId"
            });
        }

        const payoutRef = db.collection("payout").doc(payoutId);
        const payoutDoc = await payoutRef.get();

        if (!payoutDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Payout not found"
            });
        }

        const payout = payoutDoc.data();

        if (!payout.reference) {
            return res.status(400).json({
                success: false,
                message: "No Chapa reference found."
            });
        }

        const verify = await chapa.verifyTransfer(
            payout.reference
        );

        if (!verify.success) {
            return res.status(500).json({
                success: false,
                error: verify.error
            });
        }

        const status = verify.data.status;

        if (status === "success") {

            await payoutRef.update({
                status: "paid",
                completedAt: FieldValue.serverTimestamp(),
                verifyResponse: verify.data
            });

        } else if (
            status === "failed" ||
            status === "cancelled"
        ) {

            await payoutRef.update({
                status: "failed",
                verifyResponse: verify.data
            });

        }

        return res.json({
            success: true,
            transferStatus: status,
            chapa: verify.data
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }
}

/*
|--------------------------------------------------------------------------
| GET ALL PAYOUTS
|--------------------------------------------------------------------------
*/

async function getPayouts(req, res) {

    try {

        const snapshot =
            await db
                .collection("payout")
                .orderBy("createdAt", "desc")
                .get();

        const payouts = [];

        snapshot.forEach(doc => {

            payouts.push({

                id: doc.id,

                ...doc.data()

            });

        });

        return res.json({

            success: true,

            total: payouts.length,

            payouts

        });

    }

    catch (err) {

        console.log(err);

        return res.status(500).json({

            success: false,

            error: err.message

        });

    }

}
module.exports = {
    approvePayout,
    rejectPayout,
    getPayouts,
    verifyPayout
};