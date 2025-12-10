import { useTodoContext } from './contexts/TodoContext'
import { formatDateTimeLocal, formatTimeSpent, roundMs } from './helpers'
import { X } from 'lucide-react'
import type { Todo } from './types'

interface TodoTimeLogProps {
  todo: Todo
}

export default function TodoTimeLog({ todo }: TodoTimeLogProps) {
  const { state, dispatch } = useTodoContext()
  const todoTimeLog = [...state.timeLog.values()].filter((timeItem) => timeItem.todoId === todo.id)

  return (
    <div
      style={{ interpolateSize: 'allow-keywords' }}
      className={'overflow-hidden transition-[height] duration-300 ease-in-out ' + (todo.mode === 'timelog' ? 'h-auto' : 'h-0')}
      inert={todo.mode !== 'timelog'}
    >
      <div className="space-y-3 p-3 pt-1">
        <h3 className="font-semibold">Time log</h3>
        <ul className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 overflow-auto border border-neutral-200 bg-white p-2 pr-0 font-mono text-sm @2xl:gap-y-1">
          {todoTimeLog.length === 0 && <li className="text-left">No times registered yet.</li>}

          {todoTimeLog.length > 0 && (
            <li className="col-span-2 grid grid-cols-subgrid gap-4 font-semibold">
              <div className="flex gap-4">
                <div className="w-48">Start</div>
                <div>&nbsp;</div>
                <div className="w-48">Stop</div>
              </div>
              <div className="mr-8 pr-2 text-right">Time</div>
            </li>
          )}

          {todoTimeLog.length > 0 &&
            todoTimeLog.map((timeItem, index) => (
              <li key={timeItem.id} className="col-span-2 grid grid-cols-subgrid gap-4 py-3 even:bg-neutral-50 @2xl:py-0">
                <div className="flex items-center gap-4">
                  <input
                    className="w-48"
                    type="datetime-local"
                    step="1"
                    value={formatDateTimeLocal(timeItem.start)}
                    max={formatDateTimeLocal(timeItem.stop)}
                    onChange={(e) => {
                      dispatch({
                        type: 'UPDATE_TIMEITEM',
                        payload: { ...timeItem, start: new Date(e.target.value).getTime() },
                      })
                    }}
                  />

                  <div>-</div>

                  <input
                    className="w-48"
                    type="datetime-local"
                    step="1"
                    value={formatDateTimeLocal(timeItem.stop)}
                    min={formatDateTimeLocal(timeItem.start)}
                    disabled={todo.isTimerRunning && todoTimeLog.length === index + 1}
                    onChange={(e) => {
                      dispatch({
                        type: 'UPDATE_TIMEITEM',
                        payload: { ...timeItem, stop: new Date(e.target.value).getTime() },
                      })
                    }}
                  />
                </div>
                <div className="flex items-center justify-end pr-2 whitespace-nowrap">
                  {formatTimeSpent(roundMs(timeItem.stop) - roundMs(timeItem.start))}
                  {state.runningTimeItem?.id !== timeItem.id ? (
                    <button
                      onClick={() => {
                        dispatch({
                          type: 'DELETE_TIMEITEM',
                          payload: timeItem.id,
                        })
                      }}
                      className="cursor-pointer p-2 text-red-600 transition-colors hover:text-red-800"
                      title="Radera"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <div className="w-8"></div>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
