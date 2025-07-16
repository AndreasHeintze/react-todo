import { useReducer, useEffect } from "react"

export function roundMs(timestamp) {
  return Math.round(timestamp / 1000) * 1000
}

export function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}

export function formatTime(timestamp) {
  // Round to nearest second
  const roundedTimestamp = roundMs(timestamp)
  const date = new Date(roundedTimestamp)
  return date.toLocaleTimeString()
}

export function formatTimeSpent(ms) {
  if (ms < 0) ms = 0

  const totalSeconds = Math.round(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  let dayPart = ""
  if (days > 0) {
    dayPart = `${days} ${days === 1 ? 'day' : 'days'} `
  }

  let timePart = ""
  if (days > 0) {
    timePart = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else if (hours > 0) {
    timePart = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    timePart = `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return dayPart + timePart
}

export function formatTimeSpentDisplay(startTimestamp, endTimestamp) {
  // Round both timestamps to nearest second
  const roundedStart = roundMs(startTimestamp)
  const roundedEnd = roundMs(endTimestamp)
  
  return formatTimeSpent(roundedEnd - roundedStart)
}

export function usePersistedReducer(reducer, initialState, storageKey) {
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
      // Don't persist swipedTodo
      const { swipedTodo: DUMMY, ...dataToStore } = state
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

export function generateId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
