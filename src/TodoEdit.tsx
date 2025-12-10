import { FormEvent } from 'react'
import { useTodoContext } from './contexts/TodoContext'
import type { Todo } from './types'

interface TodoEditProps {
  todo: Todo
}

export default function TodoEdit({ todo }: TodoEditProps) {
  const { dispatch } = useTodoContext()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    dispatch({ type: 'SAVE_TODO', payload: { todo, data: { ...data, mode: 'list' } } })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ interpolateSize: 'allow-keywords' }}
      className={
        'block overflow-hidden transition-[height] duration-300 ease-in-out ' + (todo.mode === 'edit' ? 'h-auto' : 'h-0')
      }
      inert={todo.mode !== 'edit'}
      data-mode={todo.mode}
    >
      <div className="space-y-3 p-3 pt-1">
        <label className="py-2 font-semibold" htmlFor={todo.id + '-title'}>
          Title
        </label>
        <input
          id={todo.id + '-title'}
          type="text"
          name="title"
          defaultValue={todo.title}
          placeholder="Title"
          className="block w-full max-w-[80ch] border border-neutral-300 bg-white p-2"
        />

        <label className="py-2 font-semibold" htmlFor={todo.id + '-descr'}>
          Description
        </label>
        <textarea
          id={todo.id + '-descr'}
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
      </div>
    </form>
  )
}
