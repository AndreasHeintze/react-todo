import {useEffect, useState, useRef} from "react"
import TodoList from './TodoList'
import {useUniqueId, usePersistedState} from './helpers'

export default function TodoApp() {
  const generateId = useUniqueId()
  const [newTodo, setNewTodo] = usePersistedState('todo', '')
  const [todos, setTodos] = usePersistedState('todos', [])
  const [currentTime, setCurrentTime] = useState(Date.now())
  const lastUpdateTime = useRef(currentTime)
  const animationFrameId = useRef();

  useEffect(() => {
    // Funktion som körs på varje frame
    const animate = () => {
      const now = Date.now();
      if (now - lastUpdateTime.current >= 1000) {
        setCurrentTime(now)
        lastUpdateTime.current = now
      }
      // Schemalägg funktionen att köras igen på nästa frame
      animationFrameId.current = requestAnimationFrame(animate)
    }

    // Starta animationsloopen
    animationFrameId.current = requestAnimationFrame(animate)

    // 3. Städfunktion: Avbryt animationen när komponenten tas bort
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  function handleTodoAdd(ev) {
    ev.preventDefault()
    
    const descr = newTodo.trim()
    if (!descr) {
      return
    }

    setTodos([...todos, {
      id: generateId(),
      descr,
      timeSpent: 0,
      startTime: null,
      isTimerRunning: false,
      editMode: false,
      completed: false,
    }])

    setNewTodo('')
  }

  function handleTodoEdit(todo) {
    if (todo.completed) return

    setTodos(todos.map((currTodo) => {
      if (currTodo.id === todo.id) {
        return {...currTodo, editMode: true}
      }
      return {...currTodo, editMode: false}
    }))
  }

  function handleTodoDelete(todo) {
    setTodos(todos.filter((currTodo) => currTodo.id !== todo.id))
  }

  function handleTodoSave(todo, newText) {
    setTodos(todos.map((currTodo) => {
      if (currTodo.id === todo.id) {
        return {
          ...currTodo, 
          descr: newText.trim(), 
          editMode: false
        }
      }
      return currTodo
    }))
  }

  function handleTodoCompleted(todo) {
    setTodos(todos.map((currTodo) => {
      if (currTodo.id === todo.id) {
        // Toggle the clicked todo's completed
        const completed = !currTodo.completed
        const addTime = currTodo.startTime ? currentTime - currTodo.startTime : 0

        return {
          ...currTodo,
          completed: completed,
          isTimerRunning: false,
          startTime: null,
          timeSpent: currTodo.timeSpent + addTime
        }
      }
      return currTodo
    }))
  }

  function onTodoToggleTimer(todo) {
    setTodos(todos.map((currTodo) => {

      
      if (currTodo.id === todo.id) {
        // Toggle the clicked todo's isTimerRunning
        const isTimerRunning = !currTodo.isTimerRunning
        const addTime = currTodo.startTime ? currentTime - currTodo.startTime : 0
        
        return {
          ...currTodo, 
          isTimerRunning,
          startTime: isTimerRunning ? currentTime : null,
          timeSpent: isTimerRunning 
            ? currTodo.timeSpent
            : currTodo.timeSpent + addTime
        }
      }
      
      if (currTodo.isTimerRunning) {
        const addTime = currTodo.startTime ? currentTime - currTodo.startTime : 0
        // Stop any other running timer
        return {
          ...currTodo,
          isTimerRunning: false,
          startTime: null,
          timeSpent: currTodo.timeSpent + addTime
        }
      }

      return currTodo
    }))
  }

  return (
    <div className="border p-8 rounded-lg mx-auto">
      
      <h2 className="mx-4 mt-2 mb-8 text-2xl font-bold">TodoApp</h2>
      
      <form onSubmit={handleTodoAdd}>
        <div className="flex p-2 mb-6">
          <input className="px-2 py-2 mr-2 rounded border-gray-400 border w-full" name="todoInput" value={newTodo} onChange={(ev) => setNewTodo(ev.target.value)} placeholder="Enter your todo description here" />
          <button className="flex justify-center items-center w-20 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded shadow-sm cursor-pointer hover:shadow-md transition-all duration-200">Add</button>
        </div>
      </form>

      <TodoList
        todos={todos}
        currentTime={currentTime}
        onTodoSave={handleTodoSave}
        onTodoEdit={handleTodoEdit}
        onTodoDelete={handleTodoDelete}
        onTodoToggleTimer={onTodoToggleTimer}
        onTodoCompleted={handleTodoCompleted}
      />      
    </div>
  )
}
