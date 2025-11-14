'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import TaskTable from '@/components/TaskTable';
import {
  getTasks,
  getWorkers,
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
import { Task, Priority } from '@/lib/types';

type SortOption = 'priority' | 'deadline' | 'created' | 'none';
type FilterOption = 'all' | 'active' | 'completed' | 'assigned' | 'unassigned';

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Filters and sorting
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
    const tasks = getTasks();
    const workers = getAvailableWorkers();
    setAllTasks(tasks);
    setAvailableWorkers(workers);
  };

  const applyFiltersAndSorting = () => {
    let tasks = [...allTasks];

    // Apply search filter
    if (searchQuery.trim()) {
      tasks = searchTasks(searchQuery.trim());
    }

    // Apply status filter
    switch (filterBy) {
      case 'active':
        tasks = tasks.filter(task => !task.completed);
        break;
      case 'completed':
        tasks = tasks.filter(task => task.completed);
        break;
      case 'assigned':
        tasks = tasks.filter(task => task.assignedTo !== null);
        break;
      case 'unassigned':
        tasks = tasks.filter(task => task.assignedTo === null);
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      tasks = tasks.filter(task => task.priority === priorityFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'priority':
        tasks = sortTasksByPriority(tasks);
        break;
      case 'deadline':
        tasks = sortTasksByDeadline(tasks);
        break;
      case 'created':
        tasks = [...tasks].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        // 'none' - keep original order
        break;
    }

    setFilteredTasks(tasks);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            View, sort, filter, and manage all tasks
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

        {/* Controls */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search tasks..."
                />
              </div>

              {/* Sort By */}
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="none">No Sorting</option>
                  <option value="priority">Priority</option>
                  <option value="deadline">Deadline</option>
                  <option value="created">Created Date</option>
                </select>
              </div>

              {/* Filter By Status */}
              <div>
                <label htmlFor="filterBy" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="filterBy"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Tasks</option>
                  <option value="active">Active Only</option>
                  <option value="completed">Completed Only</option>
                  <option value="assigned">Assigned Only</option>
                  <option value="unassigned">Unassigned Only</option>
                </select>
              </div>

              {/* Filter By Priority */}
              <div>
                <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priorityFilter"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-end space-x-2">
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {allTasks.length}
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
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {allTasks.filter(t => !t.completed).length}
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
                    <span className="text-white text-sm font-bold">C</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {allTasks.filter(t => t.completed).length}
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
                    <span className="text-white text-sm font-bold">U</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Unassigned
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {allTasks.filter(t => !t.assignedTo && !t.completed).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <TaskTable
          tasks={filteredTasks}
          showCompleted={filterBy === 'all' || filterBy === 'completed'}
          onAssignTask={handleAssignTask}
          onUnassignTask={handleUnassignTask}
          onCompleteTask={handleCompleteTask}
          availableWorkers={availableWorkers}
        />

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {allTasks.length === 0 ? 'No tasks found. Create some tasks first.' : 'No tasks match your current filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
