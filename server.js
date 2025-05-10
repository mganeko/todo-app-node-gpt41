const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'todo.db');

// ミドルウェア
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DB初期化
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

// REST API

// 一覧取得
app.get('/api/todos', (req, res) => {
  db.all('SELECT * FROM todos', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 単一取得
app.get('/api/todos/:id', (req, res) => {
  db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// 新規作成
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  db.run('INSERT INTO todos (title, completed) VALUES (?, 0)', [title], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, title, completed: 0 });
  });
});

// 更新
app.put('/api/todos/:id', (req, res) => {
  const { title, completed } = req.body;
  db.run(
    'UPDATE todos SET title = ?, completed = ? WHERE id = ?',
    [title, completed ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ id: Number(req.params.id), title, completed: completed ? 1 : 0 });
    }
  );
});

// 完了済みタスクを一括削除
app.delete('/api/todos/completed', (req, res) => {
  console.log('Clear completed todos');
  db.run('DELETE FROM todos WHERE completed = 1', function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).end();
  });
});

// 削除
app.delete('/api/todos/:id', (req, res) => {
  db.run('DELETE FROM todos WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  });
});



// サーバー起動（テスト時は起動しない）
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
