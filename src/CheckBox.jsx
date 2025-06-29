export default function CheckBox({todo, onTodoCompleted}) {
  return (
    <div 
      onClick={onTodoCompleted}
      className={`w-5 h-5 mr-3 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center flex-shrink-0 ${
        todo.completed 
          ? 'bg-green-600 border-green-600 text-white' 
          : 'bg-white border-gray-300 hover:border-green-500'
      }`}
    >
      {todo.completed && (
        <svg className="w-4 h-4 stroke-current stroke-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  )
}