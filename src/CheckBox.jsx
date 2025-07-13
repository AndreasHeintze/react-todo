import { useCallback } from 'react'

export default function CheckBox({ todo, onTodoCompleted }) {
  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onTodoCompleted()
      }
    },
    [onTodoCompleted]
  )

  return (
    <button
      type="button"
      role="checkbox"
      onClick={onTodoCompleted}
      onKeyUp={handleKeyUp}
      className={`focus:ring-green-haze-500 flex size-6 flex-shrink-0 cursor-pointer items-center justify-center rounded border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
        todo.completed
          ? 'border-green-haze-600 bg-green-haze-600 text-white'
          : 'hover:border-green-haze-500 border-gray-300 bg-white'
      }`}
      aria-checked={todo.completed}
      aria-label={`Mark task "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
    >
      {todo.completed && (
        <svg className="h-4 w-4 stroke-current stroke-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  )
}
