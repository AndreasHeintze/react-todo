import { useContext, useRef, useState, useEffect } from 'react'
import { GripVertical } from 'lucide-react'
import { TodoContext } from './contexts/TodoContext'
import TodoCompletedCheckbox from './TodoCompletedCheckbox'
import TodoEdit from './TodoEdit'
import TodoTimeLog from './TodoTimeLog'
import TodoButtons from './TodoButtons'

export default function Todo({ todo, style, attributes, listeners, ref }) {
  const { dispatch, handleScroll } = useContext(TodoContext)
  const swipeTodoRef = useRef(null)
  const totalTimeRef = useRef(null)
  const [titleWidth, setTitleWidth] = useState(0)

  // Calc <title-width> = <todo-width> - <timer-width> - 266 or 82
  useEffect(() => {
    // Calculate on todo change
    calculateWidth()

    // Also re-calculate on window resize
    window.addEventListener('resize', calculateWidth)

    function calculateWidth() {
      if (swipeTodoRef.current && totalTimeRef.current) {
        const spacer = swipeTodoRef.current.offsetWidth > 671 ? 266 : 82
        const newTitleWidth = swipeTodoRef.current.offsetWidth - totalTimeRef.current.offsetWidth - spacer
        setTitleWidth(newTitleWidth)
      }
    }

    return () => window.removeEventListener('resize', calculateWidth)
  }, [todo])

  function handleQuickEditKey(e) {
    e.stopPropagation()
    if (e.key === 'Escape') {
      e.target.innerText = todo.title
      e.target.blur()
    }
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  function handleQuickSave(e) {
    const payload = { todo, data: { title: e.target.innerText.trim(), mode: 'list' } }

    if (!payload.data.title) {
      payload.data.title = todo.title
      e.target.innerText = todo.title
    }

    dispatch({ type: 'SAVE_TODO', payload })
  }

  return (
    <div
      ref={ref}
      className={`${todo.color} shadow-tiny relative rounded border-l-5 bg-radial from-white from-50% to-neutral-50`}
      style={style}
    >
      <div
        ref={swipeTodoRef}
        data-swipeable="true"
        onScroll={handleScroll}
        className="scrollbar-hide flex snap-x snap-proximity scroll-px-3 items-center justify-between overflow-x-auto rounded px-2 py-2 pr-3"
      >
        {/** Drag, checkbox and title section */}
        <div className="flex items-center justify-start gap-2">
          {/** Drag handle */}
          {!todo.isCompleted && (
            <div {...attributes} {...listeners} className="cursor-grab snap-start" aria-label="Drag to reorder">
              <GripVertical size={20} className="text-neutral-400" />
            </div>
          )}
          {/** Some space */}
          {todo.isCompleted && <div className="size-[20px] min-w-[20px] snap-start"></div>}

          {/** Todo completed checkbox */}
          <TodoCompletedCheckbox todo={todo} />

          {/** Todo title */}
          <div
            onClick={() => dispatch({ type: 'SAVE_TODO', payload: { todo, data: { mode: 'quickedit' } } })}
            onKeyDown={handleQuickEditKey}
            onBlur={handleQuickSave}
            suppressContentEditableWarning={true}
            contentEditable={todo.mode === 'quickedit' ? 'plaintext-only' : 'false'}
            style={{ minWidth: titleWidth }}
            className={
              `rounded p-1 pr-0 leading-5 font-semibold focus:outline-none ` +
              `${todo.mode !== 'quickedit' ? 'line-clamp-1' : 'overflow-x-hidden whitespace-nowrap'} ` +
              `${todo.isCompleted && 'line-through opacity-50'}`
            }
            title={todo.mode === 'quickedit' ? '' : 'Click to edit'}
            aria-label={todo.mode === 'quickedit' ? 'Edit todo title' : 'Todo title'}
            role={todo.mode === 'quickedit' ? 'textbox' : 'button'}
            tabIndex={todo.mode === 'quickedit' ? 0 : -1}
            aria-multiline="false"
            aria-describedby={todo.mode === 'quickedit' ? `todo-${todo.id}-hint` : undefined}
          >
            {todo.title}
          </div>

          {/* Screen reader hint for edit mode */}
          {todo.mode === 'quickedit' && (
            <div id={`todo-${todo.id}-hint`} className="sr-only">
              Press Enter to save
            </div>
          )}
        </div>

        <TodoButtons ref={totalTimeRef} todo={todo} />
      </div>
      <TodoEdit todo={todo} />
      <TodoTimeLog todo={todo} />
    </div>
  )
}
