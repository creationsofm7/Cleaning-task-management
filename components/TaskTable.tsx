'use client';

import { Task } from '@/lib/types';

interface TaskTableProps {
  tasks: Task[];
  showCompleted?: boolean;
  onAssignTask?: (taskId: string, workerId: string) => void;
  onUnassignTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  availableWorkers?: Array<{ id: string; name: string }>;
}

export default function TaskTable({
  tasks,
  showCompleted = false,
  onAssignTask,
  onUnassignTask,
  onCompleteTask,
  availableWorkers = []
}: TaskTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = showCompleted ? tasks : tasks.filter(task => !task.completed);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Tasks {showCompleted ? '(All)' : '(Active)'}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {showCompleted ? 'All tasks including completed ones.' : 'Active tasks that need attention.'}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No tasks found.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {task.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.timeEstimate}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(task.deadline)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.assignedTo || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {!task.completed && (
                      <>
                        {task.assignedTo ? (
                          <>
                            {onUnassignTask && (
                              <button
                                onClick={() => onUnassignTask(task.id)}
                                className="text-blue-600 hover:text-blue-900 text-xs"
                              >
                                Unassign
                              </button>
                            )}
                            {onCompleteTask && (
                              <button
                                onClick={() => onCompleteTask(task.id)}
                                className="text-green-600 hover:text-green-900 text-xs ml-2"
                              >
                                Complete
                              </button>
                            )}
                          </>
                        ) : (
                          onAssignTask && availableWorkers.length > 0 && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  onAssignTask(task.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                              defaultValue=""
                            >
                              <option value="">Assign to...</option>
                              {availableWorkers.map(worker => (
                                <option key={worker.id} value={worker.id}>
                                  {worker.name}
                                </option>
                              ))}
                            </select>
                          )
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
