import {useRef, useEffect} from "react"
import CheckBox from "./CheckBox"
import Spinner from './Spinner'
import {formatTime} from './helpers'

export default function Todo({
  todo,
  currentTime,
  onTodoSave,
  onTodoEdit,
  onTodoDelete,
  onTodoToggleTimer,
  onTodoCompleted
}) {
  const descrRef = useRef(null)
  
  useEffect(() => {
    if (descrRef.current && todo.editMode) {
      descrRef.current.focus()
      // Select text
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(descrRef.current)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }, [todo])

  // Calculate total time
  let totalTime = todo.timeSpent
  if (todo.isTimerRunning && todo.startTime) {
    totalTime = totalTime + (currentTime - todo.startTime)
  }

  function handleTodoDoubleClick() {
    if (!todo.editMode) {
      onTodoEdit(todo)
    }
  }

  function handleTodoInput(ev) {
    const enterPressed = ev.target.innerText.indexOf('\n') !== -1
    if (enterPressed) {
      const singleLine = ev.target.innerText.replace(/\n/g, '')
      ev.target.innerText = singleLine
      ev.target.blur()
    }
  }
  
  function handleTodoBlur(ev) {
    onTodoSave(todo, ev.target.innerText.trim())
  }

  return (
    <div className="flex items-center">
      
      <CheckBox todo={todo} onTodoCompleted={onTodoCompleted} />
      
      <div className="px-2 py-1 w-full mr-2 h-8 rounded"
        ref={descrRef}
        onInput={handleTodoInput}
        onBlur={handleTodoBlur}
        onDoubleClick={handleTodoDoubleClick}
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
      
      <div className="flex justify-end font-mono text-sm mr-2 w-24">{formatTime(totalTime)}</div>

      <button 
        className={`px-3 py-1 mr-2 font-medium rounded border h-8 flex items-center transition-all duration-200 ${
          todo.completed 
            ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 cursor-pointer hover:border-blue-300'
        }`}
        onClick={() => onTodoEdit(todo)}
        disabled={todo.completed}
      >
        Edit
      </button>

      <button 
        className={`relative px-3 py-1 mr-2 font-medium rounded border w-48 h-8 flex justify-center items-center whitespace-nowrap transition-all duration-200 ${
          todo.completed 
            ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
            : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200 cursor-pointer hover:border-amber-300'
        }`}
        onClick={() => onTodoToggleTimer(todo)}
        disabled={todo.completed}
        title={todo.isTimerRunning ? 'Click to stop timer' : ''}
      >
        {todo.isTimerRunning && <Spinner className="!absolute left-2 border-amber-600" />}

        {todo.isTimerRunning ? 'Stop timer' : 'Start timer'}
      </button>

      <button className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded border border-red-200 cursor-pointer hover:border-red-300 transition-all duration-200 h-8 flex items-center" onClick={() => onTodoDelete(todo)}>Delete</button>
    </div>
  )
}
