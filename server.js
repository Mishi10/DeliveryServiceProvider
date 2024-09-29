const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const dataPath = path.join(__dirname, 'data', 'companies.json');

// Middleware to parse incoming requests with JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static HTML files
app.use(express.static(path.join(__dirname)));
app.use('/delivery-service-provider', express.static(path.join(__dirname, 'delivery-service-provider')));

// Helper function to ensure file exists and is initialized with an empty array if empty or missing
function ensureDataFileExists() {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, '[]', 'utf8');  // Initialize with empty array
    }
}

// Endpoint to get all companies (delivery service providers)
app.get('/delivery-service-providers', (req, res) => {
    ensureDataFileExists();  // Make sure the file exists before reading

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }

        // If the file is empty, return an empty array
        const providers = data.trim() ? JSON.parse(data) : [];
        res.json(providers);
    });
});

// Endpoint to save new company data (from 'create.html' form submission)
app.post('/delivery-service-providers', (req, res) => {
    const newCompany = req.body;

    ensureDataFileExists();  // Ensure the file exists before reading

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }

        // If the file is empty, initialize it as an empty array
        const providers = data.trim() ? JSON.parse(data) : [];
        providers.push(newCompany);

        // Write the updated data back to the file
        fs.writeFile(dataPath, JSON.stringify(providers, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save data' });
            }
            res.json({ message: 'Company saved successfully' });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
