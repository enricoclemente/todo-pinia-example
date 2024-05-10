import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { ITodo } from '@/interfaces';

function toggleProp(prop: 'important' | 'done', id: string, todo: ITodo) {
  return todo.id === id ? { ...todo, [prop]: !todo[prop] } : todo;
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as ITodo[],
    error: false,
  }),
  actions: {
    async getTodos() {
      try {
        const response = await fetch('http://localhost:5000/api/todos')
        this.todos = await response.json()
        console.debug("Get all todos")
        console.debug(this.todos)
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
        this.error = false
        console.debug("Added todo")
        console.debug(newTodo)
      } catch (error) {
        this.error = true
        console.error('Error creating todo:', error)
      }
    },
    async updateTodoInfo(id: string, updates: Partial<ITodo>) {
      this.updateTodo(id, updates)
    },
    async toggleDone(id: string) {
      const updatedTodo = toggleProp('done', id, this.todos.find(todo => todo.id === id) as ITodo)
      this.updateTodo(id, {done: updatedTodo.done})
    },
    async toggleImportant(id: string) {
      const updatedTodo = toggleProp('important', id, this.todos.find(todo => todo.id === id) as ITodo)
      this.updateTodo(id, {important: updatedTodo.important})
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
        this.error = false
        console.debug("Updated todo")
        console.debug(updatedTodo)
      } catch (error) {
        this.error = true
        console.error('Error updating todo:', error)
      }
    },
    async removeTodo(id: string) {
      try {
        await fetch(`http://localhost:5000/api/todos/${id}`, {
          method: 'DELETE'
        })
        this.todos = this.todos.filter(todo => todo.id !== id)
        this.error = false
        console.debug("Deleted todo with id: " + id)
      } catch (error) {
        this.error = true
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