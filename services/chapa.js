const axios = require("axios");
const banks = require("./banks");

const CHAPA_URL = "https://api.chapa.co/v1/transfers";

async function transfer(payout) {
    try {

        /*
        |--------------------------------------------------------------------------
        | Find bank code from Chapa
        |--------------------------------------------------------------------------
        */

        const bankCode = await banks.getBankCode(
            payout.method
        );

        if (!bankCode) {
            return {
                success: false,
                error: `Bank "${payout.method}" not found on Chapa`
            };
        }

        /*
        |--------------------------------------------------------------------------
        | Build Payload
        |--------------------------------------------------------------------------
        */

        const payload = {
            account_name: payout.bankUserName,
            account_number: payout.bankNumber,
            amount: payout.amount,
            currency: "ETB",
            reference: payout.reference,
            bank_code: bankCode
        };

        console.log("=================================");
        console.log("Sending Transfer To Chapa");
        console.log(payload);
        console.log("=================================");

        /*
        |--------------------------------------------------------------------------
        | Send Transfer
        |--------------------------------------------------------------------------
        */

        const response = await axios.post(
            CHAPA_URL,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("========== CHAPA RESPONSE ==========");
        console.log(response.data);
        console.log("====================================");

        return {
            success: true,

            transferId:
                response.data?.data?.id ||
                response.data?.data?.transfer_id ||
                null,

            reference:
                payout.reference,

            response:
                response.data
        };

    } catch (error) {

        console.log("========== CHAPA ERROR ==========");

        if (error.response) {

            console.log(error.response.data);

            return {
                success: false,
                error: error.response.data
            };

        }

        console.log(error.message);

        return {
            success: false,
            error: error.message
        };

    }
}

module.exports = {
    transfer
};