import { useCallback, useMemo } from 'react'
import { useUniqueId, usePersistedState } from '../helpers'
import { TodoContext } from './TodoContext'

function findTopSortPosition(todos) {
  const uncompletedTodos = todos.filter((todo) => !todo.completed)
  const minSortOrder = uncompletedTodos.length > 0 ? Math.min(...uncompletedTodos.map((t) => t.sortOrder)) : 1
  return minSortOrder
}

function stopTimer(todo, currentTime) {
  if (!todo.isTimerRunning || !todo.startTime) {
    return { ...todo, isTimerRunning: false, startTime: null }
  }

  const addTime = currentTime - todo.startTime
  return {
    ...todo,
    isTimerRunning: false,
    startTime: null,
    timeSpent: todo.timeSpent + addTime,
  }
}

export function TodoProvider({ children }) {
  const generateId = useUniqueId()
  const [newTodo, setNewTodo] = usePersistedState('todo', '')
  const [todos, setTodos] = usePersistedState('todos', [])

  const handleTodoAdd = useCallback(
    (ev) => {
      ev.preventDefault()

      const descr = newTodo.trim()
      if (!descr) {
        return
      }

      const newTodoItem = {
        id: generateId(),
        descr,
        editMode: false,
        completed: false,
        timeSpent: 0,
        startTime: null,
        isTimerRunning: false,
        sortOrder: findTopSortPosition(todos) - 1,
        createdAt: Date.now(),
        completedAt: null,
      }

      setTodos((prevTodos) => [...prevTodos, newTodoItem])
      setNewTodo('')
    },
    [generateId, newTodo, setNewTodo, todos, setTodos]
  )

  const handleTodoEdit = useCallback(
    (todo) => {
      if (todo.completed) return

      setTodos((prevTodos) =>
        prevTodos.map((currTodo) => ({
          ...currTodo,
          editMode: currTodo.id === todo.id,
        }))
      )
    },
    [setTodos]
  )

  const handleTodoDelete = useCallback(
    (todo) => {
      setTodos((prevTodos) => prevTodos.filter((currTodo) => currTodo.id !== todo.id))
    },
    [setTodos]
  )

  const handleTodoSave = useCallback(
    (ev, todo) => {
      ev.target.scrollTop = 0

      let newDescription = ev.target.innerText.trim()

      // Don't save if description is empty - restore original and exit edit mode
      if (!newDescription) {
        // Reset the DOM element to original description
        ev.target.innerText = todo.descr
        newDescription = todo.descr
      }

      setTodos((prevTodos) =>
        prevTodos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            return {
              ...currTodo,
              descr: newDescription,
              editMode: false,
            }
          }
          return currTodo
        })
      )
    },
    [setTodos]
  )

  const handleTodoCompleted = useCallback(
    (todo) => {
      const currentTime = Date.now()

      setTodos((prevTodos) =>
        prevTodos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            const completed = !currTodo.completed
            const stoppedTodo = stopTimer(currTodo, currentTime)

            return {
              ...stoppedTodo,
              completed,
              completedAt: completed ? currentTime : null,
              sortOrder: completed ? currTodo.sortOrder : findTopSortPosition(prevTodos) - 1,
              editMode: false,
            }
          }
          return currTodo
        })
      )
    },
    [setTodos]
  )

  const handleTodoToggleTimer = useCallback(
    (todo) => {
      const currentTime = Date.now()

      setTodos((prevTodos) =>
        prevTodos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            // Toggle the clicked todo's timer
            const isTimerRunning = !currTodo.isTimerRunning

            if (isTimerRunning) {
              // Starting timer
              return {
                ...currTodo,
                isTimerRunning: true,
                startTime: currentTime,
              }
            }

            // Stopping timer
            return stopTimer(currTodo, currentTime)
          }

          // Stop any other running timers (only one timer can run at a time)
          if (currTodo.isTimerRunning) {
            return stopTimer(currTodo, currentTime)
          }

          return currTodo
        })
      )
    },
    [setTodos]
  )

  const handleTodoDoubleClick = useCallback(
    (todo) => {
      if (!todo.editMode && !todo.completed) {
        handleTodoEdit(todo)
      }
    },
    [handleTodoEdit]
  )

  // Restore old description text if escape is pressed
  const handleTodoContentEditableKeyDown = useCallback((ev, todo) => {
    if (ev.key === 'Escape') {
      ev.target.innerText = todo.descr
      ev.target.blur()
    }
  }, [])

  const handleTodoContentEditable = useCallback((ev) => {
    // Prevent line breaks in single-line todo descriptions
    const enterPressed = ev.target.innerText.indexOf('\n') !== -1 && ev.target.textContent !== ''
    if (enterPressed) {
      ev.target.innerText = ev.target.innerText.replace(/\n/g, '')
      ev.target.blur()
    }
    // Prevent blur event when deleting all text
    if (!ev.target.textContent) {
      ev.preventDefault()
    }
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      generateId,
      newTodo,
      setNewTodo,
      todos,
      setTodos,
      handleTodoAdd,
      handleTodoEdit,
      handleTodoDelete,
      handleTodoSave,
      handleTodoCompleted,
      handleTodoToggleTimer,
      handleTodoDoubleClick,
      handleTodoContentEditable,
      handleTodoContentEditableKeyDown,
    }),
    [
      generateId,
      newTodo,
      setNewTodo,
      todos,
      setTodos,
      handleTodoAdd,
      handleTodoEdit,
      handleTodoDelete,
      handleTodoSave,
      handleTodoCompleted,
      handleTodoToggleTimer,
      handleTodoDoubleClick,
      handleTodoContentEditable,
      handleTodoContentEditableKeyDown,
    ]
  )

  return <TodoContext.Provider value={contextValue}>{children}</TodoContext.Provider>
}
