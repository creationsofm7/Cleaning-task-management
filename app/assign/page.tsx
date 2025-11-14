'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import {
  addWorker,
  addTask,
  assignTaskToWorker,
  getWorkers,
  getAvailableWorkers,
  initializeData,
  validateDate,
} from '@/lib/data';
import { Priority, Worker } from '@/lib/types';

export default function AssignPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [workerName, setWorkerName] = useState<string>('');
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
    setAvailableWorkers(getAvailableWorkers());
  };

  const showMessage = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 2500);
    } else {
      setError(message);
      setSuccess('');
    }
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerName.trim()) {
      showMessage('error', 'Worker name is required');
      return;
    }

    try {
      const newWorker = addWorker(workerName.trim());
      setWorkerName('');
      loadData();
      showMessage('success', `Crew member ${newWorker.name} added (ID ${newWorker.id})`);
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to add worker');
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskDescription.trim()) {
      showMessage('error', 'Task description is required');
      return;
    }

    if (!validateDate(taskDeadline)) {
      showMessage('error', 'Please enter a valid deadline');
      return;
    }

    if (taskTimeEstimate <= 0) {
      showMessage('error', 'Time estimate must be greater than 0');
      return;
    }

    try {
      const newTask = addTask(taskDescription.trim(), taskPriority, taskTimeEstimate, taskDeadline);

      if (assignToWorker) {
        assignTaskToWorker(newTask.id, assignToWorker);
        showMessage('success', `Task “${newTask.description}” created and assigned to ${assignToWorker}`);
      } else {
        showMessage('success', `Task “${newTask.description}” created`);
      }

      setTaskDescription('');
      setTaskPriority('medium');
      setTaskTimeEstimate(1);
      setTaskDeadline('');
      setAssignToWorker('');
      loadData();
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  return (
    <div className="page-shell min-h-screen">
      <Navigation />

      <main className="relative">
        <div className="max-w-6xl mx-auto pt-12 pb-16 px-4 sm:px-6 lg:px-8 space-y-10">
          <section className="card p-8 bg-gradient-to-br from-white via-white to-slate-50 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.08),_transparent_55%)]" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.6em] text-slate-400">Assignment Studio</p>
                <h1 className="mt-3 text-4xl font-semibold text-slate-900">Create Workflows Effortlessly</h1>
                <p className="mt-4 text-slate-500 max-w-2xl">
                  Add crew members, prioritize high-impact cleans, and push jobs straight into the operations queue.
                  Validation keeps capacity planning pristine while the interface stays beautifully minimal.
                </p>
              </div>
              <div className="glass-panel rounded-3xl px-8 py-6 text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Available Crew</p>
                <p className="mt-4 text-5xl font-semibold text-slate-900">{availableWorkers.length}</p>
                <p className="text-sm text-slate-500">Ready for deployment</p>
                <div className="mt-6">
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{
                        width: `${Math.round(
                          (availableWorkers.length / Math.max(workers.length, 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {workers.length === 0 ? 'Add workers to unlock scheduling' : 'Capacity utilization'}
                  </p>
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

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleAddWorker} className="card p-6 space-y-5">
              <header>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Crew Intake</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Add New Worker</h2>
                <p className="text-sm text-slate-500 mt-1">Capture remote staff and set them live in one tap.</p>
              </header>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Worker name
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. Naomi Adeyemi"
                  required
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Add Worker
              </button>
            </form>

            <form onSubmit={handleAddTask} className="card p-6 space-y-5">
              <header>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Task Intake</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create Task</h2>
                <p className="text-sm text-slate-500 mt-1">Set priority, effort, deadline, and optional owner.</p>
              </header>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Task description
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={4}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Describe the cleaning scope, access notes, standards..."
                  required
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Priority
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Time estimate (hours)
                  <input
                    type="number"
                    value={taskTimeEstimate}
                    onChange={(e) => setTaskTimeEstimate(Number(e.target.value))}
                    min="0.5"
                    step="0.5"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Deadline
                <input
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Assign to worker (optional)
                <select
                  value={assignToWorker}
                  onChange={(e) => setAssignToWorker(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Do not assign yet</option>
                  {availableWorkers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} — {8 - worker.totalAssignedHours}h free
                    </option>
                  ))}
                </select>
                {availableWorkers.length === 0 && (
                  <p className="text-xs text-slate-400">
                    No capacity available. Add workers or free up hours.
                  </p>
                )}
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Publish Task
              </button>
            </form>
          </section>

          <section className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Crew Roster</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Current Workers ({workers.length})
                </h2>
              </div>
              <span className="badge px-4 py-2 rounded-full bg-slate-100 text-slate-600">
                {availableWorkers.length} available
              </span>
            </div>
            {workers.length === 0 ? (
              <div className="mt-8 text-center text-slate-400">
                Add your first worker to kick off scheduling.
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{worker.name}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-[0.3em]">
                          {worker.id}
                        </p>
                      </div>
                      <span
                        className={`badge px-3 py-1 rounded-full text-xs ${
                          worker.availability
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {worker.availability ? 'Available' : 'Offline'}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Load</p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                          style={{ width: `${(worker.totalAssignedHours / 8) * 100}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {worker.totalAssignedHours}h / 8h booked
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

