const sqlite3 = require('sqlite3').verbose();
const DB_FILE = process.env.DB_FILE || 'todo.db';

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.all("PRAGMA table_info(todos)", (err, rows) => {
    if (err) {
      console.error(err.message);
      db.close();
      process.exit(1);
    }
    const hasPosition = rows.some((r) => r.name === 'position');
    if (hasPosition) {
      console.log('Migration not needed: position column already exists.');
      db.close();
      return;
    }

    db.run(
      'ALTER TABLE todos ADD COLUMN position INTEGER NOT NULL DEFAULT 0',
      (err) => {
        if (err) {
          console.error('Failed to add column:', err.message);
          db.close();
          process.exit(1);
        }
        db.run('UPDATE todos SET position = id', (err) => {
          if (err) {
            console.error('Failed to initialize position values:', err.message);
            db.close();
            process.exit(1);
          }
          console.log('Migration completed: position column added.');
          db.close();
        });
      }
    );
  });
});
