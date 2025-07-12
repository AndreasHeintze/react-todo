import { useContext, useMemo } from 'react'
import { TodoContext } from './contexts/TodoContext'
import { formatDate, formatTime, formatTimeSpent } from './helpers'

export default function TodoEdit({ todo }) {
  const { timeLog } = useContext(TodoContext)

  const todoTimeLog = useMemo(() => timeLog.filter((timeItem) => timeItem.todoId === todo.id), [timeLog, todo.id])

  return (
    <div className="space-y-3 p-3 pt-1">
      <h3>Time log</h3>
      <ul className="border border-stone-200 bg-white p-2 text-right font-mono text-sm">
        {todoTimeLog.map((timeItem) => (
          <li key={timeItem.id} className="flex justify-between gap-4 odd:bg-stone-50">
            <div className="flex gap-4">
              <div>{formatDate(timeItem.start)}</div>
              <div>
                {formatTime(timeItem.start)} - {timeItem.stop ? formatTime(timeItem.stop) : 'Running'}
              </div>
            </div>
            <div className="text-right">{timeItem.stop ? formatTimeSpent(timeItem.stop - timeItem.start) : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
