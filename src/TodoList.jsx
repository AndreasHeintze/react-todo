import { useContext, useMemo } from 'react'
import { TodoContext } from './contexts/TodoContext'
import Todo from './Todo'

export default function TodoList() {
  const { todos } = useContext(TodoContext)

  const sortedTodos = useMemo(() => {
    return todos.filter((todo) => !todo.completed).sort((a, b) => a.sortOrder - b.sortOrder)
  }, [todos])

  const completedTodos = todos.filter((todo) => todo.completed).sort((a, b) => b.completedAt - a.completedAt)

  return (
    <>
      <ul className="@container space-y-2">
        {sortedTodos.map((todo) => {
          return (
            <li key={todo.id}>
              <Todo todo={todo} />
            </li>
          )
        })}
      </ul>
      <ul className="@container mt-2 space-y-2">
        {completedTodos.map((todo) => {
          return (
            <li key={todo.id}>
              <Todo todo={todo} />
            </li>
          )
        })}
      </ul>
    </>
  )
}
