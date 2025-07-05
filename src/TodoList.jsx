import { useContext, useMemo } from 'react'
import { TodoContext } from './contexts/TodoContext'
import Todo from './Todo'

export default function TodoList() {
  const { todos } = useContext(TodoContext)

  const { activeTodos, completedTodos } = useMemo(() => {
    const active = todos.filter((todo) => !todo.completed).sort((a, b) => a.sortOrder - b.sortOrder)
    const completed = todos.filter((todo) => todo.completed).sort((a, b) => b.completedAt - a.completedAt)
    return { activeTodos: active, completedTodos: completed }
  }, [todos])

  if (todos.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500" role="status" aria-live="polite">
        No todos yet. Add one above to get started!
      </div>
    )
  }

  return (
    <div role="region" aria-label="Todo lists">
      {/* Active Todos Section */}
      {activeTodos.length > 0 && (
        <section aria-labelledby="active-todos-heading">
          <h2 id="active-todos-heading" className="mb-2 text-sm font-medium text-gray-600">
            Active todos ({activeTodos.length})
          </h2>
          <ul
            className="@container space-y-2"
            role="list"
            aria-label={`${activeTodos.length} active todo${activeTodos.length !== 1 ? 's' : ''}`}
          >
            {activeTodos.map((todo) => (
              <li key={todo.id}>
                <Todo todo={todo} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Completed Todos Section */}
      {completedTodos.length > 0 && (
        <section aria-labelledby="completed-todos-heading" className={activeTodos.length > 0 ? 'mt-6' : ''}>
          <h2 id="completed-todos-heading" className="mb-2 text-sm font-medium text-gray-600">
            Completed ({completedTodos.length})
          </h2>
          <ul
            className="@container space-y-2"
            role="list"
            aria-label={`${completedTodos.length} completed todo${completedTodos.length !== 1 ? 's' : ''}`}
          >
            {completedTodos.map((todo) => (
              <li key={todo.id}>
                <Todo todo={todo} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Status announcement for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeTodos.length > 0 && `${activeTodos.length} active todo${activeTodos.length !== 1 ? 's' : ''}`}
        {activeTodos.length > 0 && completedTodos.length > 0 && ', '}
        {completedTodos.length > 0 && `${completedTodos.length} completed todo${completedTodos.length !== 1 ? 's' : ''}`}
      </div>
    </div>
  )
}
