import { forwardRef } from 'react'
import { useTodoContext } from './contexts/TodoContext'
import { formatTimeSpent, calcTotalTime } from './helpers'
import type { Todo } from './types'

interface TodoTimeSpentProps {
  todo: Todo
}

const TodoTimeSpent = forwardRef<HTMLButtonElement, TodoTimeSpentProps>(({ todo }, ref) => {
  const { state, dispatch } = useTodoContext()
  const totalTime = calcTotalTime(todo, state.timeLog)

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
        <span className="relative -left-0.5 flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
        </span>
      )}

      {formatTimeSpent(totalTime)}
    </button>
  )
})

export default TodoTimeSpent
