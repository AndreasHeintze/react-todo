import {TodoProvider} from "./contexts/TodoProvider"
import TodoApp from './TodoApp'
import './App.css'

function App() {
  return (
    <div className="bg-havelock-blue-700 min-h-dvh font-sans">
      <main className="@container container mx-auto max-w-[1000px]">
        <TodoProvider>
          <TodoApp />
        </TodoProvider>
      </main>
    </div>
  )
}

export default App
