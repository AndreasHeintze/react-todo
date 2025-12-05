import TodoInput from './TodoInput.js'
import TodoList from './TodoList.js'

export default function TodoApp() {
  return (
    <div className="@container/TodoApp mx-auto max-w-[1000px]">
      <div className="p-fluid-sm @[640px]:p-0!">
        <div className="bg-transparent text-xs text-neutral-900 @[640px]:m-8 @[640px]:rounded-lg @[640px]:bg-white @[640px]:p-8 @[640px]:text-base @[640px]:shadow-lg @md:text-sm">
          <h1 className="mt-2 mb-8 text-3xl font-semibold text-white @[640px]:text-inherit">Todo Tracker</h1>
          <TodoInput />
          <TodoList />
        </div>
      </div>
    </div>
  )
}
