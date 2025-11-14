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

  const summaryCards = [
    {
      label: 'Total Crew',
      value: workers.length,
      badge: 'Team Strength',
      accent: 'from-purple-500 to-indigo-500',
      footer: `${availableWorkers.length} currently available`,
    },
    {
      label: 'Active Tasks',
      value: activeTasks.length,
      badge: 'In Motion',
      accent: 'from-rose-500 to-amber-500',
      footer: `${completedTasks.length} completed`,
    },
    {
      label: 'Capacity',
      value: `${availableWorkers.length}/${workers.length || 1}`,
      badge: 'Ready Crew',
      accent: 'from-emerald-500 to-teal-500',
      footer: `${Math.round(
        (availableWorkers.length / Math.max(workers.length, 1)) * 100
      )}% availability`,
    },
    {
      label: 'Upcoming Deadlines',
      value: activeTasks.filter((task) => {
        const diff = new Date(task.deadline).getTime() - Date.now();
        return diff < 3 * 24 * 60 * 60 * 1000;
      }).length,
      badge: 'Next 72h',
      accent: 'from-blue-500 to-cyan-500',
      footer: 'Monitor urgent queue',
    },
  ];

  return (
    <div className="page-shell min-h-screen">
      <Navigation />

      <main className="relative">
        <div className="max-w-7xl mx-auto pt-12 pb-16 px-4 sm:px-6 lg:px-8 space-y-10">
          <section className="card p-8 bg-gradient-to-br from-white via-white to-slate-50 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,_rgba(124,58,237,0.08),_transparent_55%)]" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.6em] text-slate-400">Executive View</p>
                <h1 className="mt-3 text-4xl font-semibold text-slate-900">Operations Command Center</h1>
                <p className="mt-4 text-slate-500 max-w-2xl">
                  Monitor your remote cleaning teams, prioritize assignments, and keep every facility spotless.
                  This panel synthesizes worker load, queue health, and upcoming deadlines in one elegant control room.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="badge px-4 py-2 rounded-full bg-slate-100 text-slate-600">
                    FIFO Scheduling
                  </span>
                  <span className="badge px-4 py-2 rounded-full bg-slate-100 text-slate-600">
                    Priority Sorting
                  </span>
                  <span className="badge px-4 py-2 rounded-full bg-slate-100 text-slate-600">
                    Real-time Capacity
                  </span>
                </div>
              </div>
              <div className="glass-panel rounded-3xl px-8 py-6 text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Today&apos;s Focus</p>
                <p className="mt-4 text-5xl font-semibold text-slate-900">{activeTasks.length}</p>
                <p className="text-sm text-slate-500">Jobs awaiting assignment or completion</p>
                <div className="mt-6 flex flex-col gap-2 text-left text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Available crew</span>
                    <span className="font-semibold text-slate-900">{availableWorkers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed today</span>
                    <span className="font-semibold text-slate-900">{completedTasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Urgent tasks</span>
                    <span className="font-semibold text-rose-600">
                      {
                        activeTasks.filter((task) =>
                          new Date(task.deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 text-rose-700 px-6 py-4 shadow">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 text-emerald-700 px-6 py-4 shadow">
              {success}
            </div>
          )}

          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {summaryCards.map((card) => (
                <div key={card.label} className="card p-6 relative overflow-hidden">
                  <div className={`absolute inset-x-4 top-4 h-32 rounded-3xl bg-gradient-to-r ${card.accent} opacity-10`} />
                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{card.badge}</p>
                    <p className="mt-4 text-4xl font-semibold text-slate-900">{card.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{card.label}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">{card.footer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-10">
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
