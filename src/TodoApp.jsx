import {useContext} from "react"
import TodoList from "./TodoList"
import {TodoContext} from "./contexts/TodoContext"

export default function TodoApp() {
  const {
    newTodo,
    setNewTodo,
    handleTodoAdd,
  } = useContext(TodoContext)

   return (
    <div className="border p-8 rounded-lg mx-auto bg-stone-50">
      
      <h2 className="mx-4 mt-2 mb-8 text-2xl font-bold">Todo-Planner</h2>
      
      <form onSubmit={handleTodoAdd}>
        <div className="flex p-2 mb-6">
          <input className="px-2 py-2 mr-2 rounded bg-white border-gray-400 border w-full" name="todoInput" value={newTodo} onChange={(ev) => setNewTodo(ev.target.value)} placeholder="Enter your todo description here" />
          <button className="flex justify-center items-center w-20 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded shadow-sm cursor-pointer hover:shadow-md transition-all duration-200">Add</button>
        </div>
      </form>

      <TodoList />
    </div>
  )
}
