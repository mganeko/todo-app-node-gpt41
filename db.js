const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'todo.db');

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('DB connection error:', err.message);
    process.exit(1);
  }
  db.run(
    `CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'low'
    )`
  );
});

function getAllTodos() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM todos ORDER BY position ASC, id ASC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getTodoById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function createTodo(title, priority = 'low') {
  return new Promise((resolve, reject) => {
    db.get('SELECT MAX(position) AS maxPos FROM todos', (err, row) => {
      if (err) return reject(err);
      const pos = (row?.maxPos || 0) + 1;
      db.run(
        'INSERT INTO todos (title, completed, position, priority) VALUES (?, 0, ?, ?)',
        [title, pos, priority],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, title, completed: 0, position: pos, priority });
        }
      );
    });
  });
}

function updateTodo(id, title, completed, priority = 'low') {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE todos SET title = ?, completed = ?, priority = ? WHERE id = ?',
      [title, completed ? 1 : 0, priority, id],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
}

function deleteCompletedTodos() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM todos WHERE completed = 1', function (err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}

function deleteTodoById(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}

function updateTodoOrder(ids) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = db.prepare('UPDATE todos SET position = ? WHERE id = ?');
      ids.forEach((id, idx) => {
        stmt.run(idx, id);
      });
      stmt.finalize((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteCompletedTodos,
  deleteTodoById,
  updateTodoOrder,
};
