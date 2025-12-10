import { useReducer, useEffect, Reducer } from 'react'
import type { Todo, TimeLogItem } from './types'

export function roundMs(timestamp: number): number {
  return Math.round(timestamp / 1000) * 1000
}

export function calcTotalTime(todo: Todo, timeLog: Map<string, TimeLogItem>): number {
  const filteredItems = Array.from(timeLog.values()).filter((item) => item.todoId === todo.id)
  let totalTime = 0
  filteredItems.forEach((item) => {
    totalTime += (item.stop ? item.stop : roundMs(Date.now())) - item.start
  })
  return totalTime
}

export function formatDateTimeLocal(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export function formatTimeSpent(ms: number): string {
  if (ms < 0) ms = 0

  const totalSeconds = Math.round(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  let dayPart = ''
  if (days > 0) {
    dayPart = `${days} ${days === 1 ? 'day' : 'days'} `
  }

  let timePart = ''
  if (days > 0) {
    timePart = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else if (hours > 0) {
    timePart = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    timePart = `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return dayPart + timePart
}

export function usePersistedReducer<S, A>(reducer: Reducer<S, A>, initialState: S, storageKey: string): [S, React.Dispatch<A>] {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        // Handle Map deserialization
        if (data.todos) data.todos = new Map(data.todos)
        if (data.timeLog) data.timeLog = new Map(data.timeLog)
        return data
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error)
    }
    return init
  })

  useEffect(() => {
    try {
      const dataToStore: Record<string, unknown> = { ...(state as Record<string, unknown>) }
      // Handle Map serialization
      if (dataToStore.todos instanceof Map) {
        dataToStore.todos = Array.from(dataToStore.todos.entries())
      }
      if (dataToStore.timeLog instanceof Map) {
        dataToStore.timeLog = Array.from(dataToStore.timeLog.entries())
      }
      localStorage.setItem(storageKey, JSON.stringify(dataToStore))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }, [state, storageKey])

  return [state, dispatch]
}

export function generateId(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

