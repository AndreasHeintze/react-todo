import { useCallback, useMemo, useState } from 'react'
import { useUniqueId, usePersistedState } from '../helpers'
import { TodoContext } from './TodoContext'

function findTopSortPosition(todos) {
  const activeTodos = todos.filter((todo) => !todo.completed)
  const minSortOrder = activeTodos.length > 0 ? Math.min(...activeTodos.map((t) => t.sortOrder)) : 1
  return minSortOrder
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

  const DUMMYCOLORS = [
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

function stopTimer(currTodo, currentTime) {
  return {
    ...currTodo,
    isTimerRunning: false,
    startTime: null,
    timeSpent: currTodo.timeSpent + (currentTime - currTodo.startTime),
  }
}

export function TodoProvider({ children }) {
  const generateId = useUniqueId()
  const [newTodo, setNewTodo] = usePersistedState('todo', '')
  const [todos, setTodos] = usePersistedState('todos', [])
  const [timeLog, setTimeLog] = usePersistedState('timelog', [])
  const [swipedTodo, setSwipedTodo] = useState(null) // No need to persist this, since it won't be swiped after a page reload.

  const handleTodoAdd = useCallback(
    (ev) => {
      ev.preventDefault()
      ev.stopPropagation()

      const title = newTodo.trim()
      if (!title) {
        return
      }

      const newTodoItem = {
        id: generateId(),
        title,
        descr: '',
        color: getRandomTailwindColor(),
        mode: 'list',
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

  const handleTodoDelete = useCallback(
    (ev, todo) => {
      ev.preventDefault()
      ev.stopPropagation()

      setTodos((prevTodos) => prevTodos.filter((currTodo) => currTodo.id !== todo.id))
    },
    [setTodos]
  )

  const handleTodoSave = useCallback(
    (ev, todo, data) => {
      ev.preventDefault()
      ev.stopPropagation()

      setTodos((prevTodos) =>
        prevTodos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            const newTodo = { ...currTodo, ...data }
            newTodo.title = newTodo.title.trim()

            // Restore old title if it's empty
            if (!newTodo.title) {
              newTodo.title = todo.title
              // Reset the DOM element to original title
              if (ev.target.tagName === 'DIV') {
                ev.target.innerText = todo.title
              }
            }

            return newTodo
          }

          // Make sure other todos are in list mode
          if (currTodo.mode !== 'list') {
            return { ...currTodo, mode: 'list' }
          }

          return currTodo
        })
      )
    },
    [setTodos]
  )

  const handleTodoCompleted = useCallback(
    (ev, todo) => {
      ev.preventDefault()
      ev.stopPropagation()

      const currentTime = Date.now()
      const completed = !todo.completed

      // First, update the todos state
      setTodos((prevTodos) =>
        prevTodos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            const stoppedTodo = stopTimer(currTodo, currentTime)
            return {
              ...stoppedTodo,
              completed,
              completedAt: completed ? currentTime : null,
              sortOrder: completed ? currTodo.sortOrder : findTopSortPosition(prevTodos) - 1,
              mode: 'list',
            }
          }
          return currTodo
        })
      )

      if (!completed) return

      // Second, update the timelog state
      // If the completed todo has a running timer, stop it.
      setTimeLog((prevTimeLog) =>
        prevTimeLog.map((timeItem) => {
          if (timeItem.todoId == todo.id && !timeItem.stop) {
            return { ...timeItem, stop: currentTime }
          }
          return timeItem
        })
      )
    },
    [setTodos, setTimeLog]
  )

  const handleTodoToggleTimer = useCallback(
    (ev, todo) => {
      ev.preventDefault()
      ev.stopPropagation()

      const currentTime = Date.now()
      const isStarting = !todo.isTimerRunning

      // First, update the todos state
      setTodos((prevTodos) => {
        return prevTodos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            if (isStarting) {
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
      })

      // Second, update the timelog state
      setTimeLog((prevTimeLog) => {
        // Stop all current running timers in the timelog
        const updatedLog = prevTimeLog.map((timeItem) => {
          if (!timeItem.stop) {
            return { ...timeItem, stop: currentTime }
          }
          return timeItem
        })

        // If starting a new timer, add a new time item to the timelog
        if (isStarting) {
          const newTimeItem = {
            id: generateId(),
            todoId: todo.id,
            start: currentTime,
            stop: null,
          }
          return [...updatedLog, newTimeItem]
        }

        return updatedLog
      })
    },
    [setTodos, setTimeLog, generateId]
  )

  const handleTodoContentEditable = useCallback((ev, todo) => {
    ev.preventDefault()
    ev.stopPropagation()

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
      timeLog,
      swipedTodo,
      setSwipedTodo,
      handleTodoAdd,
      handleTodoDelete,
      handleTodoSave,
      handleTodoCompleted,
      handleTodoToggleTimer,
      handleTodoContentEditable,
      handleTodoSort,
    }),
    [
      newTodo,
      setNewTodo,
      todos,
      setTodos,
      timeLog,
      swipedTodo,
      setSwipedTodo,
      handleTodoAdd,
      handleTodoDelete,
      handleTodoSave,
      handleTodoCompleted,
      handleTodoToggleTimer,
      handleTodoContentEditable,
      handleTodoSort,
    ]
  )

  return <TodoContext value={contextValue}>{children}</TodoContext>
}
