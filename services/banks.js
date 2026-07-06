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

        console.log("========== CHAPA BANK RESPONSE ==========");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("=========================================");

        bankCache = response.data.data || [];

        console.log(`Loaded ${bankCache.length} banks.`);

        return bankCache;

    } catch (err) {

        console.log("========== CHAPA BANK ERROR ==========");

        if (err.response) {
            console.log(err.response.data);
        } else {
            console.log(err.message);
        }

        console.log("======================================");

        return [];
    }
}

/*
|--------------------------------------------------------------------------
| Find Bank
|--------------------------------------------------------------------------
*/

async function findBank(bankName) {

    const banks = await getBanks();

    if (!bankName) {
        return null;
    }

    const search = bankName.toLowerCase().trim();

    // Exact match
    let bank = banks.find(
        b =>
            b.name &&
            b.name.toLowerCase().trim() === search
    );

    if (bank) return bank;

    // Partial match
    bank = banks.find(
        b =>
            b.name &&
            (
                b.name.toLowerCase().includes(search) ||
                search.includes(b.name.toLowerCase())
            )
    );

    if (bank) return bank;

    // Common aliases
    const aliases = {
        "cbe": "Commercial Bank of Ethiopia (CBE)",
        "commercial bank of ethiopia": "Commercial Bank of Ethiopia (CBE)",

        "boa": "Bank of Abyssinia",

        "awash": "Awash Bank",

        "dashen": "Dashen Bank",

        "telebirr": "telebirr",

        "hibret": "Hibret Bank",

        "abay": "Abay Bank",

        "coop": "Cooperative Bank of Oromia",

        "oromia": "Oromia Bank"
    };

    if (aliases[search]) {

        bank = banks.find(
            b =>
                b.name &&
                b.name.toLowerCase() === aliases[search].toLowerCase()
        );

        if (bank) {
            return bank;
        }
    }

    return null;
}

/*
|--------------------------------------------------------------------------
| Get Bank Code
|--------------------------------------------------------------------------
*/

async function getBankCode(bankName) {

    const bank = await findBank(bankName);

    if (!bank) {

        console.log(`Bank "${bankName}" not found.`);

        return null;
    }

    console.log(`Matched bank: ${bank.name}`);

    console.log(`Bank code: ${bank.id}`);

    return bank.id;
}

module.exports = {
    getBanks,
    findBank,
    getBankCode
};