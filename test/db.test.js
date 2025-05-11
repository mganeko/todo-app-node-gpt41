const fs = require('fs');
const path = require('path');

// メモリDBを利用
process.env.DB_FILE = ':memory:';
const db = require('../db');

beforeAll((done) => {
  // メモリDBは毎回新規なので特別な初期化不要
  setTimeout(done, 100); // Wait for table creation
});

afterAll((done) => {
  // メモリDBは自動で破棄される
  done();
});

describe('DB module', () => {
  let todoId;

  test('createTodo inserts a new todo', async () => {
    const todo = await db.createTodo('test todo');
    expect(todo).toHaveProperty('id');
    expect(todo.title).toBe('test todo');
    expect(todo.completed).toBe(0);
    todoId = todo.id;
  });

  test('getAllTodos returns todos', async () => {
    const todos = await db.getAllTodos();
    expect(Array.isArray(todos)).toBe(true);
    expect(todos.length).toBeGreaterThan(0);
  });

  test('getTodoById returns the correct todo', async () => {
    const todo = await db.getTodoById(todoId);
    expect(todo).toBeDefined();
    expect(todo.id).toBe(todoId);
    expect(todo.title).toBe('test todo');
  });

  test('updateTodo updates a todo', async () => {
    const changes = await db.updateTodo(todoId, 'updated', true);
    expect(changes).toBe(1);
    const todo = await db.getTodoById(todoId);
    expect(todo.title).toBe('updated');
    expect(todo.completed).toBe(1);
  });

  test('deleteCompletedTodos deletes completed todos', async () => {
    const changes = await db.deleteCompletedTodos();
    expect(typeof changes).toBe('number');
    const todos = await db.getAllTodos();
    expect(todos.find((t) => t.id === todoId)).toBeUndefined();
  });

  test('createTodo and deleteTodoById', async () => {
    const todo = await db.createTodo('to be deleted');
    const changes = await db.deleteTodoById(todo.id);
    expect(changes).toBe(1);
    const deleted = await db.getTodoById(todo.id);
    expect(deleted).toBeUndefined();
  });
});
