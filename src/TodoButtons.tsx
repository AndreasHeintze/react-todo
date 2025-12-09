import { useRef, useEffect, forwardRef } from 'react'
import { useTodoContext } from './contexts/TodoContext'
import type { Todo as TodoType } from './types'
import { Edit, Timer, Trash2, LoaderCircle } from 'lucide-react'
import TodoTimeSpent from './TodoTimeSpent'
import Button from '@/components/ui/Button'

interface TodoButtonsProps {
  todo: TodoType
}

const TodoButtons = forwardRef<HTMLButtonElement, TodoButtonsProps>(({ todo }, ref) => {
  const { dispatch } = useTodoContext()
  const buttonsRef = useRef<HTMLDivElement>(null)

  /**
   * This is a workaround for iPhone (IOS) to prevent todos
   * ending up swiped to the right when completing/un-completing
   * Which happens if I place the class directly on the element.
   */
  useEffect(() => {
    setTimeout(() => {
      buttonsRef.current?.classList.add('snap-end')
    }, 10)
  }, [])

  return (
    <div ref={buttonsRef} className="ml-2 flex items-center justify-end gap-3">
      {/** Total time spent */}
      <TodoTimeSpent ref={ref} todo={todo} />

      {/** Edit button */}
      <Button
        onClick={() => dispatch({ type: 'SAVE_TODO', payload: { todo, data: { mode: todo.mode === 'edit' ? 'list' : 'edit' } } })}
        disabled={todo.isCompleted}
        color="blue"
        ariaLabel="Edit this todo"
      >
        <Edit size={24} aria-hidden="true" />
      </Button>

      {/** Timer button */}
      <Button
        onClick={() => dispatch({ type: 'TOGGLE_TIMER', payload: { todo } })}
        disabled={todo.isCompleted}
        color="amber"
        ariaLabel={todo.isTimerRunning ? `Stop` : `Start` + ` timer for this todo`}
      >
        {!todo.isTimerRunning && <Timer size={26} aria-hidden="true" />}

        {todo.isTimerRunning && (
          <div className="relative" aria-label="Timer is running">
            <LoaderCircle size={26} className="animate-spin" aria-hidden="true" />
            <div className="absolute top-[9px] left-[9px] size-2 bg-current" aria-hidden="true"></div>
          </div>
        )}
      </Button>

      {/** Delete button */}
      <Button
        onClick={() => dispatch({ type: 'DELETE_TODO', payload: { id: todo.id } })}
        color="red"
        ariaLabel="Delete this todo"
        disabled={false}
      >
        <Trash2 size={24} aria-hidden="true" />
      </Button>
    </div>
  )
})

export default TodoButtons
