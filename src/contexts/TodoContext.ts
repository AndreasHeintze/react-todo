import { createContext, useContext } from 'react'
import type { TodoContextType } from '../types'

export const TodoContext = createContext<TodoContextType | null>(null)

export function useTodoContext() {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider')
  }
  return context
}
