import { useCallback } from 'react'
import { useUniqueId, usePersistedState } from '../helpers'
import { TodoContext } from './TodoContext'

function findTopSortPosition(todos) {
  const uncompletedTodos = todos.filter((todo) => !todo.completed)
  const minSortOrder = uncompletedTodos.length > 0 ? Math.min(...uncompletedTodos.map((t) => t.sortOrder)) : 1
  return minSortOrder
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

      // Find the minimum sortOrder among uncompleted todos and subtract 1

      setTodos([
        ...todos,
        {
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
        },
      ])

      setNewTodo('')
    },
    [generateId, newTodo, setNewTodo, todos, setTodos]
  )

  const handleTodoEdit = useCallback(
    (todo) => {
      if (todo.completed) return

      setTodos(
        todos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            return { ...currTodo, editMode: true }
          }
          return { ...currTodo, editMode: false }
        })
      )
    },
    [todos, setTodos]
  )

  const handleTodoDelete = useCallback(
    (todo) => {
      setTodos(todos.filter((currTodo) => currTodo.id !== todo.id))
    },
    [todos, setTodos]
  )

  const handleTodoSave = useCallback(
    (ev, todo) => {
      ev.target.scrollTop = 0
      setTodos(
        todos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            return {
              ...currTodo,
              descr: ev.target.innerText.trim(),
              editMode: false,
            }
          }
          return currTodo
        })
      )
    },
    [todos, setTodos]
  )

  const handleTodoCompleted = useCallback(
    (todo) => {
      setTodos(
        todos.map((currTodo) => {
          if (currTodo.id === todo.id) {
            // Toggle the clicked todo's completed
            const completed = !currTodo.completed
            const time = Date.now()
            const addTime = currTodo.startTime ? time - currTodo.startTime : 0

            return {
              ...currTodo,
              completed: completed,
              completedAt: completed ? time : null,
              sortOrder: completed ? currTodo.sortOrder : findTopSortPosition(todos) - 1,
              isTimerRunning: false,
              startTime: null,
              timeSpent: currTodo.timeSpent + addTime,
            }
          }
          return currTodo
        })
      )
    },
    [todos, setTodos]
  )

  const handleTodoToggleTimer = useCallback(
    (todo) => {
      setTodos(
        todos.map((currTodo) => {
          const time = Date.now()

          if (currTodo.id === todo.id) {
            // Toggle the clicked todo's isTimerRunning
            const isTimerRunning = !currTodo.isTimerRunning
            const addTime = currTodo.startTime ? time - currTodo.startTime : 0

            return {
              ...currTodo,
              isTimerRunning,
              startTime: isTimerRunning ? time : null,
              timeSpent: isTimerRunning ? currTodo.timeSpent : currTodo.timeSpent + addTime,
            }
          }

          if (currTodo.isTimerRunning) {
            const addTime = currTodo.startTime ? time - currTodo.startTime : 0
            // Stop any other running timer
            return {
              ...currTodo,
              isTimerRunning: false,
              startTime: null,
              timeSpent: currTodo.timeSpent + addTime,
            }
          }

          return currTodo
        })
      )
    },
    [todos, setTodos]
  )

  const handleTodoDoubleClick = useCallback(
    (todo) => {
      if (!todo.editMode) {
        handleTodoEdit(todo)
      }
    },
    [handleTodoEdit]
  )

  const handleTodoContentEditable = useCallback((ev) => {
    const enterPressed = ev.target.innerText.indexOf('\n') !== -1
    if (enterPressed) {
      ev.target.innerText = ev.target.innerText.replace(/\n/g, '')
      ev.target.blur()
    }
  }, [])

  const value = {
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
  }

  return <TodoContext value={value}>{children}</TodoContext>
}
