import { useRef, useEffect, useContext, forwardRef } from 'react'
import { TodoContext } from './contexts/TodoContext'
import { Edit, Timer, Trash2, LoaderCircle } from 'lucide-react'
import TodoTimeSpent from './TodoTimeSpent'

const TodoButtons = forwardRef(({ todo }, ref) => {
  const { dispatch } = useContext(TodoContext)
  const buttonsRef = useRef(null)

  /**
   * This is a workaround for iPhone (IOS) to prevent todos
   * ending up swiped to the right when completing/un-completing
   * Which happens if I place the class directly on the element.
   */
  useEffect(() => {
    setTimeout(() => {
      buttonsRef.current.classList.add('snap-end')
    }, 10)
  }, [])

  return (
    <div ref={buttonsRef} className="ml-2 flex items-center justify-end gap-3">
      {/** Total time spent */}
      <TodoTimeSpent ref={ref} todo={todo} />

      {/** Edit button */}
      <button
        type="button"
        onClick={() => dispatch({ type: 'SAVE_TODO', payload: { todo, data: { mode: todo.mode === 'edit' ? 'list' : 'edit' } } })}
        disabled={todo.isCompleted}
        className={`flex h-11 w-11 items-center justify-center rounded border p-1 font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          todo.isCompleted
            ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400'
            : 'cursor-pointer border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100'
        }`}
        aria-label={`Edit todo: ${todo.title}`}
      >
        <Edit size={24} aria-hidden="true" />
      </button>

      {/** Timer button */}
      <button
        type="button"
        onClick={() => dispatch({ type: 'TOGGLE_TIMER', payload: { todo } })}
        disabled={todo.isCompleted}
        className={`flex h-11 w-11 items-center justify-center rounded border p-1 font-medium whitespace-nowrap transition-colors duration-200 focus:ring-2 focus:ring-amber-500 focus:outline-none ${
          todo.isCompleted
            ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400'
            : 'cursor-pointer border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100'
        }`}
        aria-label={todo.isTimerRunning ? `Stop timer for todo: ${todo.title}` : `Start timer for todo: ${todo.title}`}
      >
        {!todo.isTimerRunning && <Timer size={26} aria-hidden="true" />}

        {todo.isTimerRunning && (
          <div className="relative" aria-label="Timer is running">
            <LoaderCircle size={26} className="animate-spin" aria-hidden="true" />
            <div className="absolute top-[9px] left-[9px] size-2 bg-current" aria-hidden="true"></div>
          </div>
        )}
      </button>

      {/** Delete button */}
      <button
        type="button"
        onClick={() => dispatch({ type: 'DELETE_TODO', payload: { id: todo.id } })}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded border border-red-200 bg-red-50 p-1 font-medium text-red-600 transition-colors duration-200 hover:border-red-300 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none"
        aria-label={`Delete todo: ${todo.title}`}
      >
        <Trash2 size={24} aria-hidden="true" />
      </button>
    </div>
  )
})

TodoButtons.displayName = 'TodoButtons'

export default TodoButtons
