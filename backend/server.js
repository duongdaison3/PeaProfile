// Import necessary modules
const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3001; // Use port from environment or default to 3000

// MySQL Connection Configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // Default MySQL port
    // ssl: { // Uncomment and configure if Freehostia requires SSL
    //   rejectUnauthorized: false // Adjust as per Freehostia's SSL requirements
    // }
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection (optional, but good for initial setup)
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error connecting to the database:', err.stack);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('👉 Check your username and password in the .env file.');
        }
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
            console.error('👉 Check your DB_HOST and DB_PORT in the .env file. Ensure the database server is running and accessible.');
            console.error('👉 If connecting remotely, ensure Freehostia allows remote connections from your IP and you are using the correct remote hostname.');
        }
        return;
    }
    if (connection) {
        console.log(`🎉 Successfully connected to the database '${process.env.DB_NAME}' as ID ${connection.threadId}`);
        connection.release(); // Release the connection back to the pool
    }
});

// Middleware to parse JSON bodies
app.use(express.json());

// --- NEW/MODIFIED ROUTE TO READ FROM 'exp' TABLE ---
app.get('/experiences', (req, res) => {
    const sqlQuery = 'SELECT * FROM exp'; // Query to select all data from the 'exp' table

    pool.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error fetching data from exp table:', err);
            // Send a more detailed error response for debugging if needed,
            // but be cautious about exposing too much error detail in production.
            return res.status(500).json({
                error: 'Error fetching data from database',
                details: err.message // Optional: include error message for debugging
            });
        }
        // If data is fetched successfully
        console.log(`Successfully fetched ${results.length} records from 'exp' table.`);
        res.json(results);
    });
});

// Example of another route (if you need it)
app.get('/', (req, res) => {
    res.send('Welcome to the API! Visit /experiences to see data from the exp table.');
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`👉 Try accessing: http://localhost:${port}/experiences`);
});