const express = require("express");
const router = express.Router();

const { approvePayout } = require("../controllers/payoutController");

router.post("/approve-payout", approvePayout);

module.exports = router;