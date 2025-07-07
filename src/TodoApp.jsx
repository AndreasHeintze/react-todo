import { useContext } from 'react'
import TodoList from './TodoList'
import { TodoContext } from './contexts/TodoContext'

export default function TodoApp() {
  const { newTodo, setNewTodo, handleTodoAdd } = useContext(TodoContext)

  return (
    <div className="mx-auto bg-transparent px-2 py-8 text-sm shadow-lg sm:rounded-lg sm:p-4 md:bg-white md:p-8 md:text-base">
      <h1 className="mt-2 mb-8 text-3xl font-semibold text-white md:text-black">Todo Tracker</h1>

      <form onSubmit={handleTodoAdd}>
        <div className="mb-8 flex text-base">
          <label htmlFor="todoInput" className="sr-only">
            Enter your todo title
          </label>
          <input
            id="todoInput"
            className="focus:ring-green-haze-500 focus:border-green-haze-500 mr-2 w-full rounded border border-gray-400 bg-white p-4 focus:ring-2 focus:outline-none"
            name="todoInput"
            value={newTodo}
            onChange={(ev) => setNewTodo(ev.target.value)}
            placeholder="Enter your todo title here"
            aria-describedby="todo-help"
            required
          />
          <button
            type="submit"
            className="bg-green-haze-500 hover:bg-green-haze-600 focus:ring-green-haze-500 flex w-20 cursor-pointer items-center justify-center rounded px-4 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:outline-none"
            aria-label="Add new todo"
          >
            Add
          </button>
        </div>
        <p id="todo-help" className="sr-only">
          Enter a title for your todo item and press Add or Enter to create it
        </p>
      </form>

      <TodoList />
    </div>
  )
}
