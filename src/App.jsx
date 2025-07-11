import {TodoProvider} from "./contexts/TodoProvider"
import TodoApp from './TodoApp'
import './App.css'

function App() {
  return (
    <div className="bg-havelock-blue-700 min-h-dvh p-0 font-sans sm:px-4 sm:py-10">
      <main className="container mx-auto max-w-[1000px]">
        <TodoProvider>
          <TodoApp />
        </TodoProvider>
      </main>
    </div>
  )
}

export default App
