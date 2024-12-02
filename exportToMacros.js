const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Open the database connection to dnd.db
let db = new sqlite3.Database('./dnd.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the dnd.db database.');
});

// Query the data from the database
db.all("SELECT * FROM macros", [], (err, rows) => {
  if (err) {
    console.error('Error querying the database:', err.message);
    return;
  }

  // Convert the rows to JSON format
  const jsonData = JSON.stringify(rows, null, 2);

  // Write the JSON data to a file called macros.json
  fs.writeFile('macros.json', jsonData, (err) => {
    if (err) {
      console.error('Error writing to file:', err.message);
    } else {
      console.log('Data successfully exported to macros.json');
    }
  });
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing the database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});
