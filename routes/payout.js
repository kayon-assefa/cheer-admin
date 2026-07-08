const express = require("express");
const router = express.Router();

const {
    approvePayout,
    rejectPayout,
    getPayouts,
    verifyPayout
} = require("../controllers/payoutController");

/*
|--------------------------------------------------------------------------
| Payout Routes
|--------------------------------------------------------------------------
*/


// Get all payout requests
router.get("/payouts", getPayouts);

// Approve payout
router.post("/approve-payout", approvePayout);

// Reject payout
router.post("/reject-payout", rejectPayout);

// Verify payout with Chapa
router.post("/verify-payout", verifyPayout);


module.exports = router; 