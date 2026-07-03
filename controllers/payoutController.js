const { db } = require("../config/firebaseAdmin");
const chapa = require("../services/chapa");
const { FieldValue } = require("firebase-admin/firestore");

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
                message: "Not pending"
            });
        }

        // mark processing FIRST
        await payoutRef.update({
            status: "processing",
            reference: "CHEER_" + payoutId
        });

        const result = await chapa.transfer({
            ...payout,
            id: payoutId
        });

        if (!result.success) {
            await payoutRef.update({
                status: "failed",
                failureReason: result.error
            });

            return res.status(500).json(result);
        }

        await payoutRef.update({
            status: "sent",
            transferReference: result.reference,
            approvedAt: FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            reference: result.reference
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

module.exports = { approvePayout };