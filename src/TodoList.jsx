import {useContext} from "react"
import {TodoContext} from "./contexts/TodoContext"
import Todo from "./Todo"

export default function TodoList() {
  const {todos} = useContext(TodoContext)

  return (
    <ul>
      {
        todos.toReversed().map((todo) => {
          return (
            <li className={`p-2 ${todo.isTimerRunning ? 'bg-stone-100' : ''}`} key={todo.id}>
              <Todo todo={todo} />
            </li>
          )
        })
      }
    </ul>
  )
}