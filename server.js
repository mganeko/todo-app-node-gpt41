const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// ミドルウェア
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// REST API

// 一覧取得
app.get('/api/todos', async (req, res) => {
  try {
    const rows = await db.getAllTodos();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 単一取得
app.get('/api/todos/:id', async (req, res) => {
  try {
    const row = await db.getTodoById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 新規作成
app.post('/api/todos', async (req, res) => {
  const { title, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const p = priority === 'high' ? 'high' : 'low';
  try {
    const todo = await db.createTodo(title, p, due_date);
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 順序更新
app.put('/api/todos/order', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
  try {
    await db.updateTodoOrder(ids);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新
app.put('/api/todos/:id', async (req, res) => {
  const { title, completed, priority, due_date } = req.body;
  const p = priority === 'high' ? 'high' : 'low';
  try {
    const changes = await db.updateTodo(req.params.id, title, completed, p, due_date);
    if (changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ id: Number(req.params.id), title, completed: completed ? 1 : 0, priority: p, due_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 完了済みタスクを一括削除
app.delete('/api/todos/completed', async (req, res) => {
  try {
    await db.deleteCompletedTodos();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 削除
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const changes = await db.deleteTodoById(req.params.id);
    if (changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// サーバー起動（テスト時は起動しない）
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
