import {useState, useEffect} from "react"

export function formatTime(ms) {
  if (ms < 0) ms = 0

  const totalSeconds = Math.floor(ms / 1000)
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

export function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
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
