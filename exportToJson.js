const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./dnd.db');

db.serialize(() => {
  db.all('SELECT * FROM macros', [], (err, rows) => {
    if (err) {
      throw err;
    }

    const jsonData = JSON.stringify(rows, null, 2);
    fs.writeFileSync('macros.json', jsonData);
    console.log('JSON data has been saved to macros.json');
  });
});

db.close();