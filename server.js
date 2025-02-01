require('dotenv').config(); // Load environment variables

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); 

// Load API Key from environment
const API_KEY = process.env.COINBASE_API_KEY;

const PORT = process.env.PORT || 3000; // Use Railway's port or default to 3000

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
