import {useState, useEffect} from "react"

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

export function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        const data = JSON.parse(saved)
        if ((key === 'todos' || key === 'timelog') && Array.isArray(data)) {
          return new Map(data.map((item) => [item.id, item]))
        }
        if (data.dataType === 'Map') {
          return new Map(data.value)
        }
        return data
      }
      return defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      if (state instanceof Map) {
        localStorage.setItem(key, JSON.stringify({ dataType: 'Map', value: Array.from(state.entries()) }))
      } else {
        localStorage.setItem(key, JSON.stringify(state))
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [key, state])

  return [state, setState]
}

export function useUniqueId() {
  if (crypto.randomUUID) {
    return () => crypto.randomUUID()
  }
  return () => Date.now().toString(36) + Math.random().toString(36).slice(2)
}
