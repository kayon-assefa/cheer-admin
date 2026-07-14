const axios = require("axios");
const banks = require("./banks");

const CHAPA_TRANSFER_URL = "https://api.chapa.co/v1/transfers";
const CHAPA_VERIFY_URL = "https://api.chapa.co/v1/transfers/verify";

async function transfer(payout) {
    try {
        const bankCode = await banks.getBankCode(payout.method);

        if (!bankCode) {
            return {
                success: false,
                error: `Bank "${payout.method}" not found on Chapa`
            };
        }

        const payload = {
            account_name: payout.bankUserName,
            account_number: payout.bankNumber,
            amount: payout.amount,
            currency: "ETB",
            reference: payout.reference,
            bank_code: bankCode
        };

        const response = await axios.post(
            CHAPA_TRANSFER_URL,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return {
            success: true,
            transferId:
                response.data?.data?.chapa_transfer_id ||
                response.data?.data?.id ||
                null,
            reference: payout.reference,
            data: response.data
        };

    } catch (err) {

        return {
            success: false,
            error: err.response?.data || err.message
        };

    }
}

async function verifyTransfer(reference) {

    try {

        const response = await axios.get(
            `${CHAPA_VERIFY_URL}/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
                }
            }
        );
console.log("========== VERIFY RESPONSE ==========");
console.log(JSON.stringify(response.data, null, 2));
console.log("=====================================");
       return {
  success: true,
  status: response.data.status,
  data: response.data.data,
  raw: response.data
};

    } catch (err) {

        return {
            success: false,
            error: err.response?.data || err.message
        };

    }

}

module.exports = {
    transfer,
    verifyTransfer
};