const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'dnd.db');  // Correct the path to your database file

function exportToJson() {
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.all(`
      SELECT 
        m.*, 
        CASE 
          WHEN ss.subcategory_id IS NOT NULL THEN GROUP_CONCAT(DISTINCT s.name)
          ELSE m.subcategory
        END AS subcategories,
        GROUP_CONCAT(DISTINCT sl.name) AS spell_levels
      FROM macros m
      LEFT JOIN spell_subcategories ss ON m.id = ss.spell_id
      LEFT JOIN subcategories s ON s.id = ss.subcategory_id
      LEFT JOIN macro_spell_levels ms ON m.id = ms.macro_id
      LEFT JOIN spell_levels sl ON sl.id = ms.spell_level_id
      GROUP BY m.id
      ORDER BY m.name ASC
    `, [], (err, rows) => {
      if (err) {
        console.error("Error fetching data: ", err);
        return;
      }

      fs.writeFileSync('macros.json', JSON.stringify(rows, null, 2));
      console.log("Data exported successfully to macros.json.");
    });
  });

  db.close();
}

exportToJson();
