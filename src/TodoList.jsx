import { useContext, useState } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TodoContext } from './contexts/TodoContext'
import Todo from './Todo'

const SortableTodo = function SortableTodo({ todo }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 1 : 'auto',
  }
  return <Todo todo={todo} ref={setNodeRef} style={style} attributes={attributes} listeners={listeners} />
}

export default function TodoList() {
  const { state, dispatch, activeTodos, completedTodos } = useContext(TodoContext)
  const [draggedTodo, setDraggedTodo] = useState(null)

  const activeTodoIds = activeTodos.map((todo) => todo.id)

  function handleDragStart(event) {
    const { active } = event
    const todo = activeTodos.find((todo) => todo.id === active.id)
    setDraggedTodo(todo)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setDraggedTodo(null)

    if (over && active.id !== over.id) {
      const oldIndex = activeTodoIds.indexOf(active.id)
      const newIndex = activeTodoIds.indexOf(over.id)

      const draggedTodo = activeTodos[oldIndex]
      const droppedOnTodo = activeTodos[newIndex]

      dispatch({ type: 'SORT_TODOS', payload: { draggedTodo, droppedOnTodo } })
    }
  }

  if (state.todos.size === 0) {
    return (
      <div className="py-8 text-center text-white @[640px]:text-inherit" role="status" aria-live="polite">
        No todos yet. Add one above to get started!
      </div>
    )
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggedTodo(null)}
    >
      <div role="region" aria-label="Todo lists">
        {/* Active Todos Section */}
        {activeTodos.length > 0 && (
          <section aria-labelledby="active-todos-heading">
            <h2 id="active-todos-heading" className="mb-2 text-sm font-medium text-white @[640px]:text-black">
              Active todos ({activeTodos.length})
            </h2>

            <SortableContext items={activeTodoIds} strategy={verticalListSortingStrategy}>
              <ul
                className="space-y-2"
                role="list"
                aria-label={`${activeTodos.length} active todo${activeTodos.length !== 1 ? 's' : ''}`}
              >
                {activeTodos.map((todo) => (
                  <li key={todo.id}>
                    <SortableTodo todo={todo} />
                  </li>
                ))}
              </ul>
            </SortableContext>
          </section>
        )}

        {/* Completed Todos Section */}
        {completedTodos.length > 0 && (
          <section aria-labelledby="completed-todos-heading" className={activeTodos.length > 0 ? 'mt-6' : ''}>
            <h2 id="completed-todos-heading" className="mb-2 text-sm font-medium text-white @[640px]:text-black">
              Completed ({completedTodos.length})
            </h2>

            <ul
              className="space-y-2"
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
      <DragOverlay>{draggedTodo ? <Todo todo={draggedTodo} /> : null}</DragOverlay>
    </DndContext>
  )
}
