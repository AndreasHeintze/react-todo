import { useContext } from 'react'
import { TodoContext } from './contexts/TodoContext'
import { formatDate, formatTime, formatTimeSpentDisplay } from './helpers'

export default function TodoTimeLog({ todo }) {
  const { state } = useContext(TodoContext)

  const todoTimeLog = () => [...state.timeLog.values()].filter((timeItem) => timeItem.todoId === todo.id)

  function getLoggedTimeTitle(timeItem) {
    const loggedTime = timeItem.stop ? formatTimeSpentDisplay(timeItem.start, timeItem.stop) : ''
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
    <div
      style={{ interpolateSize: 'allow-keywords' }}
      className={'overflow-hidden transition-[height] duration-300 ease-in-out ' + (todo.mode === 'timelog' ? 'h-auto' : 'h-0')}
    >
      <div className="space-y-3 p-3 pt-1">
        <h3 className="font-semibold">Time log</h3>
        <ul className="border border-neutral-200 bg-white p-2 text-right font-mono text-sm">
          {todoTimeLog.length === 0 && <li className="text-left">No times registered yet.</li>}

          {todoTimeLog.length > 0 && (
            <li className="flex justify-between gap-4 font-semibold odd:bg-neutral-50">
              <div className="flex gap-4">
                <div className={`hidden @[640px]:block`}>Start date</div>
                <div className="min-w-[68px] text-left">Start</div>
                <div>&nbsp;</div>
                <div className="min-w-[68px] text-left">Stop</div>
              </div>
              <div className="text-right">Time</div>
            </li>
          )}

          {todoTimeLog.length > 0 &&
            todoTimeLog.map((timeItem) => (
              <li key={timeItem.id} className="flex justify-between gap-4 odd:bg-neutral-50">
                <div className="flex gap-4">
                  <div className={`hidden @[640px]:block`} title={getStartDateTitle(timeItem)}>
                    {formatDate(timeItem.start)}
                  </div>

                  <div className="min-w-[68px]" title={getStartTimeTitle(timeItem)}>
                    {formatTime(timeItem.start)}
                  </div>

                  <div>-</div>

                  <div className="min-w-[68px] text-left" title={getStopTimeTitle(timeItem)}>
                    {timeItem.stop ? formatTime(timeItem.stop) : 'Running'}
                  </div>
                </div>
                <div className="text-right" title={getLoggedTimeTitle(timeItem)}>
                  {timeItem.stop ? formatTimeSpentDisplay(timeItem.start, timeItem.stop) : ''}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
