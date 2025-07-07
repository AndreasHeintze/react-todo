import { forwardRef, useContext, useRef, useImperativeHandle, useState, useEffect } from 'react'
import { Edit, Timer, Trash2, GripVertical } from 'lucide-react'
import { TodoContext } from './contexts/TodoContext'
import CheckBox from './CheckBox'
import { formatTime } from './helpers'
import { LoaderCircle } from 'lucide-react'

const Todo = forwardRef(({ todo, style, attributes, listeners }, ref) => {
  const {
    handleTodoEdit,
    handleTodoSave,
    handleTodoCompleted,
    handleTodoDelete,
    handleTodoToggleTimer,
    handleTodoDoubleClick,
    handleTodoContentEditable,
  } = useContext(TodoContext)

  const todoRef = useRef(null)
  const todoTitleRef = useRef(null)
  const totalTimeRef = useRef(null)
  const [titleWidth, setTitleWidth] = useState(0)

  useImperativeHandle(ref, () => todoRef.current)

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
  }, [todo.isTimerRunning])

  // Calc <title-width> = <todo-width> - <timer-width> - 92
  useEffect(() => {
    // Calculate on todo change
    calculateWidth()

    // Also calculate on window resize
    window.addEventListener('resize', calculateWidth)

    function calculateWidth() {
      if (todoRef.current && totalTimeRef.current) {
        const spacer = todoRef.current.offsetWidth > 671 ? 220 : 92
        const newTitleWidth = todoRef.current.offsetWidth - totalTimeRef.current.offsetWidth - spacer
        setTitleWidth(newTitleWidth)
      }
    }

    return () => window.removeEventListener('resize', calculateWidth)
  }, [todo])

  // If editMode, focus the todo title and select all text
  useEffect(() => {
    if (todo.editMode && todoTitleRef.current) {
      todoTitleRef.current.focus()
      // Select text
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(todoTitleRef.current)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }, [todo.editMode])

  // Use a re-render to calculate time
  const totalTime = todo.timeSpent + (todo.isTimerRunning && todo.startTime ? Date.now() - todo.startTime : 0)

  return (
    <div
      ref={todoRef}
      style={style}
      className={`${todo.color} scrollbar-hide shadow-tiny flex snap-x snap-mandatory items-center justify-between gap-4 overflow-x-auto rounded border-l-5 bg-white p-3 pl-2`}
    >
      <div className="flex min-w-[200px] flex-shrink-0 snap-end items-center justify-start gap-2">
        {/** Drag handle */}
        {!todo.completed && (
          <div {...attributes} {...listeners} className="cursor-grab" aria-label="Drag to reorder">
            <GripVertical size={20} className="text-gray-400" />
          </div>
        )}
        {/** Some space */}
        {todo.completed && <div className="size-[20px] min-w-[20px]"></div>}

        {/** Todo completed checkbox */}
        <CheckBox todo={todo} onTodoCompleted={() => handleTodoCompleted(todo)} />

        {/** Todo title text */}
        <div
          className={`line-clamp-1 max-w-[144px] rounded p-1 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          ref={todoTitleRef}
          onKeyDown={(ev) => handleTodoContentEditable(ev, todo)}
          onBlur={(ev) => handleTodoSave(ev, todo)}
          onDoubleClick={() => handleTodoDoubleClick(todo)}
          suppressContentEditableWarning={true}
          contentEditable={todo.editMode ? 'plaintext-only' : 'false'}
          style={{
            minWidth: titleWidth,
            textDecoration: todo.completed ? 'line-through' : '',
            opacity: todo.completed ? 0.5 : 1,
            cursor: todo.editMode || todo.completed ? 'text' : 'pointer',
          }}
          title={todo.editMode ? '' : 'Double-click to edit'}
          aria-label={todo.editMode ? 'Edit todo title' : `Todo: ${todo.title}`}
          role={todo.editMode ? 'textbox' : 'button'}
          tabIndex={todo.editMode ? 0 : -1}
          aria-multiline="false"
          aria-describedby={todo.editMode ? 'todo-hint' : undefined}
        >
          {todo.title}
        </div>

        {/* Screen reader hint for edit mode */}
        {todo.editMode && (
          <div id="todo-hint" className="sr-only">
            Press Enter to save
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 snap-start items-center justify-end gap-3">
        {/** Total time spent */}
        <div
          ref={totalTimeRef}
          role="timer"
          className="flex items-center justify-end text-right font-mono text-sm"
          aria-label={`Time spent: ${formatTime(totalTime)}`}
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
    </div>
  )
})

Todo.displayName = 'Todo'

export default Todo
