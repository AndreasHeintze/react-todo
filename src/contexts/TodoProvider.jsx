import { useCallback, useMemo, useState } from 'react'
import { useUniqueId, usePersistedState } from '../helpers'
import { TodoContext } from './TodoContext'

function findTopSortPosition(todos) {
  const uncompletedTodos = todos.filter((todo) => !todo.completed)
  const minSortOrder = uncompletedTodos.length > 0 ? Math.min(...uncompletedTodos.map((t) => t.sortOrder)) : 1
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

export function TodoProvider({ children }) {
  const generateId = useUniqueId()
  const [newTodo, setNewTodo] = usePersistedState('todo', '')
  const [todos, setTodos] = usePersistedState('todos', [])
  const [timeLog, setTimeLog] = usePersistedState('timelog', [])
  const [currTimeItem, setCurrTimeItem] = usePersistedState('timeitem', { id: null })
  const [swipedTodo, setSwipedTodo] = useState(null) // No need to persist this, since it won't be swiped after a page reload.

  console.log('todos', todos)
  console.log('timeLog', timeLog)

  const startTimer = useCallback(
    (todo, currentTime) => {
      const newTimeItem = {
        id: generateId(),
        todoId: todo.id,
        start: currentTime,
        stop: null,
      }

      setTimeLog((prevTimeLog) => [...prevTimeLog, newTimeItem])
      setCurrTimeItem(newTimeItem)

      return {
        ...todo,
        isTimerRunning: true,
        startTime: currentTime,
      }
    },
    [generateId, setCurrTimeItem, setTimeLog]
  )

  const stopTimer = useCallback(
    (todo, currentTime) => {
      if (!todo.isTimerRunning) return todo

      setTimeLog((prevTimeLog) =>
        prevTimeLog.map((currTimeLogItem) => {
          if (currTimeLogItem.id === currTimeItem?.id) {
            return {
              ...currTimeLogItem,
              stop: currentTime,
            }
          }
          return currTimeLogItem
        })
      )
      setCurrTimeItem(null)

      return {
        ...todo,
        isTimerRunning: false,
        startTime: null,
        timeSpent: todo.timeSpent + (currentTime - todo.startTime),
      }
    },
    [setTimeLog, setCurrTimeItem, currTimeItem?.id]
  )

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
    (todo) => {
      setTodos((prevTodos) => prevTodos.filter((currTodo) => currTodo.id !== todo.id))
    },
    [setTodos]
  )

  const handleTodoSave = useCallback(
    (ev, todo, data) => {
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
              mode: 'list',
            }
          }
          return currTodo
        })
      )
    },
    [setTodos, stopTimer]
  )

  const handleTodoToggleTimer = useCallback(
    (todo, stop = false) => {
      if (stop && !todo.isTimerRunning) return

      const currentTime = Date.now()

      setTodos((prevTodos) =>
        prevTodos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            // Toggle the clicked todo's timer
            const isTimerRunning = !currTodo.isTimerRunning

            if (isTimerRunning) {
              console.trace('Calling startTimer()')
              return startTimer(currTodo, currentTime)
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
    [setTodos, startTimer, stopTimer]
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
