const express = require("express");
const router = express.Router();
const { db } = require("../config/firebaseAdmin");

router.post("/chapa", async (req, res) => {
    try {
        const data = req.body;

        const reference = data.reference;
        const status = data.status;

        if (!reference) return res.status(400).send("No reference");

        const snap = await db.collection("payout")
            .where("reference", "==", reference)
            .get();

        if (snap.empty) return res.status(404).send("Not found");

        const doc = snap.docs[0];

        await doc.ref.update({
            status: status === "success" ? "paid" : "failed",
            webhook: data,
            paidAt: new Date()
        });

        res.sendStatus(200);

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;