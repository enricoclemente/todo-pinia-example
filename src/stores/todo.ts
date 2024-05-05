import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { ITodo } from '@/interfaces';

function toggleProp(prop: 'important' | 'done', id: string, todo: ITodo) {
  return todo.id === id ? { ...todo, [prop]: !todo[prop] } : todo;
}

export const useTodoStoreOld = defineStore('todo', () => {
  const todos = ref<ITodo[]>([]);

  function addTodo(todo: ITodo) {
    todos.value.push(todo);
  }

  function removeTodo(id: string) {
    todos.value = todos.value.filter((todo: ITodo) => todo.id !== id);
  }

  function toggleDone(id: string) {
    console.log("MIMMO" + id)
    todos.value = todos.value.map((todo) => toggleProp('done', id, todo));
  }

  function toggleImportant(id: string) {
    todos.value = todos.value.map((todo) => toggleProp('important', id, todo));
  }

  const doneTodosCount = computed(() => todos.value.filter((todo) => todo.done).length);
  const importantTodosCount = computed(() => todos.value.filter((todo) => todo.important).length);
  const activeTodosCount = computed(() => todos.value.filter((todo) => !todo.done).length);

  return {
    addTodo,
    removeTodo,
    toggleDone,
    toggleImportant,
    doneTodosCount,
    importantTodosCount,
    activeTodosCount,
    todos
  };
});

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as ITodo[]
  }),
  actions: {
    async getTodos() {
      try {
        const response = await fetch('http://localhost:5000/api/todos')
        this.todos = await response.json()
      } catch (error) {
        console.error('Error fetching todos:', error)
      }
    },
    async addTodo(todo: ITodo) {
      try {
        const response = await fetch('http://localhost:5000/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ todo })
        })
        const newTodo = await response.json()
        this.todos.push(newTodo)
        console.log(this.todos)
      } catch (error) {
        console.error('Error creating todo:', error)
      }
    },
    async toggleDone(id: string) {
      const updatedTodo = toggleProp('done', id, this.todos.find(todo => todo.id === id) as ITodo)
      this.updateTodo(id, {done: updatedTodo.done, important: updatedTodo.important})
    },
    async toggleImportant(id: string) {
      const updatedTodo = toggleProp('important', id, this.todos.find(todo => todo.id === id) as ITodo)
      this.updateTodo(id, {done: updatedTodo.done, important: updatedTodo.important})
    },
    async updateTodo(id: string, updates: Partial<ITodo>) {
      try {
        const response = await fetch(`http://localhost:5000/api/todos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        })
        const updatedTodo = await response.json()
        const index = this.todos.findIndex(todo => todo.id === id)
        this.todos[index] = updatedTodo
      } catch (error) {
        console.error('Error updating todo:', error)
      }
    },
    async removeTodo(id: string) {
      try {
        await fetch(`http://localhost:5000/api/todos/${id}`, {
          method: 'DELETE'
        })
        this.todos = this.todos.filter(todo => todo.id !== id)
      } catch (error) {
        console.error('Error deleting todo:', error)
      }
    }
  },
  getters: {
    doneTodosCount: (state) => state.todos.filter((todo) => todo.done).length,
    importantTodosCount: (state) => state.todos.filter((todo) => todo.important).length,
    activeTodosCount: (state) => state.todos.filter((todo) => !todo.done).length
  }
})