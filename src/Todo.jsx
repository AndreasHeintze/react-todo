import {useContext, useRef, useState, useEffect} from "react"
import { Edit, Timer, Trash2 } from 'lucide-react'
import { TodoContext } from './contexts/TodoContext'
import CheckBox from './CheckBox'
import Spinner from './Spinner'
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
      className={`my-2 flex justify-between gap-4 rounded border-l-4 bg-white p-3 @max-2xl:flex-wrap ${todo.isTimerRunning ? 'shadow-tiny border-l-red-500' : 'border-l-transparent'}`}
    >
      <div className="flex items-center gap-3">
        {/** Todo completed checkbox */}
        <CheckBox todo={todo} onTodoCompleted={() => handleTodoCompleted(todo)} />

        {/** Todo description text */}
        <div
          className="line-clamp-1 min-w-60 overflow-hidden rounded"
          ref={descrRef}
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
          title={todo.editMode ? '' : 'Du kan dubbelklicka för att editera.'}
        >
          {todo.descr}
        </div>
      </div>

      <div className="flex grow items-center justify-end gap-3">
        {/** Total time spent */}
        <div className="flex w-24 justify-end text-right font-mono text-sm">{formatTime(totalTime)}</div>

        {/** Edit button */}
        <button
          className={`flex h-8 items-center rounded border p-1 font-medium transition-all duration-200 ${
            todo.completed
              ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400'
              : 'cursor-pointer border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100'
          }`}
          onClick={() => handleTodoEdit(todo)}
          disabled={todo.completed}
        >
          <Edit size={20} />
        </button>

        {/** Timer button */}
        <button
          className={`flex h-8 items-center rounded border p-1 font-medium whitespace-nowrap transition-all duration-200 ${
            todo.completed
              ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400'
              : 'cursor-pointer border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100'
          }`}
          onClick={() => handleTodoToggleTimer(todo)}
          disabled={todo.completed}
          title={todo.isTimerRunning ? 'Click to stop timer' : ''}
        >
          {!todo.isTimerRunning && <Timer size={20} />}

          {todo.isTimerRunning && (
            <div className="relative">
              <LoaderCircle size={20} className="animate-spin" />
              <div className="absolute top-[7px] left-[7px] size-1.5 bg-current"></div>
            </div>
          )}
        </button>

        {/** Delete button */}
        <button
          className="flex h-8 cursor-pointer items-center rounded border border-red-200 bg-red-50 p-1 font-medium text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100"
          onClick={() => handleTodoDelete(todo)}
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  )
}
