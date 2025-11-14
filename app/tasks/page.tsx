'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import TaskTable from '@/components/TaskTable';
import {
  getTasks,
  getAvailableWorkers,
  sortTasksByPriority,
  sortTasksByDeadline,
  searchTasks,
  exportToCSV,
  assignTaskToWorker,
  unassignTask,
  completeTask,
  initializeData,
} from '@/lib/data';
import { Task, Priority, Worker } from '@/lib/types';

type SortOption = 'priority' | 'deadline' | 'created' | 'none';
type FilterOption = 'all' | 'active' | 'completed' | 'assigned' | 'unassigned';

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  useEffect(() => {
    initializeData();
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [allTasks, searchQuery, sortBy, filterBy, priorityFilter]);

  const loadData = () => {
    setAllTasks(getTasks());
    setAvailableWorkers(getAvailableWorkers());
  };

  const applyFiltersAndSorting = () => {
    let tasks = [...allTasks];

    if (searchQuery.trim()) {
      tasks = searchTasks(searchQuery.trim());
    }

    switch (filterBy) {
      case 'active':
        tasks = tasks.filter((task) => !task.completed);
        break;
      case 'completed':
        tasks = tasks.filter((task) => task.completed);
        break;
      case 'assigned':
        tasks = tasks.filter((task) => task.assignedTo !== null);
        break;
      case 'unassigned':
        tasks = tasks.filter((task) => task.assignedTo === null);
        break;
      default:
        break;
    }

    if (priorityFilter !== 'all') {
      tasks = tasks.filter((task) => task.priority === priorityFilter);
    }

    switch (sortBy) {
      case 'priority':
        tasks = sortTasksByPriority(tasks);
        break;
      case 'deadline':
        tasks = sortTasksByDeadline(tasks);
        break;
      case 'created':
        tasks = [...tasks].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        break;
    }

    setFilteredTasks(tasks);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 2500);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccess('');
  };

  const handleAssignTask = (taskId: string, workerId: string) => {
    try {
      assignTaskToWorker(taskId, workerId);
      loadData();
      showSuccess('Task assigned successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to assign task');
    }
  };

  const handleUnassignTask = (taskId: string) => {
    try {
      unassignTask(taskId);
      loadData();
      showSuccess('Task unassigned successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to unassign task');
    }
  };

  const handleCompleteTask = (taskId: string) => {
    try {
      completeTask(taskId);
      loadData();
      showSuccess('Task completed successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to complete task');
    }
  };

  const handleExportCSV = () => {
    try {
      const csvContent = exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tasks_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('Tasks exported successfully');
    } catch (err) {
      showError('Failed to export tasks');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('none');
    setFilterBy('all');
    setPriorityFilter('all');
  };

  const stats = [
    {
      label: 'Total Tasks',
      value: allTasks.length,
      badge: 'Pipeline',
      accent: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Active Tasks',
      value: allTasks.filter((t) => !t.completed).length,
      badge: 'In Motion',
      accent: 'from-amber-500 to-rose-500',
    },
    {
      label: 'Completed',
      value: allTasks.filter((t) => t.completed).length,
      badge: 'Closed',
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Unassigned',
      value: allTasks.filter((t) => !t.assignedTo && !t.completed).length,
      badge: 'Queue',
      accent: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="page-shell min-h-screen">
      <Navigation />

      <main className="relative">
        <div className="max-w-7xl mx-auto pt-12 pb-16 px-4 sm:px-6 lg:px-8 space-y-10">
          <section className="card p-8 bg-gradient-to-br from-white via-white to-slate-50 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,_rgba(37,99,235,0.08),_transparent_55%)]" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.6em] text-slate-400">Task Command</p>
                <h1 className="mt-3 text-4xl font-semibold text-slate-900">Operational Workbench</h1>
                <p className="mt-4 text-slate-500 max-w-2xl">
                  Prioritize cleans, balance worker loads, and keep every facility spotless. Filter by priority,
                  deadline, assignment state, or search by keyword with lightning responsiveness.
                </p>
              </div>
              <div className="glass-panel rounded-3xl px-8 py-6 text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Live Queue</p>
                <p className="mt-4 text-5xl font-semibold text-slate-900">{filteredTasks.length}</p>
                <p className="text-sm text-slate-500">Tasks matching filters</p>
                <div className="mt-6 flex flex-col gap-2 text-left text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>High priority</span>
                    <span className="font-semibold text-slate-900">
                      {filteredTasks.filter((t) => t.priority === 'high').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Assigned</span>
                    <span className="font-semibold text-slate-900">
                      {filteredTasks.filter((t) => t.assignedTo).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Due in 48h</span>
                    <span className="font-semibold text-rose-600">
                      {filteredTasks.filter(
                        (t) => new Date(t.deadline).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000
                      ).length}
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

          <section className="card p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[220px]">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by task, ID, or worker..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Sort</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="none">No sorting</option>
                  <option value="priority">Priority</option>
                  <option value="deadline">Deadline</option>
                  <option value="created">Created date</option>
                </select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="all">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={clearFilters}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  onClick={handleExportCSV}
                  className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-sm font-semibold shadow hover:shadow-lg"
                >
                  Export CSV
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {(['all', 'active', 'completed', 'assigned', 'unassigned'] as FilterOption[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterBy(status)}
                    className={`badge px-4 py-2 rounded-full text-xs ${
                      filterBy === status
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                )
              )}
            </div>
          </section>
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="card p-6 relative overflow-hidden">
                <div className={`absolute inset-x-4 top-4 h-32 rounded-3xl bg-gradient-to-r ${stat.accent} opacity-20`} />
                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{stat.badge}</p>
                  <p className="mt-4 text-4xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-6">
            <TaskTable
              tasks={filteredTasks}
              showCompleted={filterBy === 'all' || filterBy === 'completed'}
              onAssignTask={handleAssignTask}
              onUnassignTask={handleUnassignTask}
              onCompleteTask={handleCompleteTask}
              availableWorkers={availableWorkers}
            />

            {filteredTasks.length === 0 && (
              <div className="card p-8 text-center text-slate-400">
                {allTasks.length === 0
                  ? 'No tasks found. Create assignments to populate the queue.'
                  : 'No tasks match your current filters.'}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}


