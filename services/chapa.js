const axios = require("axios");

async function transfer(payout) {
    try {
        const reference = "CHEER_" + payout.id;

        const response = await axios.post(
            "https://api.chapa.co/v1/transfers",
            {
                account_name: payout.bankUserName,
                account_number: payout.bankNumber,
                amount: payout.amount,
                currency: "ETB",
                reference,
                bank_code: "CBE"
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return {
            success: true,
            reference
        };

    } catch (error) {
        console.log("CHAPA ERROR:", error.response?.data || error.message);

        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}

module.exports = { transfer };