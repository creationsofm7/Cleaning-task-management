'use client';

import { Worker } from '@/lib/types';

interface WorkerTableProps {
  workers: Worker[];
  onToggleAvailability?: (workerId: string, availability: boolean) => void;
}

export default function WorkerTable({ workers, onToggleAvailability }: WorkerTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-6 border-b border-slate-100/80 bg-gradient-to-r from-white via-white to-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Team</p>
            <h3 className="text-2xl font-semibold text-slate-900">Crew Availability</h3>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-slate-500">Capacity</span>
            <div className="h-2 w-28 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                style={{
                  width: `${Math.min(
                    100,
                    (workers.filter((w) => w.availability).length / Math.max(workers.length, 1)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">ID</th>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Availability</th>
              <th className="px-6 py-3 text-left font-semibold">Assigned Hours</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {workers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  No workers found. Add some crew members to get started.
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{worker.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center font-semibold">
                        {worker.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{worker.name}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Crew</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`badge inline-flex px-3 py-1 rounded-full text-xs ${
                        worker.availability
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {worker.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{worker.totalAssignedHours}h / 8h</p>
                      <div className="mt-2 h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                          style={{ width: `${(worker.totalAssignedHours / 8) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {onToggleAvailability && (
                      <button
                        onClick={() => onToggleAvailability(worker.id, !worker.availability)}
                        className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                          worker.availability
                            ? 'bg-white text-rose-600 border border-rose-100 hover:bg-rose-50'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg'
                        }`}
                      >
                        {worker.availability ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
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
