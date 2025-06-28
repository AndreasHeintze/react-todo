import {TodoProvider} from "./contexts/TodoProvider"
import TodoApp from './TodoApp'
import './App.css'

function App() {
  return (
    <main className="container my-10 mx-auto">
      <TodoProvider>
        <TodoApp />
      </TodoProvider>
    </main>
  )
}

export default App
