export default function CheckBox({todo, onTodoCompleted}) {
  return (
    <div
      onClick={onTodoCompleted}
      className={`flex size-5 flex-shrink-0 cursor-pointer items-center justify-center rounded border-2 transition-all duration-200 ${
        todo.completed
          ? "border-green-600 bg-green-600 text-white"
          : "border-gray-300 bg-white hover:border-green-500"
      }`}
    >
      {todo.completed && (
        <svg
          className="h-4 w-4 stroke-current stroke-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
}