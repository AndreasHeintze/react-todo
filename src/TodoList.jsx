import {useContext, useMemo} from "react"
import {TodoContext} from "./contexts/TodoContext"
import Todo from "./Todo"

export default function TodoList() {
  const {todos} = useContext(TodoContext)

  const sortedTodos = useMemo(() => {
    const uncompleted = todos.filter(todo => !todo.completed).sort((a, b) => a.sortOrder - b.sortOrder)
    const completed = todos.filter(todo => todo.completed).sort((a, b) => b.completedAt - a.completedAt)
    return [...uncompleted, ...completed]
  }, [todos])

  return (
    <ul>
      {
        sortedTodos.map((todo) => {
          return (
            <li key={todo.id}>
              <Todo todo={todo} />
            </li>
          )
        })
      }
    </ul>
  )
}
