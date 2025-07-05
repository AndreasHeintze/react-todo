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

      const title = newTodo.trim()
      if (!title) {
        return
      }

      const newTodoItem = {
        id: generateId(),
        title,
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

      let newTitle = ev.target.innerText.trim()

      // Don't save if title is empty - restore original and exit edit mode
      if (!newTitle) {
        // Reset the DOM element to original title
        ev.target.innerText = todo.title
        newTitle = todo.title
      }

      setTodos((prevTodos) =>
        prevTodos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            return {
              ...currTodo,
              title: newTitle,
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

  const handleTodoContentEditable = useCallback((ev, todo) => {
    // Restore old title text if escape is pressed
    if (ev.key === 'Escape') {
      ev.target.innerText = todo.title
      ev.target.blur()
      return
    }
    // Save new title text if enter is pressed.
    if (ev.key === 'Enter') {
      ev.target.blur()
      return
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
    ]
  )

  return <TodoContext.Provider value={contextValue}>{children}</TodoContext.Provider>
}
