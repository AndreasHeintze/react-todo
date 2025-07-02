import {useContext, useRef, useState, useEffect} from "react"
import {TodoContext} from "./contexts/TodoContext"
import CheckBox from "./CheckBox"
import Spinner from './Spinner'
import {formatTime} from './helpers'

export default function Todo({todo}) {
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

  const [localTime, setLocalTime] = useState(Date.now())
  const lastUpdateTime = useRef(localTime)
  const animationFrameId = useRef()

  // Update localTime every second
  useEffect(() => {
    if (!todo.isTimerRunning) {
      // Stop animation when timer stops
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      return
    }

    // Start animation loop for this specific Todo
    const animate = () => {
      const now = Date.now()
      if (now - lastUpdateTime.current >= 1000) {
        setLocalTime(now)
        lastUpdateTime.current = now
      }
      animationFrameId.current = requestAnimationFrame(animate)
    }
    animationFrameId.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [todo.isTimerRunning])
  
  // Use localTime for calculations
  const totalTime = todo.timeSpent + 
    (todo.isTimerRunning && todo.startTime ? localTime - todo.startTime : 0)

  return (
    <div className={`flex items-center p-2 rounded bg-white m-2 border-l-4 ${todo.isTimerRunning ? 'border-l-red-500 shadow' : 'border-l-transparent'}`}>
      
      {/** Todo completed checkbox */}
      <CheckBox todo={todo} onTodoCompleted={() => handleTodoCompleted(todo, todo.isTimerRunning ? localTime : undefined)} />
      
      {/** Todo description text */}
      <div className="px-2 py-1 w-full mr-2 h-8 rounded"
        ref={descrRef}
        onInput={handleTodoContentEditable}
        onBlur={(ev) => handleTodoSave(todo, ev.target.innerText.trim())}
        onDoubleClick={() => handleTodoDoubleClick(todo)}
        suppressContentEditableWarning={true}
        contentEditable={todo.editMode ? 'plaintext-only' : 'false'}
        style={{
          textDecoration: todo.completed ? 'line-through' : '',
          opacity: todo.completed ? 0.5 : 1,
          cursor: todo.editMode || todo.completed ? 'text' : 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
        title={todo.editMode ? '' : 'Du kan dubbelklicka för att editera.'}
      >{todo.descr}</div>
      
      {/** Total time spent */}
      <div className="flex justify-end font-mono text-sm mr-2 w-24">{formatTime(totalTime)}</div>

      {/** Edit button */}
      <button 
        className={`px-3 py-1 mr-2 font-medium rounded border h-8 flex items-center transition-all duration-200 ${
          todo.completed 
            ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 cursor-pointer hover:border-blue-300'
        }`}
        onClick={() => handleTodoEdit(todo)}
        disabled={todo.completed}
      >
        Edit
      </button>

      {/** Timer button */}
      <button 
        className={`relative px-3 py-1 mr-2 font-medium rounded border w-48 h-8 flex justify-center items-center whitespace-nowrap transition-all duration-200 ${
          todo.completed 
            ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
            : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200 cursor-pointer hover:border-amber-300'
        }`}
        onClick={() => handleTodoToggleTimer(todo, todo.isTimerRunning ? localTime : undefined)}
        disabled={todo.completed}
        title={todo.isTimerRunning ? 'Click to stop timer' : ''}
      >
        {todo.isTimerRunning && <Spinner className="!absolute left-2 border-amber-600" />}

        {todo.isTimerRunning ? 'Stop timer' : 'Start timer'}
      </button>

      {/** Delete button */}
      <button className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded border border-red-200 cursor-pointer hover:border-red-300 transition-all duration-200 h-8 flex items-center" onClick={() => handleTodoDelete(todo)}>Delete</button>
    </div>
  )
}
