import type { Dispatch, UIEvent } from 'react'

export interface Todo {
  id: string
  title: string
  descr: string
  mode: 'list' | 'edit' | 'time' | 'quickedit' | 'timelog'
  color: string
  isTimerRunning: boolean
  sortOrder: number
  isCompleted: boolean
  completedAt: number | null
  createdAt: number
}

export interface TimeLogItem {
  id: string
  todoId: string
  start: number
  stop: number
}

export interface TodoState {
  todos: Map<string, Todo>
  timeLog: Map<string, TimeLogItem>
  openTodoId: string | null
  runningTimeItem: TimeLogItem | null
}

export type TodoAction =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'SAVE_TODO'; payload: { todo: Todo; data: Partial<Todo> } }
  | { type: 'COMPLETE_TODO'; payload: { todo: Todo } }
  | { type: 'TOGGLE_TIMER'; payload: { todo: Todo } }
  | { type: 'UPDATE_TIMEITEM'; payload: TimeLogItem }
  | { type: 'DELETE_TIMEITEM'; payload: string }
  | { type: 'SORT_TODOS'; payload: { draggedTodo: Todo; droppedOnTodo: Todo } }

export interface TodoContextType {
  state: TodoState
  dispatch: Dispatch<TodoAction>
  handleScroll: (e: UIEvent<HTMLElement>) => void
  activeTodos: Todo[]
  completedTodos: Todo[]
}
