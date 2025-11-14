'use client';

import { Task, Worker } from '@/lib/types';

interface TaskTableProps {
  tasks: Task[];
  showCompleted?: boolean;
  onAssignTask?: (taskId: string, workerId: string) => void;
  onUnassignTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  availableWorkers?: Worker[];
}

const PRIORITY_STYLES: Record<string, { label: string; classes: string }> = {
  high: {
    label: 'High Priority',
    classes: 'bg-rose-50 text-rose-600 border border-rose-100',
  },
  medium: {
    label: 'Medium Priority',
    classes: 'bg-amber-50 text-amber-600 border border-amber-100',
  },
  low: {
    label: 'Low Priority',
    classes: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  },
};

export default function TaskTable({
  tasks,
  showCompleted = false,
  onAssignTask,
  onUnassignTask,
  onCompleteTask,
  availableWorkers = [],
}: TaskTableProps) {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const filteredTasks = showCompleted ? tasks : tasks.filter((task) => !task.completed);

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-6 border-b border-slate-100/80 bg-gradient-to-r from-white via-white to-indigo-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Workflow</p>
            <h3 className="text-2xl font-semibold text-slate-900">
              Tasks {showCompleted ? 'Overview' : 'In Progress'}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              {showCompleted ? 'All assignments including completed work' : 'Active queue awaiting action'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-semibold text-slate-900">{filteredTasks.length}</p>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Tasks</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">ID</th>
              <th className="px-6 py-3 text-left font-semibold">Task</th>
              <th className="px-6 py-3 text-left font-semibold">Priority</th>
              <th className="px-6 py-3 text-left font-semibold">Time</th>
              <th className="px-6 py-3 text-left font-semibold">Deadline</th>
              <th className="px-6 py-3 text-left font-semibold">Assignment</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                  No tasks found.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.low;
                return (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{task.id}</td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-medium text-slate-900">{task.description}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mt-1">
                        Added {formatDate(task.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge inline-flex px-3 py-1 rounded-full text-xs ${priority.classes}`}>
                        {priority.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{task.timeEstimate}h</p>
                      <p className="text-xs text-slate-400">Effort</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{formatDate(task.deadline)}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-[0.2em]">
                          Deadline
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {task.assignedTo ? (
                        <div>
                          <p className="font-semibold text-slate-900">{task.assignedTo}</p>
                          <span className="text-xs text-slate-400 uppercase tracking-[0.2em]">Assigned</span>
                        </div>
                      ) : (
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-300">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!task.completed && (
                        <div className="flex flex-col gap-2">
                          {task.assignedTo ? (
                            <>
                              {onUnassignTask && (
                                <button
                                  onClick={() => onUnassignTask(task.id)}
                                  className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-all"
                                >
                                  Unassign
                                </button>
                              )}
                              {onCompleteTask && (
                                <button
                                  onClick={() => onCompleteTask(task.id)}
                                  className="text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow hover:shadow-lg transition-all"
                                >
                                  Complete
                                </button>
                              )}
                            </>
                          ) : (
                            onAssignTask &&
                            availableWorkers.length > 0 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    onAssignTask(task.id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="text-xs border border-slate-200 rounded-full px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                defaultValue=""
                              >
                                <option value="">Assign to...</option>
                              {availableWorkers.map((worker) => (
                                <option key={worker.id} value={worker.id}>
                                  {worker.name} · {Math.max(0, 8 - worker.totalAssignedHours)}h free
                                </option>
                              ))}
                              </select>
                            )
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
