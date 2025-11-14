'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import {
  addWorker,
  addTask,
  getWorkers,
  getAvailableWorkers,
  initializeData,
  validateDate,
} from '@/lib/data';
import { Priority } from '@/lib/types';

export default function AssignPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Worker form state
  const [workerName, setWorkerName] = useState<string>('');

  // Task form state
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskTimeEstimate, setTaskTimeEstimate] = useState<number>(1);
  const [taskDeadline, setTaskDeadline] = useState<string>('');
  const [assignToWorker, setAssignToWorker] = useState<string>('');

  useEffect(() => {
    initializeData();
    loadData();
  }, []);

  const loadData = () => {
    setWorkers(getWorkers());
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccess('');
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerName.trim()) {
      showError('Worker name is required');
      return;
    }

    try {
      const newWorker = addWorker(workerName.trim());
      setWorkerName('');
      loadData();
      showSuccess(`Worker ${newWorker.name} added successfully with ID ${newWorker.id}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add worker');
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskDescription.trim()) {
      showError('Task description is required');
      return;
    }

    if (!validateDate(taskDeadline)) {
      showError('Please enter a valid deadline date');
      return;
    }

    if (taskTimeEstimate <= 0) {
      showError('Time estimate must be greater than 0');
      return;
    }

    try {
      const newTask = addTask(
        taskDescription.trim(),
        taskPriority,
        taskTimeEstimate,
        taskDeadline
      );

      // If a worker is selected, assign the task
      if (assignToWorker) {
        // Import the assign function dynamically to avoid circular imports
        import('@/lib/data').then(({ assignTaskToWorker }) => {
          try {
            assignTaskToWorker(newTask.id, assignToWorker);
            showSuccess(`Task "${newTask.description}" created and assigned to worker ${assignToWorker}`);
          } catch (assignErr) {
            showSuccess(`Task "${newTask.description}" created successfully, but assignment failed: ${assignErr instanceof Error ? assignErr.message : 'Unknown error'}`);
          }
        });
      } else {
        showSuccess(`Task "${newTask.description}" created successfully with ID ${newTask.id}`);
      }

      // Reset form
      setTaskDescription('');
      setTaskPriority('medium');
      setTaskTimeEstimate(1);
      setTaskDeadline('');
      setAssignToWorker('');
      loadData();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add task');
    }
  };

  const availableWorkers = getAvailableWorkers();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assign Tasks</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add new workers and create tasks for your cleaning business
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Worker Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Add New Worker
              </h3>
              <form onSubmit={handleAddWorker} className="space-y-4">
                <div>
                  <label htmlFor="workerName" className="block text-sm font-medium text-gray-700">
                    Worker Name
                  </label>
                  <input
                    type="text"
                    id="workerName"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter worker name"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Worker
                </button>
              </form>
            </div>
          </div>

          {/* Create Task Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Create New Task
              </h3>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700">
                    Task Description
                  </label>
                  <textarea
                    id="taskDescription"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe the cleaning task"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      id="taskPriority"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as Priority)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="taskTimeEstimate" className="block text-sm font-medium text-gray-700">
                      Time Estimate (hours)
                    </label>
                    <input
                      type="number"
                      id="taskTimeEstimate"
                      value={taskTimeEstimate}
                      onChange={(e) => setTaskTimeEstimate(Number(e.target.value))}
                      min="0.5"
                      step="0.5"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="taskDeadline" className="block text-sm font-medium text-gray-700">
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="taskDeadline"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="assignToWorker" className="block text-sm font-medium text-gray-700">
                    Assign to Worker (Optional)
                  </label>
                  <select
                    id="assignToWorker"
                    value={assignToWorker}
                    onChange={(e) => setAssignToWorker(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Don't assign yet</option>
                    {availableWorkers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} (Available: {8 - worker.totalAssignedHours}h)
                      </option>
                    ))}
                  </select>
                  {availableWorkers.length === 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      No available workers. Add workers or mark some as available.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Create Task
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Current Workers Summary */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Current Workers ({workers.length})
            </h3>
            {workers.length === 0 ? (
              <p className="text-gray-500">No workers added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker) => (
                  <div key={worker.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{worker.name}</h4>
                        <p className="text-sm text-gray-500">ID: {worker.id}</p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          worker.availability
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {worker.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">
                        Hours assigned: {worker.totalAssignedHours}/8
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
