const express = require("express");
const router = express.Router();

const { getBanks } = require("../services/banks");

router.get("/", async (req, res) => {
    try {

        const banks = await getBanks();

        res.json({
            success: true,
            total: banks.length,
            banks
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
});

module.exports = router;