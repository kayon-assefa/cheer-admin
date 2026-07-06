require("dotenv").config();

const express = require("express");
const cors = require("cors");

const payoutRoutes = require("./routes/payout");
const webhookRoutes = require("./routes/webhook");
const bankRoutes = require("./routes/banks");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "running",
        project: "Cheer ET API",
        version: "1.0.0"
    });
});

app.use("/admin", payoutRoutes);
app.use("/webhook", webhookRoutes);
app.use("/banks", bankRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});