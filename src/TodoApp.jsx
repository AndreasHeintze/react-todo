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
     <div className="mx-auto bg-white p-2 shadow-lg sm:rounded-lg sm:p-4 md:p-8">
       <h2 className="mt-2 mb-8 text-3xl font-semibold">Todo Tracker</h2>

       <form onSubmit={handleTodoAdd}>
         <div className="mb-8 flex">
           <input
             className="mr-2 w-full rounded border border-gray-400 bg-white px-2 py-2"
             name="todoInput"
             value={newTodo}
             onChange={(ev) => setNewTodo(ev.target.value)}
             placeholder="Enter your todo description here"
           />
           <button className="flex w-20 cursor-pointer items-center justify-center rounded bg-green-600 px-4 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md">
             Add
           </button>
         </div>
       </form>

       <TodoList />
     </div>
   )
}
