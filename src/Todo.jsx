import { forwardRef, useContext, useRef, useState, useEffect } from 'react'
import { GripVertical } from 'lucide-react'
import { TodoContext } from './contexts/TodoContext'
import CheckBox from './CheckBox'
import TodoEdit from './TodoEdit'
import TodoTimes from './TodoTimes'
import TodoButtons from './TodoButtons'

const Todo = forwardRef(({ todo, style, attributes, listeners }, ref) => {
  const { swipedTodo, setSwipedTodo, handleTodoSave, handleTodoCompleted, handleTodoContentEditable } = useContext(TodoContext)

  const swipeTodoRef = useRef(null)
  const todoTitleRef = useRef(null)
  const totalTimeRef = useRef(null)
  const [titleWidth, setTitleWidth] = useState(0)

  // Calc <title-width> = <todo-width> - <timer-width> - 76
  useEffect(() => {
    // Calculate on todo change
    calculateWidth()

    // Also re-calculate on window resize
    window.addEventListener('resize', calculateWidth)

    function calculateWidth() {
      if (swipeTodoRef.current && totalTimeRef.current) {
        const spacer = swipeTodoRef.current.offsetWidth > 671 ? 220 : 76
        const newTitleWidth = swipeTodoRef.current.offsetWidth - totalTimeRef.current.offsetWidth - spacer
        setTitleWidth(newTitleWidth)
      }
    }

    return () => window.removeEventListener('resize', calculateWidth)
  }, [todo])

  // Set swiped todo & swipe other back
  const handleScrollEnd = (() => {
    let scrollTimeout
    return (ev) => {
      ev.stopPropagation()
      if (todo.completed) {
        setSwipedTodo(null)
        return false
      }
      const scrolledTodo = ev.currentTarget
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        if (scrolledTodo.scrollLeft !== 0) {
          if (swipedTodo && swipedTodo.ref !== scrolledTodo) {
            swipedTodo.ref.scrollTo({
              left: 0,
              behavior: 'smooth',
            })
          }
          setSwipedTodo({ id: todo.id, ref: scrolledTodo })
        } else {
          setSwipedTodo(null)
        }
      }, 200)
    }
  })()

  return (
    <div
      ref={ref}
      className={`${todo.color} shadow-tiny relative rounded border-l-5 bg-radial from-white from-50% to-stone-50`}
      style={style}
    >
      {todo.isTimerRunning && (
        <span className="absolute top-1 right-1 z-0 flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex size-2 rounded-full bg-red-500"></span>
        </span>
      )}

      <div
        ref={swipeTodoRef}
        data-swipeable="true"
        onScrollEnd={handleScrollEnd}
        onTouchEnd={handleScrollEnd}
        className="scrollbar-hide flex snap-x snap-proximity scroll-px-3 items-center justify-between overflow-x-auto rounded p-3 pl-2"
      >
        {/** Drag, checkbox and title section */}
        <div className="flex items-center justify-start gap-2">
          {/** Drag handle */}
          {!todo.completed && (
            <div {...attributes} {...listeners} className="cursor-grab snap-start" aria-label="Drag to reorder">
              <GripVertical size={20} className="text-gray-400" />
            </div>
          )}
          {/** Some space */}
          {todo.completed && <div className="size-[20px] min-w-[20px] snap-start"></div>}

          {/** Todo completed checkbox */}
          <CheckBox todo={todo} onTodoCompleted={(ev) => handleTodoCompleted(ev, todo)} />

          {/** Todo title text */}
          {todo.mode !== 'edit' && (
            <div
              className={`${todo.mode === 'list' ? 'line-clamp-1' : 'overflow-x-hidden whitespace-nowrap'} rounded p-1 font-semibold focus:outline-none`}
              ref={todoTitleRef}
              onKeyDown={(ev) => handleTodoContentEditable(ev, todo)}
              onBlur={(ev) => handleTodoSave(ev, todo, { title: ev.target.innerText, mode: 'list' })}
              onClick={(ev) => handleTodoSave(ev, todo, { mode: 'quickedit' })}
              suppressContentEditableWarning={true}
              contentEditable={todo.mode === 'quickedit' ? 'plaintext-only' : 'false'}
              style={{
                minWidth: titleWidth,
                textDecoration: todo.completed ? 'line-through' : '',
                opacity: todo.completed ? 0.5 : 1,
              }}
              title={todo.mode === 'quickedit' ? '' : 'Click to edit'}
              aria-label={todo.mode === 'quickedit' ? 'Edit todo title' : `Todo: ${todo.title}`}
              role={todo.mode === 'quickedit' ? 'textbox' : 'button'}
              tabIndex={todo.mode === 'quickedit' ? 0 : -1}
              aria-multiline="false"
              aria-describedby={todo.mode === 'quickedit' ? `todo-${todo.id}-hint` : undefined}
            >
              {todo.title}
            </div>
          )}

          {/* Screen reader hint for edit mode */}
          {todo.mode === 'quickedit' && (
            <div id={`todo-${todo.id}-hint`} className="sr-only">
              Press Enter to save
            </div>
          )}
        </div>

        <TodoButtons ref={totalTimeRef} todo={todo} />
      </div>
      {todo.mode === 'edit' && <TodoEdit todo={todo} />}
      {todo.mode === 'timelog' && <TodoTimes todo={todo} />}
    </div>
  )
})

Todo.displayName = 'Todo'

export default Todo
