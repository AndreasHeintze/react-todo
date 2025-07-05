import { useContext, useRef, useState, useEffect } from 'react'
import { Edit, Timer, Trash2 } from 'lucide-react'
import { TodoContext } from './contexts/TodoContext'
import CheckBox from './CheckBox'
import { formatTime } from './helpers'
import { LoaderCircle } from 'lucide-react'

export default function Todo({ todo }) {
  const descrRef = useRef(null)
  const {
    handleTodoEdit,
    handleTodoSave,
    handleTodoCompleted,
    handleTodoDelete,
    handleTodoToggleTimer,
    handleTodoDoubleClick,
    handleTodoContentEditable,
    handleTodoContentEditableKeyDown,
  } = useContext(TodoContext)

  useEffect(() => {
    // Focus description and select all text
    if (descrRef.current && todo.editMode) {
      descrRef.current.focus()
      // Select text
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(descrRef.current)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }, [todo.editMode])

  const [, setTick] = useState(0)
  const intervalId = useRef()

  // Update tick every second
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
  }, [todo.isTimerRunning])

  // Use a re-render to calculate time
  const totalTime = todo.timeSpent + (todo.isTimerRunning && todo.startTime ? Date.now() - todo.startTime : 0)

  return (
    <div
      className={`flex flex-wrap justify-between gap-4 rounded border-l-4 bg-white p-3 @min-2xl:flex-nowrap ${todo.isTimerRunning || !todo.isTimerRunning ? 'shadow-tiny border-l-red-500' : 'border-l-transparent'}`}
    >
      <div className="flex items-center gap-3">
        {/** Todo completed checkbox */}
        <CheckBox todo={todo} onTodoCompleted={() => handleTodoCompleted(todo)} />

        {/** Todo description text */}
        <div
          className="line-clamp-3 min-w-60 overflow-hidden rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none @min-xl:line-clamp-2 @min-3xl:line-clamp-1"
          ref={descrRef}
          onKeyDown={(ev) => handleTodoContentEditableKeyDown(ev, todo)}
          onInput={handleTodoContentEditable}
          onBlur={(ev) => handleTodoSave(ev, todo)}
          onDoubleClick={() => handleTodoDoubleClick(todo)}
          suppressContentEditableWarning={true}
          contentEditable={todo.editMode ? 'plaintext-only' : 'false'}
          style={{
            textDecoration: todo.completed ? 'line-through' : '',
            opacity: todo.completed ? 0.5 : 1,
            cursor: todo.editMode || todo.completed ? 'text' : 'pointer',
          }}
          title={todo.editMode ? '' : 'Double-click to edit'}
          aria-label={todo.editMode ? 'Edit todo description' : `Todo: ${todo.descr}`}
          role={todo.editMode ? 'textbox' : 'button'}
          tabIndex={todo.editMode ? 0 : -1}
          aria-multiline="false"
          aria-describedby={todo.editMode ? `todo-${todo.id}-hint` : undefined}
        >
          {todo.descr}
        </div>

        {/* Screen reader hint for edit mode */}
        {todo.editMode && (
          <div id={`todo-${todo.id}-hint`} className="sr-only">
            Press Enter to save
          </div>
        )}
      </div>

      <div className="flex grow items-center justify-end gap-3">
        {/** Total time spent */}
        <div
          className="flex w-24 justify-end text-right font-mono text-sm"
          aria-label={`Time spent: ${formatTime(totalTime)}`}
          role="timer"
        >
          {formatTime(totalTime)}
        </div>

        {/** Edit button */}
        <button
          type="button"
          className={`flex h-8 items-center rounded border p-1 font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            todo.completed
              ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400'
              : 'cursor-pointer border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100'
          }`}
          onClick={() => handleTodoEdit(todo)}
          disabled={todo.completed}
          aria-label={`Edit todo: ${todo.descr}`}
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
          aria-label={todo.isTimerRunning ? `Stop timer for todo: ${todo.descr}` : `Start timer for todo: ${todo.descr}`}
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
          aria-label={`Delete todo: ${todo.descr}`}
        >
          <Trash2 size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
