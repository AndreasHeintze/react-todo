import { useRef, useState, useEffect, useContext, forwardRef } from 'react'
import { TodoContext } from './contexts/TodoContext'
import { formatTimeSpent, roundMs } from './helpers'
import { Edit, Timer, Trash2, LoaderCircle } from 'lucide-react'

const TodoButtons = forwardRef(({ todo }, ref) => {
  const { handleTodoSave, handleTodoToggleTimer, handleTodoDelete } = useContext(TodoContext)
  const buttonsRef = useRef(null)

  // Update tick every second
  const [, setTick] = useState(0)
  const intervalId = useRef(null)
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

  // Use a re-render to calculate time
  const totalTime = todo.timeSpent + (todo.isTimerRunning && todo.startTime ? roundMs(Date.now()) - roundMs(todo.startTime) : 0)

  return (
    <div ref={buttonsRef} className="ml-2 flex items-center justify-end gap-3">
      {/** Total time spent */}
      <button
        type="button"
        ref={ref}
        role="timer"
        className="relative flex h-11 min-w-11 cursor-pointer items-center justify-end rounded border border-transparent p-1 text-right font-mono text-sm text-stone-600 transition-colors duration-200 hover:border-stone-300 hover:bg-stone-100 focus:ring-2 focus:ring-stone-500 focus:outline-none"
        onClick={(ev) => handleTodoSave(ev, todo, { mode: todo.mode === 'timelog' ? 'list' : 'timelog' })}
        aria-label={`Time spent: ${formatTimeSpent(totalTime)}`}
      >
        {formatTimeSpent(totalTime)}

        {/** Todo timer running indicator */}
        {todo.isTimerRunning && (
          <span className="absolute -right-[10px] z-0 flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
          </span>
        )}
      </button>

      {/** Edit button */}
      <button
        type="button"
        className={`flex h-11 w-11 items-center justify-center rounded border p-1 font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          todo.completed
            ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400'
            : 'cursor-pointer border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100'
        }`}
        onClick={(ev) => handleTodoSave(ev, todo, { mode: todo.mode === 'edit' ? 'list' : 'edit' })}
        disabled={todo.completed}
        aria-label={`Edit todo: ${todo.title}`}
      >
        <Edit size={24} aria-hidden="true" />
      </button>

      {/** Timer button */}
      <button
        type="button"
        className={`flex h-11 w-11 items-center justify-center rounded border p-1 font-medium whitespace-nowrap transition-colors duration-200 focus:ring-2 focus:ring-amber-500 focus:outline-none ${
          todo.completed
            ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400'
            : 'cursor-pointer border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100'
        }`}
        onClick={(ev) => handleTodoToggleTimer(ev, todo)}
        disabled={todo.completed}
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
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded border border-red-200 bg-red-50 p-1 font-medium text-red-600 transition-colors duration-200 hover:border-red-300 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none"
        onClick={(ev) => handleTodoDelete(ev, todo)}
        aria-label={`Delete todo: ${todo.title}`}
      >
        <Trash2 size={24} aria-hidden="true" />
      </button>
    </div>
  )
})

TodoButtons.displayName = 'TodoButtons'

export default TodoButtons
