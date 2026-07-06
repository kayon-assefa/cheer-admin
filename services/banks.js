const axios = require("axios");

const CHAPA_BANKS_URL = "https://api.chapa.co/v1/banks";

let bankCache = null;

/*
|--------------------------------------------------------------------------
| Get all banks from Chapa
|--------------------------------------------------------------------------
*/

async function getBanks() {

    try {

        if (bankCache) {
            return bankCache;
        }

        const response = await axios.get(
            CHAPA_BANKS_URL,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        bankCache = response.data.data || [];

        console.log(`Loaded ${bankCache.length} banks from Chapa.`);

        return bankCache;

    }

    catch (err) {

        console.log("Failed to load banks");

        console.log(err.response?.data || err.message);

        return [];

    }

}

/*
|--------------------------------------------------------------------------
| Find bank by name
|--------------------------------------------------------------------------
*/

async function findBank(bankName) {

    const banks = await getBanks();

    const bank = banks.find(b =>
        b.name
            ?.toLowerCase()
            .trim() ===
        bankName
            ?.toLowerCase()
            .trim()
    );

    return bank || null;

}

/*
|--------------------------------------------------------------------------
| Get only bank code
|--------------------------------------------------------------------------
*/

async function getBankCode(bankName) {

    const bank = await findBank(bankName);

    if (!bank) {
        return null;
    }

    return bank.id || bank.code || bank.bank_code;

}

module.exports = {

    getBanks,

    findBank,

    getBankCode

};