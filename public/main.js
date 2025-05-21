document.addEventListener('DOMContentLoaded', () => {
  const todoList = document.getElementById('todo-list');
  const todoForm = document.getElementById('todo-form');
  const todoTitle = document.getElementById('todo-title');
  const todoPriority = document.getElementById('todo-priority');

  let dragSrcEl = null;

  function saveOrder() {
    const ids = Array.from(todoList.children).map(li => Number(li.dataset.id));
    fetch('/api/todos/order', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
  }

  function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
    this.classList.add('dragging');
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e) {
    e.preventDefault();
    if (dragSrcEl && dragSrcEl !== this) {
      const list = this.parentNode;
      const srcIndex = Array.from(list.children).indexOf(dragSrcEl);
      const targetIndex = Array.from(list.children).indexOf(this);
      if (srcIndex < targetIndex) {
        list.insertBefore(dragSrcEl, this.nextSibling);
      } else {
        list.insertBefore(dragSrcEl, this);
      }
      saveOrder();
    }
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
  }

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
          li.draggable = true;
          li.addEventListener('dragstart', handleDragStart);
          li.addEventListener('dragover', handleDragOver);
          li.addEventListener('drop', handleDrop);
          li.addEventListener('dragend', handleDragEnd);

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = !!todo.completed;
          checkbox.addEventListener('change', () => toggleCompleted(todo, checkbox.checked));

          const span = document.createElement('span');
          span.textContent = todo.title;
          span.contentEditable = true;
          span.addEventListener('blur', () => updateTitle(todo, span.textContent));

          const prioritySelect = document.createElement('select');
          prioritySelect.className = 'priority-select';
          ['low', 'high'].forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p === 'low' ? '低' : '高';
            if (p === todo.priority) opt.selected = true;
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
    if (!title) return;
    const priority = todoPriority.value;
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
  function toggleCompleted(todo, completed) {
    fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: todo.title, completed, priority: todo.priority })
    })
      .then(() => fetchTodos());
  }

  // タイトル編集
  function updateTitle(todo, newTitle) {
    if (newTitle.trim() === '' || newTitle === todo.title) return;
    fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, completed: todo.completed, priority: todo.priority })
    })
      .then(() => fetchTodos());
  }

  function updatePriority(todo, newPriority) {
    fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: todo.title, completed: todo.completed, priority: newPriority })
    })
      .then(() => fetchTodos());
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
