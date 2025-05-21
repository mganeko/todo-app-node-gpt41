document.addEventListener('DOMContentLoaded', () => {
  const todoList = document.getElementById('todo-list');
  const todoForm = document.getElementById('todo-form');
  const todoTitle = document.getElementById('todo-title');
  const todoPriority = document.getElementById('todo-priority');

  // ToDo一覧取得
  function fetchTodos() {
    fetch('/api/todos')
      .then(res => res.json())
      .then(todos => {
        todoList.innerHTML = '';
        todos.forEach(todo => {
          const li = document.createElement('li');
          li.className = 'todo-item' + (todo.completed ? ' completed' : '');
          li.dataset.id = todo.id;

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = !!todo.completed;
          checkbox.addEventListener('change', () => toggleCompleted(todo, checkbox.checked));

          const span = document.createElement('span');
          span.textContent = todo.title;
          span.contentEditable = true;
          span.addEventListener('blur', () => updateTitle(todo, span.textContent));

          const prioritySelect = document.createElement('select');
          ['low', 'high'].forEach(level => {
            const opt = document.createElement('option');
            opt.value = level;
            opt.textContent = level;
            if (todo.priority === level) opt.selected = true;
            prioritySelect.appendChild(opt);
          });
          prioritySelect.addEventListener('change', () => updatePriority(todo, prioritySelect.value));

          const delBtn = document.createElement('button');
          delBtn.textContent = '削除';
          delBtn.className = 'delete-btn';
          delBtn.addEventListener('click', () => deleteTodo(todo.id));

          li.appendChild(checkbox);
          li.appendChild(span);
          li.appendChild(prioritySelect);
          li.appendChild(delBtn);
          todoList.appendChild(li);
        });
      });
  }

  // ToDo新規作成
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = todoTitle.value.trim();
    const priority = todoPriority.value;
    if (!title) return;
    fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority })
    })
      .then(res => res.json())
      .then(() => {
        todoTitle.value = '';
        todoPriority.value = 'low';
        fetchTodos();
      });
  });

  // ToDo削除
  function deleteTodo(id) {
    fetch(`/api/todos/${id}`, { method: 'DELETE' })
      .then(() => fetchTodos());
  }

  // ToDo完了状態切り替え
  function updateTodo(todo, data) {
    fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title !== undefined ? data.title : todo.title,
        completed: data.completed !== undefined ? data.completed : todo.completed,
        priority: data.priority !== undefined ? data.priority : todo.priority,
      }),
    }).then(() => fetchTodos());
  }

  function toggleCompleted(todo, completed) {
    updateTodo(todo, { completed });
  }

  // タイトル編集
  function updateTitle(todo, newTitle) {
    if (newTitle.trim() === '' || newTitle === todo.title) return;
    updateTodo(todo, { title: newTitle });
  }

  function updatePriority(todo, newPriority) {
    updateTodo(todo, { priority: newPriority });
  }

  // 完了済みタスク一括削除
  const clearCompletedBtn = document.getElementById('clear-completed');
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      console.log('Clear completed button clicked');
      fetch('/api/todos/completed', { method: 'DELETE' })
        .then(() => fetchTodos());
    });
  }
  else {
    console.error('Clear completed button not found');
  }

  fetchTodos();
});
