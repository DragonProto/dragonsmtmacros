const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path to your database
const dbPath = path.join(__dirname, 'dnd.db');
// Path to your JSON file
const jsonPath = path.join(__dirname, 'macros.json');

function exportToJson() {
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.all(`
      SELECT macros.*, 
             CASE 
               WHEN spell_subcategories.subcategory_id IS NOT NULL THEN GROUP_CONCAT(subcategories.name, ', ')
               ELSE macros.subcategory
             END AS subcategories,
             macros.macrocodecrit  -- Ensure this field is selected
      FROM macros
      LEFT JOIN spell_subcategories ON macros.id = spell_subcategories.spell_id
      LEFT JOIN subcategories ON subcategories.id = spell_subcategories.subcategory_id
      GROUP BY macros.id
      ORDER BY macros.name ASC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching data: ', err);
        return;
      }

      // Sort subcategories alphabetically
      rows.forEach(row => {
        if (row.subcategories) {
          row.subcategories = row.subcategories.split(', ').sort().join(', ');
        }
      });

      const jsonData = JSON.stringify(rows, null, 2);
      fs.writeFileSync(jsonPath, jsonData);
      console.log('JSON data has been saved to macros.json');
    });
  });

  db.close();
}

exportToJson();
