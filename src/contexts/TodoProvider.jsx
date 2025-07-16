import { useMemo } from 'react'
import { generateId, usePersistedReducer, roundMs } from '../helpers'
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

function findTopSortPosition(todos) {
  const activeTodos = todos.filter((todo) => !todo.isCompleted)
  const minSortOrder = activeTodos.length > 0 ? Math.min(...activeTodos.map((t) => t.sortOrder)) : 1
  return minSortOrder
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
 * An open todo is a todo that is not in mode 'list' and only one can be opened at once.
 * swipedTodo is the last one that is swiped to the left and only one can be swiped at once.
 * runningTimeItemId is the timeLog item that currently has a timer running. Only one todo can have a timer running at once.
 */
const initialState = {
  titleInput: '',
  todos: new Map(),
  timeLog: new Map(),
  swipedTodo: null,
  openTodoId: null,
  runningTimeItemId: null,
}

function todoReducer(state, action) {
  switch (action.type) {
    case 'SET_TODO_TITLE_INPUT': {
      return { ...state, titleInput: action.payload }
    }
    case 'ADD_TODO': {
      const title = state.titleInput.trim()
      if (!title) return

      const id = generateId()
      const newTodos = new Map(state.todos).set(id, {
        id,
        title,
        descr: '',
        mode: 'list',
        color: getRandomTailwindColor(),
        isTimerRunning: false,
        startTime: null,
        timeSpent: 0,
        sortOrder: findTopSortPosition([...state.todos.values()]) - 1,
        isCompleted: false,
        completedAt: null,
        createdAt: Date.now(),
      })

      return { ...state, todos: newTodos, titleInput: '' }
    }
    case 'DELETE_TODO': {
      const newTodos = new Map(state.todos)
      newTodos.delete(action.payload.id)
      return { ...state, todos: newTodos }
    }
    case 'SAVE_TODO': {
      const { todo, data } = action.payload
      const newTodos = new Map(state.todos)

      // Reset mode to 'list' on previous open todo
      if (state.openTodoId && state.openTodoId !== todo.id) {
        const openTodo = newTodos.get(state.openTodoId)
        if (openTodo) {
          newTodos.set(state.openTodoId, { ...openTodo, mode: 'list' })
        }
      }

      // Update todo data
      newTodos.set(todo.id, { ...todo, ...data })

      return { ...state, todos: newTodos, openTodoId: data.mode !== 'list' ? todo.id : null }
    }
    case 'COMPLETE_TODO': {
      const { todo } = action.payload
      const newTodos = new Map(state.todos)
      const currentTime = roundMs(Date.now())
      const isCompleted = !todo.isCompleted
      const baseTodo = todo.isTimerRunning ? stopTimer(todo, currentTime) : todo

      newTodos.set(todo.id, {
        ...baseTodo,
        isCompleted,
        completedAt: isCompleted ? currentTime : null,
        sortOrder: isCompleted ? todo.sortOrder : findTopSortPosition([...newTodos.values()]) - 1,
        mode: 'list',
      })

      if (isCompleted && state.runningTimeItemId) {
        const newTimeLog = new Map(state.timeLog)
        const runningTimeItem = newTimeLog.get(state.runningTimeItemId)
        if (runningTimeItem && runningTimeItem.todoId === todo.id) {
          newTimeLog.set(state.runningTimeItemId, { ...runningTimeItem, stop: currentTime })
          return { ...state, todos: newTodos, timeLog: newTimeLog, runningTimeItemId: null }
        }
      }

      return { ...state, todos: newTodos }
    }
    case 'TOGGLE_TIMER': {
      const { todo } = action.payload
      const currentTime = roundMs(Date.now())
      const newTimeItemId = generateId()
      const newTodos = new Map(state.todos)
      const oldTodo = newTodos.get(todo.id)
      if (!oldTodo) return state

      const isStarting = !oldTodo.isTimerRunning
      if (isStarting && state.runningTimeItemId) {
        const runningTodoId = state.timeLog.get(state.runningTimeItemId)?.todoId
        if (runningTodoId && runningTodoId !== todo.id) {
          const runningTodo = newTodos.get(runningTodoId)
          if (runningTodo) {
            newTodos.set(runningTodoId, stopTimer(runningTodo, currentTime))
          }
        }
      }

      if (isStarting) {
        newTodos.set(oldTodo.id, { ...oldTodo, isTimerRunning: true, startTime: currentTime })
      } else {
        newTodos.set(oldTodo.id, stopTimer(oldTodo, currentTime))
      }

      const newTimeLog = new Map(state.timeLog)
      if (state.runningTimeItemId) {
        const runningTimeItem = newTimeLog.get(state.runningTimeItemId)
        if (runningTimeItem) {
          newTimeLog.set(state.runningTimeItemId, { ...runningTimeItem, stop: currentTime })
        }
      }

      if (isStarting) {
        newTimeLog.set(newTimeItemId, { id: newTimeItemId, todoId: todo.id, start: currentTime, stop: null })
        return { ...state, todos: newTodos, timeLog: newTimeLog, runningTimeItemId: newTimeItemId }
      } else {
        return { ...state, todos: newTodos, timeLog: newTimeLog, runningTimeItemId: null }
      }
    }
    case 'SORT_TODOS': {
      const { draggedTodo, droppedOnTodo } = action.payload

      if (draggedTodo.id === droppedOnTodo.id) return state

      const newTodos = new Map(state.todos)
      const activeTodos = [...newTodos.values()].filter((todo) => !todo.isCompleted).sort((a, b) => a.sortOrder - b.sortOrder)
      const draggedIndex = activeTodos.findIndex((todo) => todo.id === draggedTodo.id)
      const droppedIndex = activeTodos.findIndex((todo) => todo.id === droppedOnTodo.id)
      const [removed] = activeTodos.splice(draggedIndex, 1)
      activeTodos.splice(droppedIndex, 0, removed)
      activeTodos.forEach((todo, index) => {
        const oldTodo = newTodos.get(todo.id)
        if (oldTodo) {
          newTodos.set(todo.id, { ...oldTodo, sortOrder: index })
        }
      })
      return { ...state, todos: newTodos }
    }
    case 'SET_SWIPED_TODO': {
      return { ...state, swipedTodo: action.payload }
    }
    default:
      return state
  }
}

export function TodoProvider({ children }) {
  const [state, dispatch] = usePersistedReducer(todoReducer, initialState, 'todoState')

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state, dispatch]
  )

  return <TodoContext value={contextValue}>{children}</TodoContext>
}
