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
      completed INTEGER NOT NULL DEFAULT 0
    )`
  );
});

function getAllTodos() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM todos', (err, rows) => {
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

function createTodo(title) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO todos (title, completed) VALUES (?, 0)', [title], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, title, completed: 0 });
    });
  });
}

function updateTodo(id, title, completed) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE todos SET title = ?, completed = ? WHERE id = ?',
      [title, completed ? 1 : 0, id],
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

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteCompletedTodos,
  deleteTodoById,
};
