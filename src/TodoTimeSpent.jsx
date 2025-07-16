import { forwardRef, useState, useContext, useRef, useEffect } from 'react'
import { TodoContext } from './contexts/TodoContext'
import { formatTimeSpent, roundMs } from './helpers'

const TodoTimeSpent = forwardRef(({ todo }, ref) => {
  const { dispatch } = useContext(TodoContext)

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

  // Use a re-render to calculate time
  const totalTime = todo.timeSpent + (todo.isTimerRunning && todo.startTime ? roundMs(Date.now()) - roundMs(todo.startTime) : 0)

  return (
    <button
      type="button"
      ref={ref}
      role="timer"
      onClick={() =>
        dispatch({ type: 'SAVE_TODO', payload: { todo, data: { mode: todo.mode === 'timelog' ? 'list' : 'timelog' } } })
      }
      className="flex h-11 min-w-11 cursor-pointer items-center justify-end rounded border border-transparent p-1 text-right font-mono text-sm transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-500 focus:outline-none"
      title={`Click to ${todo.mode === 'timelog' ? 'close' : 'view'} time log`}
      aria-label={`Time spent: ${formatTimeSpent(totalTime)}`}
    >
      {/** Todo timer running indicator */}
      {todo.isTimerRunning && (
        <span className="relative -left-[2px] flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
        </span>
      )}

      {formatTimeSpent(totalTime)}
    </button>
  )
})

TodoTimeSpent.displayName = 'TodoTimeSpent'

export default TodoTimeSpent
