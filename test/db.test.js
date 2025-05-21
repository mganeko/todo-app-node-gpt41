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
    const todo = await db.createTodo('test todo', 'high', '2030-01-01');
    expect(todo).toHaveProperty('id');
    expect(todo.title).toBe('test todo');
    expect(todo.completed).toBe(0);
    expect(todo.priority).toBe('high');
    expect(todo.due_date).toBe('2030-01-01');
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
    const changes = await db.updateTodo(todoId, 'updated', true, 'low', '2030-02-02');
    expect(changes).toBe(1);
    const todo = await db.getTodoById(todoId);
    expect(todo.title).toBe('updated');
    expect(todo.completed).toBe(1);
    expect(todo.priority).toBe('low');
    expect(todo.due_date).toBe('2030-02-02');
  });

  test('deleteCompletedTodos deletes completed todos', async () => {
    const changes = await db.deleteCompletedTodos();
    expect(typeof changes).toBe('number');
    const todos = await db.getAllTodos();
    expect(todos.find((t) => t.id === todoId)).toBeUndefined();
  });

  test('createTodo and deleteTodoById', async () => {
    const todo = await db.createTodo('to be deleted', 'low', '2030-03-03');
    const changes = await db.deleteTodoById(todo.id);
    expect(changes).toBe(1);
    const deleted = await db.getTodoById(todo.id);
    expect(deleted).toBeUndefined();
  });

  test('updateTodoOrder reorders todos', async () => {
    const t1 = await db.createTodo('order1', 'low', null);
    const t2 = await db.createTodo('order2', 'low', null);
    const t3 = await db.createTodo('order3', 'low', null);

    await db.updateTodoOrder([t3.id, t1.id, t2.id]);

    const todos = await db.getAllTodos();
    const ids = todos.map((t) => t.id);
    expect(ids).toEqual([t3.id, t1.id, t2.id]);
  });
});
