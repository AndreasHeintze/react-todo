import { useState, useContext } from 'react'
import { TodoContext } from './contexts/TodoContext.js'

export default function TodoInput() {
  const { dispatch } = useContext(TodoContext)
  const [titleInput, setTitleInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch({ type: 'ADD_TODO', payload: titleInput })
    setTitleInput('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8 flex text-base">
        <label htmlFor="titleInput" className="sr-only">
          Enter your todo title
        </label>

        <input
          id="titleInput"
          name="titleInput"
          placeholder="Enter your todo title here"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          className="focus:ring-green-haze-500 focus:border-green-haze-500 mr-2 w-full rounded border border-neutral-400 bg-white p-4 focus:ring-2 focus:outline-none"
          aria-describedby="todo-help"
          required
        />

        <button
          type="submit"
          className="bg-green-haze-500 hover:bg-green-haze-600 focus:ring-green-haze-500 flex w-20 cursor-pointer items-center justify-center rounded px-4 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:outline-none"
          aria-label="Add new todo"
        >
          Add
        </button>
      </div>

      <p id="todo-help" className="sr-only">
        Enter a title for your todo item and click the Add button or press <kbd>Enter</kbd> to create it.
      </p>
    </form>
  )
}
