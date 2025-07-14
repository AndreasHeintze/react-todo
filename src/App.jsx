import {TodoProvider} from "./contexts/TodoProvider"
import TodoApp from './TodoApp'
import './App.css'

function App() {
  return (
    <div className="bg-havelock-blue-700 min-h-dvh font-sans">
      <main className="container mx-auto">
        <TodoProvider>
          <TodoApp />
        </TodoProvider>
      </main>
    </div>
  )
}

export default App
