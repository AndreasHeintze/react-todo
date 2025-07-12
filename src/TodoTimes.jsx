import { useContext, useMemo } from 'react'
import { TodoContext } from './contexts/TodoContext'
import { formatDate, formatTime, formatTimeSpent } from './helpers'

export default function TodoEdit({ todo }) {
  const { timeLog } = useContext(TodoContext)

  const todoTimeLog = useMemo(() => timeLog.filter((timeItem) => timeItem.todoId === todo.id), [timeLog, todo.id])

  function getLoggedTimeTitle(timeItem) {
    const loggedTime = timeItem.stop ? formatTimeSpent(timeItem.stop - timeItem.start) : ''
    return loggedTime ? `Logged time ${loggedTime}` : ''
  }
  function getStartDateTitle(timeItem) {
    return `Start date ${formatDate(timeItem.start)}`
  }
  function getStartTimeTitle(timeItem) {
    return `Start time ${formatDate(timeItem.stop)} ${formatTime(timeItem.stop)}`
  }
  function getStopTimeTitle(timeItem) {
    return timeItem.stop ? `Stop time ${formatDate(timeItem.stop)} ${formatTime(timeItem.stop)}` : 'Still running'
  }

  return (
    <div className="space-y-3 p-3 pt-1">
      <h3>Time log</h3>
      <ul className="border border-stone-200 bg-white p-2 text-right font-mono text-sm">
        {todoTimeLog.length === 0 && <li className="text-left">No times registered yet.</li>}
        {todoTimeLog.length > 0 &&
          todoTimeLog.map((timeItem) => (
            <li key={timeItem.id} className="flex justify-between gap-4 odd:bg-stone-50">
              <div className="flex gap-4">
                <div title={getStartDateTitle(timeItem)}>{formatDate(timeItem.start)}</div>
                <div title={getStartTimeTitle(timeItem)}>{formatTime(timeItem.start)}</div>
                <div>-</div>
                <div title={getStopTimeTitle(timeItem)}>{timeItem.stop ? formatTime(timeItem.stop) : 'Running'}</div>
              </div>
              <div className="text-right" title={getLoggedTimeTitle(timeItem)}>
                {timeItem.stop ? formatTimeSpent(timeItem.stop - timeItem.start) : ''}
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}
