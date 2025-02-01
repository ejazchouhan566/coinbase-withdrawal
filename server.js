require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const API_KEY = process.65174f01-ff69-48c5-a0c6-cfc4ed9d56f6; // Store API Key securely

app.post('/withdraw', async (req, res) => {
    const { user_id, amount, currency } = req.body;

    if (amount < 1) {
        return res.status(400).json({ success: false, message: "Minimum withdrawal is $1." });
    }

    try {
        const response = await axios.post(
            'https://api.coinbase.com/v2/accounts/YOUR_ACCOUNT_ID/withdrawals',
            { amount, currency },
            { headers: { Authorization: `Bearer ${API_KEY}` } }
        );

        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Withdrawal failed", error: error.response.data });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
