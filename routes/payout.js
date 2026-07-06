const express = require("express");
const router = express.Router();

const {
    approvePayout,
    rejectPayout,
    getPayouts
} = require("../controllers/payoutController");

/*
|--------------------------------------------------------------------------
| Payout Routes
|--------------------------------------------------------------------------
*/

// Get all payout requests
router.get("/payouts", getPayouts);

// Approve a payout
router.post("/approve-payout", approvePayout);

// Reject a payout
router.post("/reject-payout", rejectPayout);

module.exports = router;