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

function getRandomTailwindColor() {
  const predefinedColors = [
    'border-l-red-400',
    'border-l-orange-400',
    'border-l-amber-400',
    'border-l-yellow-400',
    'border-l-lime-400',
    'border-l-green-400',
    'border-l-emerald-400',
    'border-l-teal-400',
    'border-l-cyan-400',
    'border-l-sky-400',
    'border-l-blue-400',
    'border-l-indigo-400',
    'border-l-violet-400',
    'border-l-purple-400',
    'border-l-fuchsia-400',
    'border-l-pink-400',
    'border-l-rose-400',
  ]

  const dummyColors = [
    'to-red-400',
    'to-orange-400',
    'to-amber-400',
    'to-yellow-400',
    'to-lime-400',
    'to-green-400',
    'to-emerald-400',
    'to-teal-400',
    'to-cyan-400',
    'to-sky-400',
    'to-blue-400',
    'to-indigo-400',
    'to-violet-400',
    'to-purple-400',
    'to-fuchsia-400',
    'to-pink-400',
    'to-rose-400',
  ]

  return predefinedColors[Math.floor(Math.random() * predefinedColors.length)]
}

export function TodoProvider({ children }) {
  const generateId = useUniqueId()
  const [newTodo, setNewTodo] = usePersistedState('todo', '')
  const [todos, setTodos] = usePersistedState('todos', [])
  const [swipedTodoId, setSwipedTodoId] = usePersistedState(null)

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
        color: getRandomTailwindColor(),
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

  const handleTodoSort = useCallback(
    (draggedTodo, droppedOnTodo) => {
      if (draggedTodo.id === droppedOnTodo.id) {
        return
      }

      setTodos((prevTodos) => {
        const activeTodos = prevTodos.filter((todo) => !todo.completed).sort((a, b) => a.sortOrder - b.sortOrder)
        const completedTodos = prevTodos.filter((todo) => todo.completed)

        const draggedIndex = activeTodos.findIndex((todo) => todo.id === draggedTodo.id)
        const droppedIndex = activeTodos.findIndex((todo) => todo.id === droppedOnTodo.id)

        const newActiveTodos = [...activeTodos]
        const [removed] = newActiveTodos.splice(draggedIndex, 1)
        newActiveTodos.splice(droppedIndex, 0, removed)

        const updatedTodos = newActiveTodos.map((todo, index) => ({
          ...todo,
          sortOrder: index,
        }))

        return [...updatedTodos, ...completedTodos]
      })
    },
    [setTodos]
  )

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      newTodo,
      setNewTodo,
      todos,
      setTodos,
      swipedTodoId,
      setSwipedTodoId,
      handleTodoAdd,
      handleTodoEdit,
      handleTodoDelete,
      handleTodoSave,
      handleTodoCompleted,
      handleTodoToggleTimer,
      handleTodoDoubleClick,
      handleTodoContentEditable,
      handleTodoSort,
    }),
    [
      newTodo,
      setNewTodo,
      todos,
      setTodos,
      swipedTodoId,
      setSwipedTodoId,
      handleTodoAdd,
      handleTodoEdit,
      handleTodoDelete,
      handleTodoSave,
      handleTodoCompleted,
      handleTodoToggleTimer,
      handleTodoDoubleClick,
      handleTodoContentEditable,
      handleTodoSort,
    ]
  )

  return <TodoContext value={contextValue}>{children}</TodoContext>
}
