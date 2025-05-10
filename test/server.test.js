process.env.DB_FILE = ':memory:';
const request = require('supertest');
const app = require('../server');

describe('Todo REST API', () => {
  let createdId;

  // DBを初期化するため、テスト前にcompletedタスクを削除
  beforeAll(async () => {
    await request(app).delete('/api/todos/completed');
  });

  it('POST /api/todos 新規作成', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'テストタスク' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('テストタスク');
    expect(res.body.completed).toBe(0);
    createdId = res.body.id;
  });

  it('GET /api/todos 一覧取得', async () => {
    const res = await request(app)
      .get('/api/todos')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(todo => todo.id === createdId)).toBe(true);
  });

  it('GET /api/todos/:id 単一取得', async () => {
    const res = await request(app)
      .get(`/api/todos/${createdId}`)
      .expect(200);
    expect(res.body.id).toBe(createdId);
    expect(res.body.title).toBe('テストタスク');
  });

  it('PUT /api/todos/:id 更新', async () => {
    const res = await request(app)
      .put(`/api/todos/${createdId}`)
      .send({ title: '更新タスク', completed: true })
      .expect(200);
    expect(res.body.title).toBe('更新タスク');
    expect(res.body.completed).toBe(1);
  });

  it('DELETE /api/todos/:id 削除', async () => {
    await request(app)
      .delete(`/api/todos/${createdId}`)
      .expect(204);

    // 削除後は404
    await request(app)
      .get(`/api/todos/${createdId}`)
      .expect(404);
  });

  it('POST /api/todos バリデーション', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({})
      .expect(400);
    expect(res.body.error).toBe('Title is required');
  });
  
  it('DELETE /api/todos/completed 完了済みタスク一括削除', async () => {
    // 2つのタスクを追加
    const res1 = await request(app)
      .post('/api/todos')
      .send({ title: '完了タスク1' })
      .expect(201);
    const res2 = await request(app)
      .post('/api/todos')
      .send({ title: '完了タスク2' })
      .expect(201);

    // タスク数を取得して覚える
    const beforeRes = await request(app)
      .get('/api/todos')
      .expect(200);
    const beforeCount = beforeRes.body.length;

    // 2つのタスクを完了に
    await request(app)
      .put(`/api/todos/${res1.body.id}`)
      .send({ title: res1.body.title, completed: true })
      .expect(200);
    await request(app)
      .put(`/api/todos/${res2.body.id}`)
      .send({ title: res2.body.title, completed: true })
      .expect(200);

    // 完了済みタスクを一括削除
    await request(app)
      .delete('/api/todos/completed')
      .expect(204);

    // タスク数を再取得
    const afterRes = await request(app)
      .get('/api/todos')
      .expect(200);
    const afterCount = afterRes.body.length;

    // 最初に覚えたタスクの数から2つ減っていることを確認
    expect(afterCount).toBe(beforeCount - 2);
  });

});
