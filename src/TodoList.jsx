import Todo from "./Todo"

export default function TodoList({
  todos,
  currentTime,
  onTodoSave,
  onTodoEdit,
  onTodoDelete,
  onTodoToggleTimer,
  onTodoCompleted,
}) {
  return (
    <ul>
      {
        todos.toReversed().map((todo) => {
          return (
            <li className={`p-2 ${todo.isTimerRunning ? 'bg-stone-100' : ''}`} key={todo.id}>
              <Todo
                todo={todo}
                currentTime={currentTime}
                onTodoSave={onTodoSave}
                onTodoEdit={onTodoEdit}
                onTodoDelete={onTodoDelete}
                onTodoToggleTimer={onTodoToggleTimer}
                onTodoCompleted={onTodoCompleted}
              />
            </li>
          )
        })
      }
    </ul>
  )
}