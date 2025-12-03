import { useContext } from 'react'
import { TodoContext } from './contexts/TodoContext'
import { formatTimeSpent, formatDate, formatTime, roundMs } from './helpers'

export default function TodoTimeLog({ todo }) {
  const { state, dispatch } = useContext(TodoContext)
  const todoTimeLog = [...state.timeLog.values()].filter((timeItem) => timeItem.todoId === todo.id)

  console.log('TodoTimeLog')

  return (
    <div
      style={{ interpolateSize: 'allow-keywords' }}
      className={'overflow-hidden transition-[height] duration-300 ease-in-out ' + (todo.mode === 'timelog' ? 'h-auto' : 'h-0')}
      inert={todo.mode !== 'timelog' || undefined}
    >
      <div className="space-y-3 p-3 pt-1">
        <h3 className="font-semibold">Time log</h3>
        <ul className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 overflow-auto border border-neutral-200 bg-white p-2 pr-0 font-mono text-sm @2xl:gap-y-1">
          {todoTimeLog.length === 0 && <li className="text-left">No times registered yet.</li>}

          {todoTimeLog.length > 0 && (
            <li className="col-span-2 grid grid-cols-subgrid gap-4 font-semibold odd:bg-neutral-50">
              <div className="flex gap-4">
                <div className="w-57">Start</div>
                <div>&nbsp;</div>
                <div className="w-57">Stop</div>
              </div>
              <div className="pr-2 text-right">Time</div>
            </li>
          )}

          {todoTimeLog.length > 0 &&
            todoTimeLog.map((timeItem, index) => (
              <li key={timeItem.id} className="col-span-2 grid grid-cols-subgrid gap-4 py-3 odd:bg-neutral-50 @2xl:py-0">
                <div className="flex gap-4">
                  <div className="flex items-center gap-3">
                    {/* Start: Native date picker */}
                    <input
                      type="date"
                      className="w-29"
                      value={formatDate(timeItem.start)} // "2025-12-03"
                      onChange={(e) => {
                        const [y, m, d] = e.target.value.split('-')
                        const newDate = new Date(timeItem.start)
                        newDate.setFullYear(+y, +m - 1, +d)
                        dispatch({
                          type: 'UPDATE_TIMEITEM',
                          payload: { ...timeItem, start: newDate.getTime() },
                        })
                      }}
                    />

                    {/* Start: Native time picker */}
                    <input
                      type="time"
                      step="1"
                      className="w-25"
                      value={formatTime(timeItem.start)} // "09:14:37"
                      onChange={(e) => {
                        const [h, m, s] = e.target.value.split(':')
                        const newDate = new Date(timeItem.start)
                        newDate.setHours(+h, +m, +s || 0)
                        dispatch({
                          type: 'UPDATE_TIMEITEM',
                          payload: { ...timeItem, start: newDate.getTime() },
                        })
                      }}
                    />
                  </div>

                  <div>-</div>

                  <div className="flex items-center gap-3">
                    {/* Stop: Native date picker */}
                    <input
                      type="date"
                      className="w-29"
                      value={formatDate(timeItem.stop)} // "2025-12-03"
                      disabled={todo.isTimerRunning && todoTimeLog.length === index + 1}
                      onChange={(e) => {
                        const [y, m, d] = e.target.value.split('-')
                        const newDate = new Date(timeItem.stop)
                        newDate.setFullYear(+y, +m - 1, +d)
                        dispatch({
                          type: 'UPDATE_TIMEITEM',
                          payload: { ...timeItem, stop: newDate.getTime() },
                        })
                      }}
                    />

                    {/* Stop: Native time picker */}
                    <input
                      type="time"
                      step="1"
                      className="w-25"
                      value={formatTime(timeItem.stop)} // "09:14:37"
                      disabled={todo.isTimerRunning && todoTimeLog.length === index + 1}
                      onChange={(e) => {
                        const [h, m, s] = e.target.value.split(':')
                        const newDate = new Date(timeItem.stop)
                        newDate.setHours(+h, +m, +s || 0)
                        dispatch({
                          type: 'UPDATE_TIMEITEM',
                          payload: { ...timeItem, stop: newDate.getTime() },
                        })
                      }}
                    />
                  </div>
                </div>
                <div className="pr-2 text-right whitespace-nowrap">
                  {formatTimeSpent(roundMs(timeItem.stop) - roundMs(timeItem.start))}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
