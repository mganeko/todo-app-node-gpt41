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
    const hasPriority = rows.some((r) => r.name === 'priority');

    if (hasPosition && hasPriority) {
      console.log('Migration not needed: columns already exist.');
      db.close();
      return;
    }

    const tasks = [];

    if (!hasPosition) {
      tasks.push((cb) =>
        db.run('ALTER TABLE todos ADD COLUMN position INTEGER NOT NULL DEFAULT 0', cb)
      );
      tasks.push((cb) => db.run('UPDATE todos SET position = id', cb));
    }

    if (!hasPriority) {
      tasks.push((cb) =>
        db.run("ALTER TABLE todos ADD COLUMN priority TEXT NOT NULL DEFAULT 'low'", cb)
      );
    }

    function next() {
      const task = tasks.shift();
      if (!task) {
        console.log('Migration completed.');
        db.close();
        return;
      }
      task((err) => {
        if (err) {
          console.error('Migration error:', err.message);
          db.close();
          process.exit(1);
        }
        next();
      });
    }

    next();
  });
});
