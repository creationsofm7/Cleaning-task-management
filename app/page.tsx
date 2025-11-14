'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import WorkerTable from '@/components/WorkerTable';
import TaskTable from '@/components/TaskTable';
import {
  getWorkers,
  getTasks,
  getAvailableWorkers,
  updateWorkerAvailability,
  assignTaskToWorker,
  unassignTask,
  completeTask,
  initializeData,
} from '@/lib/data';

export default function Dashboard() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    initializeData();
    loadData();
  }, []);

  const loadData = () => {
    setWorkers(getWorkers());
    setTasks(getTasks());
    setAvailableWorkers(getAvailableWorkers());
  };

  const handleToggleAvailability = (workerId: string, availability: boolean) => {
    try {
      updateWorkerAvailability(workerId, availability);
      loadData();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update worker availability');
    }
  };

  const handleAssignTask = (taskId: string, workerId: string) => {
    try {
      assignTaskToWorker(taskId, workerId);
      loadData();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task');
    }
  };

  const handleUnassignTask = (taskId: string) => {
    try {
      unassignTask(taskId);
      loadData();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unassign task');
    }
  };

  const handleCompleteTask = (taskId: string) => {
    try {
      completeTask(taskId);
      loadData();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of your cleaning business operations
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">W</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Workers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {workers.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Available Workers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {availableWorkers.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {activeTasks.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">C</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {completedTasks.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workers Table */}
        <div className="mb-8">
          <WorkerTable
            workers={workers}
            onToggleAvailability={handleToggleAvailability}
          />
        </div>

        {/* Active Tasks Table */}
        <div className="mb-8">
          <TaskTable
            tasks={activeTasks}
            onAssignTask={handleAssignTask}
            onUnassignTask={handleUnassignTask}
            onCompleteTask={handleCompleteTask}
            availableWorkers={availableWorkers}
          />
        </div>
      </div>
    </div>
  );
}
