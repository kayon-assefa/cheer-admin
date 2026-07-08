const express = require("express");
const router = express.Router();

const {
    chapaWebhook
} = require("../controllers/webhookController");

router.post("/chapa", chapaWebhook);

module.exports = router;