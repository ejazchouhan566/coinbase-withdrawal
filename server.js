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
require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool(process.env.DATABASE_URL + "?ssl={" +
    '"rejectUnauthorized":true' +
    "}"
).promise();

async function createTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS withdrawals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(10) NOT NULL,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await pool.query(query);
}

createTable().then(() => console.log("Database Ready")).catch(console.error);
app.get('/withdrawals/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC",
            [user_id]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error: error.message });
    }
});
app.post('/withdraw', async (req, res) => {
    const { user_id, amount, currency } = req.body;

    if (amount < 1) {
        return res.status(400).json({ success: false, message: "Minimum withdrawal is $1." });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO withdrawals (user_id, amount, currency, status) VALUES (?, ?, ?, 'pending')",
            [user_id, amount, currency]
        );

        res.json({ success: true, data: { id: result.insertId, user_id, amount, currency, status: 'pending' } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error: error.message });
    }
});
app.put('/withdrawals/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
    }

    try {
        await pool.query(
            "UPDATE withdrawals SET status = ? WHERE id = ?",
            [status, id]
        );

        res.json({ success: true, message: `Withdrawal ${status} successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error: error.message });
    }
});

