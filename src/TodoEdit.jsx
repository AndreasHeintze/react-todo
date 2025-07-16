import { useContext, useRef } from 'react'
import { TodoContext } from './contexts/TodoContext'

export default function TodoEdit({ todo }) {
  const { dispatch } = useContext(TodoContext)
  const titleRef = useRef(null)
  const descrRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    dispatch({ type: 'SAVE_TODO', payload: { todo, data: { ...data, mode: 'list' } } })
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
        className="block w-full max-w-[80ch] border border-neutral-300 bg-white p-2"
      />

      <label className="py-2 font-semibold" htmlFor={descrRef}>
        Description
      </label>
      <textarea
        ref={descrRef}
        name="descr"
        defaultValue={todo.descr}
        placeholder="Description"
        className="block min-h-40 w-full max-w-[80ch] border border-neutral-300 bg-white p-2"
      ></textarea>

      <div className="mt-4 flex gap-4">
        <button
          type="submit"
          className={`flex h-8 w-42 cursor-pointer items-center justify-center rounded border border-neutral-400 bg-neutral-200 p-1 font-medium text-neutral-900 transition-colors duration-200 hover:border-neutral-400 hover:bg-neutral-300 focus:ring-2 focus:ring-neutral-500 focus:outline-none`}
          aria-label={`Save todo`}
        >
          Save
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SAVE_TODO', payload: { todo, data: { mode: 'list' } } })}
          className={`flex h-8 w-42 cursor-pointer items-center justify-center rounded border border-neutral-400 bg-neutral-200 p-1 font-medium text-neutral-600 transition-colors duration-200 hover:border-neutral-400 hover:bg-neutral-300 focus:ring-2 focus:ring-neutral-500 focus:outline-none`}
          aria-label={`Cancel editing`}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
