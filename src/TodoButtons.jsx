import { useRef, useState, useEffect, useContext, forwardRef } from 'react'
import { TodoContext } from './contexts/TodoContext'
import { formatTime } from './helpers'
import { Edit, Timer, Trash2, LoaderCircle } from 'lucide-react'

const TodoButtons = forwardRef(({ todo }, ref) => {
  const { handleTodoSave, handleTodoToggleTimer, handleTodoDelete } = useContext(TodoContext)

  // Update tick every second
  const [, setTick] = useState(0)
  const intervalId = useRef()
  useEffect(() => {
    if (!todo.isTimerRunning) {
      // Stop interval when timer stops
      if (intervalId.current) {
        clearInterval(intervalId.current)
        intervalId.current = null
      }
      return
    }

    // Start interval for this specific Todo
    intervalId.current = setInterval(() => {
      setTick((prevTick) => prevTick + 1)
    }, 1000)

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
  }, [todo.isTimerRunning, todo.startTime])

  // Use a re-render to calculate time
  const totalTime = todo.timeSpent + (todo.isTimerRunning && todo.startTime ? Date.now() - todo.startTime : 0)

  return (
    <div className="ml-2 flex snap-start items-center justify-end gap-3">
      {/** Total time spent */}
      <button
        type="button"
        ref={ref}
        role="timer"
        className="flex h-8 cursor-pointer items-center justify-end rounded border border-transparent p-1 text-right font-mono text-sm text-stone-600 transition-colors duration-200 hover:border-stone-300 hover:bg-stone-100 focus:ring-2 focus:ring-stone-500 focus:outline-none"
        onClick={(ev) => handleTodoSave(ev, todo, { mode: todo.mode === 'timelog' ? 'list' : 'timelog' })}
        aria-label={`Time spent: ${formatTime(totalTime)}`}
      >
        {formatTime(totalTime)}
      </button>

      {/** Edit button */}
      <button
        type="button"
        className={`flex h-8 items-center rounded border p-1 font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          todo.completed
            ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400'
            : 'cursor-pointer border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100'
        }`}
        onClick={(ev) => handleTodoSave(ev, todo, { mode: todo.mode === 'edit' ? 'list' : 'edit' })}
        disabled={todo.completed}
        aria-label={`Edit todo: ${todo.title}`}
      >
        <Edit size={20} aria-hidden="true" />
      </button>

      {/** Timer button */}
      <button
        type="button"
        className={`flex h-8 items-center rounded border p-1 font-medium whitespace-nowrap transition-colors duration-200 focus:ring-2 focus:ring-amber-500 focus:outline-none ${
          todo.completed
            ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400'
            : 'cursor-pointer border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100'
        }`}
        onClick={() => handleTodoToggleTimer(todo)}
        disabled={todo.completed}
        aria-label={todo.isTimerRunning ? `Stop timer for todo: ${todo.title}` : `Start timer for todo: ${todo.title}`}
      >
        {!todo.isTimerRunning && <Timer size={20} aria-hidden="true" />}

        {todo.isTimerRunning && (
          <div className="relative" aria-label="Timer is running">
            <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
            <div className="absolute top-[7px] left-[7px] size-1.5 bg-current" aria-hidden="true"></div>
          </div>
        )}
      </button>

      {/** Delete button */}
      <button
        type="button"
        className="flex h-8 cursor-pointer items-center rounded border border-red-200 bg-red-50 p-1 font-medium text-red-600 transition-colors duration-200 hover:border-red-300 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none"
        onClick={() => handleTodoDelete(todo)}
        aria-label={`Delete todo: ${todo.title}`}
      >
        <Trash2 size={20} aria-hidden="true" />
      </button>
    </div>
  )
})

TodoButtons.displayName = 'TodoButtons'

export default TodoButtons
