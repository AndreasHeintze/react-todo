import { useCallback, useMemo, useState } from 'react'
import { useUniqueId, usePersistedState, roundMs } from '../helpers'
import { TodoContext } from './TodoContext'

const DUMMYTWCLASSES = [
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
  'snap-end',
]

function findTopSortPosition(todos) {
  const activeTodos = todos.filter((todo) => !todo.isCompleted)
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

/**
 * Info:
 * An open todo is a todo that is not in mode 'list'
 */
export function TodoProvider({ children }) {
  const generateId = useUniqueId()
  const [newTodo, setNewTodo] = usePersistedState('todo', '')
  const [todos, setTodos] = usePersistedState('todos', new Map())
  const [timeLog, setTimeLog] = usePersistedState('timelog', new Map())
  const [swipedTodo, setSwipedTodo] = useState(null)
  const [openTodoId, setOpenTodoId] = usePersistedState('openTodoId', null)
  const [runningTimeItemId, setRunningTimeItemId] = usePersistedState('runningTimeItemId', null)

  const handleTodoAdd = useCallback(
    (ev) => {
      ev.preventDefault()
      ev.stopPropagation()

      const title = newTodo.trim()
      if (!title) {
        return
      }

      const id = generateId()
      const newTodoItem = {
        id,
        title,
        descr: '',
        mode: 'list',
        isTimerRunning: false,
        startTime: null,
        timeSpent: 0,
        isCompleted: false,
        completedAt: null,
        createdAt: Date.now(),
        color: getRandomTailwindColor(),
        sortOrder: findTopSortPosition([...todos.values()]) - 1,
      }

      setTodos((prevTodos) => new Map(prevTodos).set(id, newTodoItem))
      setNewTodo('')
    },
    [generateId, newTodo, setNewTodo, todos, setTodos]
  )

  const handleTodoDelete = useCallback(
    (ev, todo) => {
      ev.preventDefault()
      ev.stopPropagation()

      setTodos((prevTodos) => {
        const newTodos = new Map(prevTodos)
        newTodos.delete(todo.id)
        return newTodos
      })
    },
    [setTodos]
  )

  const handleTodoSave = useCallback(
    (ev, todo, data) => {
      ev.preventDefault()
      ev.stopPropagation()

      const updatingMode = 'mode' in data
      const settingOpenTodo = updatingMode && data.mode !== 'list'
      const openingTimeLog = updatingMode && data.mode === 'timelog'

      // Don't allow quickedit on a completed todo
      if (todo.isCompleted && data.mode === 'quickedit') {
        return
      }

      setTodos((prevTodos) => {
        const newTodos = new Map(prevTodos)

        // Reset mode to 'list' on previous open todo
        if (settingOpenTodo && openTodoId && openTodoId !== todo.id) {
          const openTodo = newTodos.get(openTodoId)
          if (openTodo) {
            newTodos.set(openTodoId, { ...openTodo, mode: 'list' })
          }
        }

        // Update todo data
        const oldTodo = newTodos.get(todo.id)
        if (oldTodo) {
          const newTodo = { ...oldTodo, ...data }

          // If title is empty, restore old title
          newTodo.title = newTodo.title.trim()
          if (!newTodo.title) {
            newTodo.title = todo.title
            if (ev.target.tagName === 'DIV') {
              ev.target.innerText = todo.title
            }
          }

          newTodos.set(todo.id, newTodo)
        }

        return newTodos
      })

      if (updatingMode) {
        if (data.mode !== 'list') {
          setOpenTodoId(todo.id)
        } else if (todo.mode !== 'list') {
          setOpenTodoId(null)
        }
      }

      if (openingTimeLog) {
        // calcTimeSpent(todo)
      }
    },
    [setTodos, openTodoId, setOpenTodoId]
  )

  const handleTodoCompleted = useCallback(
    (ev, todo) => {
      ev.preventDefault()
      ev.stopPropagation()

      const currentTime = roundMs(Date.now())
      const isCompleted = !todo.isCompleted

      // Toggle completed/active todo
      setTodos((prevTodos) => {
        const newTodos = new Map(prevTodos)

        const oldTodo = newTodos.get(todo.id)
        if (oldTodo) {
          const stoppedTodo = oldTodo.isTimerRunning ? stopTimer(oldTodo, currentTime) : oldTodo
          newTodos.set(todo.id, {
            ...stoppedTodo,
            isCompleted: isCompleted,
            completedAt: isCompleted ? currentTime : null,
            sortOrder: isCompleted ? oldTodo.sortOrder : findTopSortPosition([...newTodos.values()]) - 1,
            mode: 'list',
          })
        }

        return newTodos
      })

      // Stop this todos running timer in the timeLog
      if (isCompleted && runningTimeItemId) {
        setTimeLog((prevTimeLog) => {
          const newTimeLog = new Map(prevTimeLog)
          const runningTimeItem = newTimeLog.get(runningTimeItemId)
          if (runningTimeItem && runningTimeItem.todoId === todo.id) {
            newTimeLog.set(runningTimeItemId, { ...runningTimeItem, stop: currentTime })
            setRunningTimeItemId(null)
          }
          return newTimeLog
        })
      }
    },
    [setTodos, setTimeLog, runningTimeItemId, setRunningTimeItemId]
  )

  const handleTodoToggleTimer = useCallback(
    (ev, todo) => {
      ev.preventDefault()
      ev.stopPropagation()

      const currentTime = roundMs(Date.now())
      const isStarting = !todo.isTimerRunning

      setTodos((prevTodos) => {
        const newTodos = new Map(prevTodos)
        const oldTodo = newTodos.get(todo.id)

        if (!oldTodo) return newTodos

        // If starting this timer, stop other running todo first
        if (isStarting && runningTimeItemId) {
          const runningTodoId = timeLog.get(runningTimeItemId)?.todoId
          if (runningTodoId && runningTodoId !== todo.id) {
            const runningTodo = newTodos.get(runningTodoId)
            if (runningTodo) {
              newTodos.set(runningTodoId, stopTimer(runningTodo, currentTime))
            }
          }
        }

        // Toggle timer start/stop on this todo
        if (isStarting) {
          newTodos.set(oldTodo.id, { ...oldTodo, isTimerRunning: true, startTime: currentTime })
        } else {
          newTodos.set(oldTodo.id, stopTimer(oldTodo, currentTime))
        }

        return newTodos
      })

      setTimeLog((prevTimeLog) => {
        const newTimeLog = new Map(prevTimeLog)
        if (runningTimeItemId) {
          const runningTimeItem = newTimeLog.get(runningTimeItemId)
          if (runningTimeItem) {
            newTimeLog.set(runningTimeItemId, { ...runningTimeItem, stop: currentTime })
          }
        }

        if (isStarting) {
          const newTimeItemId = generateId()
          newTimeLog.set(newTimeItemId, { id: newTimeItemId, todoId: todo.id, start: currentTime, stop: null })
          setRunningTimeItemId(newTimeItemId)
        } else {
          setRunningTimeItemId(null)
        }
        return newTimeLog
      })
    },
    [setTodos, setTimeLog, timeLog, runningTimeItemId, setRunningTimeItemId, generateId]
  )

  const handleTodoContentEditable = useCallback((ev, todo) => {
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
        const activeTodos = [...prevTodos.values()].filter((todo) => !todo.isCompleted).sort((a, b) => a.sortOrder - b.sortOrder)

        const draggedIndex = activeTodos.findIndex((todo) => todo.id === draggedTodo.id)
        const droppedIndex = activeTodos.findIndex((todo) => todo.id === droppedOnTodo.id)

        const newActiveTodos = [...activeTodos]
        const [removed] = newActiveTodos.splice(draggedIndex, 1)
        newActiveTodos.splice(droppedIndex, 0, removed)

        const newTodos = new Map(prevTodos)
        newActiveTodos.forEach((todo, index) => {
          const oldTodo = newTodos.get(todo.id)
          if (oldTodo) {
            newTodos.set(todo.id, { ...oldTodo, sortOrder: index })
          }
        })

        return newTodos
      })
    },
    [setTodos]
  )

  // function calcTimeSpent(todo) {
  //   setTimeLog((prevTimeLog) => {})
  // }

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

  return <TodoContext.Provider value={contextValue}>{children}</TodoContext.Provider>
}
