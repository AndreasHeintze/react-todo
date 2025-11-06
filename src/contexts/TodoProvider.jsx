/**
 * Info:
 * An open todo is a todo that is not in mode 'list' and only one can be opened at once.
 * swipedTodo is the last one that is swiped to the left and only one can be swiped at once.
 * runningTimeItem is the timeLog item that currently has a timer running. Only one time log item can have a timer running at once.
 */

import { useRef } from 'react'
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

const initialState = {
  todos: new Map(),
  timeLog: new Map(),
  openTodoId: null,
  runningTimeItem: null,
}

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO': {
      const title = action.payload
      if (!title) return state

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

      return { ...state, todos: newTodos }
    }
    case 'DELETE_TODO': {
      const newTodos = new Map(state.todos)
      newTodos.delete(action.payload.id)
      return { ...state, todos: newTodos }
    }
    case 'SAVE_TODO': {
      const { todo, data } = action.payload
      const newTodos = new Map(state.todos)
      const openTodoId = data.mode !== 'list' ? todo.id : null

      // Reset mode to 'list' on previous open todo
      if (state.openTodoId && state.openTodoId !== todo.id) {
        const openTodo = newTodos.get(state.openTodoId)
        if (openTodo) {
          newTodos.set(state.openTodoId, { ...openTodo, mode: 'list' })
        }
      }

      // Update todo data
      newTodos.set(todo.id, { ...todo, ...data })

      return { ...state, todos: newTodos, openTodoId }
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

      if (isCompleted && state.runningTimeItem?.todoId === todo.id) {
        const newTimeLog = new Map(state.timeLog)
        newTimeLog.set(state.runningTimeItem.id, { ...state.runningTimeItem, stop: currentTime })
        return { ...state, todos: newTodos, timeLog: newTimeLog, runningTimeItem: null }
      }

      return { ...state, todos: newTodos }
    }
    case 'TOGGLE_TIMER': {
      const { todo } = action.payload
      const currentTime = roundMs(Date.now())
      const newTodos = new Map(state.todos)
      const newTimeLog = new Map(state.timeLog)
      const isStarting = !todo.isTimerRunning
      let runningTimeItem = state.runningTimeItem

      // Stop timer on other running todo and time log item
      if (isStarting && runningTimeItem) {
        const runningTodo = newTodos.get(runningTimeItem.todoId)
        if (runningTodo) {
          newTodos.set(runningTodo.id, stopTimer(runningTodo, currentTime))
        }
        newTimeLog.set(runningTimeItem.id, { ...runningTimeItem, stop: currentTime })
      }

      // Start timer on this todo and add a new running time log item
      if (isStarting) {
        newTodos.set(todo.id, { ...todo, isTimerRunning: true, startTime: currentTime })
        const newTimeItemId = generateId()
        runningTimeItem = { id: newTimeItemId, todoId: todo.id, start: currentTime, stop: null }
        newTimeLog.set(newTimeItemId, runningTimeItem)
        // ..or else stop the timer on this todo and in the time log
      } else {
        newTodos.set(todo.id, stopTimer(todo, currentTime))
        if (runningTimeItem) {
          newTimeLog.set(runningTimeItem.id, { ...runningTimeItem, stop: currentTime })
        }
        runningTimeItem = null
      }

      return { ...state, todos: newTodos, timeLog: newTimeLog, runningTimeItem }
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
        newTodos.set(todo.id, { ...newTodos.get(todo.id), sortOrder: index })
      })

      return { ...state, todos: newTodos }
    }
    default:
      return state
  }
}

export function TodoProvider({ children }) {
  const [state, dispatch] = usePersistedReducer(todoReducer, initialState, 'todoState')

  const swipedTodo = useRef(null)

  // Set swiped todo & swipe other back
  const handleScroll = (e) => {
    e.stopPropagation()
    const scrolledTodo = e.currentTarget
    const scrollPos = scrolledTodo.scrollLeft
    const prevScrollPos = scrolledTodo.dataset?.scrollPos ?? 0
    const swipeDirection = scrollPos - prevScrollPos > 0 ? 'left' : 'right'

    if (swipeDirection === 'right') {
      scrolledTodo.dataset.scrollPos = scrollPos
      return
    }

    // Swipe back the previous swiped todo
    if (swipedTodo.current && swipedTodo.current !== scrolledTodo) {
      swipedTodo.current.scrollTo({ left: 0, behavior: 'smooth' })
    }

    scrolledTodo.dataset.scrollPos = scrollPos
    swipedTodo.current = scrolledTodo
  }

  const allTodos = [...state.todos.values()]
  const activeTodos = allTodos.filter((todo) => todo && !todo.isCompleted).sort((a, b) => a.sortOrder - b.sortOrder)
  const completedTodos = allTodos.filter((todo) => todo && todo.isCompleted).sort((a, b) => b.completedAt - a.completedAt)

  const contextValue = {
    state,
    dispatch,
    handleScroll,
    activeTodos,
    completedTodos,
  }

  return <TodoContext value={contextValue}>{children}</TodoContext>
}
