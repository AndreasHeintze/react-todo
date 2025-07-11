import { useContext, useRef } from 'react'
import { TodoContext } from './contexts/TodoContext'

export default function TodoEdit({ todo }) {
  const { handleTodoSave } = useContext(TodoContext)
  const titleRef = useRef(null)
  const descrRef = useRef(null)

  function handleSubmit(ev) {
    ev.preventDefault()
    const formData = new FormData(ev.target)
    const data = Object.fromEntries(formData)
    handleTodoSave(ev, todo, { ...data, mode: 'list' })
  }

  return (
    <form onSubmit={handleSubmit} className="block space-y-3 p-3 pt-1">
      <label className="py-2 font-semibold" htmlFor={titleRef}>
        Title
      </label>
      <input
        ref={titleRef}
        type="text"
        name="title"
        defaultValue={todo.title}
        placeholder="Title"
        className="block w-full max-w-[80ch] border border-stone-300 bg-white p-2"
      />

      <label className="py-2 font-semibold" htmlFor={descrRef}>
        Description
      </label>
      <textarea
        ref={descrRef}
        name="descr"
        defaultValue={todo.descr}
        placeholder="Description"
        className="block min-h-40 w-full max-w-[80ch] border border-stone-300 bg-white p-2"
      ></textarea>

      <div className="mt-4 flex gap-4">
        <button
          type="submit"
          className={`flex h-8 w-42 cursor-pointer items-center justify-center rounded border border-stone-400 bg-stone-200 p-1 font-medium text-stone-900 transition-colors duration-200 hover:border-stone-400 hover:bg-stone-300 focus:ring-2 focus:ring-stone-500 focus:outline-none`}
          aria-label={`Save todo`}
        >
          Save
        </button>

        <button
          type="button"
          onClick={(ev) => handleTodoSave(ev, todo, { mode: 'list' })}
          className={`flex h-8 w-42 cursor-pointer items-center justify-center rounded border border-stone-400 bg-stone-200 p-1 font-medium text-stone-600 transition-colors duration-200 hover:border-stone-400 hover:bg-stone-300 focus:ring-2 focus:ring-stone-500 focus:outline-none`}
          aria-label={`Cancel editing`}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
