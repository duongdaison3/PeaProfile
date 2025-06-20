// Simple server to serve experience data from JSON file
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
const port = process.env.PORT || 3001;

app.get('/experiences', (req, res) => {
    const filePath = path.join(__dirname, 'exp.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading exp.json:', err);
            return res.status(500).json({ error: 'Unable to read experience data' });
        }
        try {
            const raw = JSON.parse(data);
            let experiences = raw;
            if (Array.isArray(raw)) {
                const tableObj = raw.find(item => item.type === 'table' && item.name === 'exp');
                if (tableObj && Array.isArray(tableObj.data)) {
                    experiences = tableObj.data;
                }
            }
            res.json(experiences);
        } catch (e) {
            console.error('Error parsing exp.json:', e);
            res.status(500).json({ error: 'Invalid experience data' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
