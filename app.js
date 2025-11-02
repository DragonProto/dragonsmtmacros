const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from 'public' directory if you have any
app.use(express.static('public'));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Route to display macros
app.get('/', (req, res) => {
    // Read macros.json file
    fs.readFile(path.join(__dirname, 'macros.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading macros.json:', err);
            return res.status(500).send('Error reading macros');
        }

        try {
            const macros = JSON.parse(data);
            res.render('index', { macros: macros });
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).send('Error parsing macros data');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});