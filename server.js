const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// Connect to SQLite database
const db = new sqlite3.Database('./dnd.db');

// Middleware to serve static files from the directory
app.use(express.static(path.join(__dirname)));

// Route to get macros
app.get('/macros', (req, res) => {
  db.all('SELECT * FROM macros', [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
