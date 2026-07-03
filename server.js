require("dotenv").config();

const express = require("express");
const cors = require("cors");

const payoutRoutes = require("./routes/payout");
const webhookRoutes = require("./routes/webhook");

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});