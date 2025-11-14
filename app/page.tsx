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
import { Worker, Task } from '@/lib/types';

export default function Dashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    initializeData();
    loadData();
  }, []);

  const loadData = () => {
    setWorkers(getWorkers());
    setTasks(getTasks());
    setAvailableWorkers(getAvailableWorkers());
  };

  const handleFeedback = (type: 'error' | 'success', message: string) => {
    if (type === 'error') {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 2500);
    }
  };

  const wrapAction = (fn: () => void, successMessage: string) => {
    try {
      fn();
      loadData();
      handleFeedback('success', successMessage);
    } catch (err) {
      handleFeedback(
        'error',
        err instanceof Error ? err.message : 'Something went wrong'
      );
    }
  };

  const handleToggleAvailability = (workerId: string, availability: boolean) => {
    wrapAction(
      () => updateWorkerAvailability(workerId, availability),
      `Worker ${workerId} marked as ${availability ? 'available' : 'unavailable'}`
    );
  };

  const handleAssignTask = (taskId: string, workerId: string) => {
    wrapAction(() => assignTaskToWorker(taskId, workerId), `Task ${taskId} assigned to ${workerId}`);
  };

  const handleUnassignTask = (taskId: string) => {
    wrapAction(() => unassignTask(taskId), `Task ${taskId} is now unassigned`);
  };

  const handleCompleteTask = (taskId: string) => {
    wrapAction(() => completeTask(taskId), `Task ${taskId} completed`);
  };

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);


  return (
    <div className="page-shell min-h-screen">
      <Navigation />

      <main className="relative">
        <div className="max-w-7xl mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 text-red-700 px-4 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded border border-green-200 bg-green-50 text-green-700 px-4 py-2">
              {success}
            </div>
          )}

          <section className="space-y-8">
            <WorkerTable workers={workers} onToggleAvailability={handleToggleAvailability} />
            <TaskTable
              tasks={activeTasks}
              onAssignTask={handleAssignTask}
              onUnassignTask={handleUnassignTask}
              onCompleteTask={handleCompleteTask}
              availableWorkers={availableWorkers}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
