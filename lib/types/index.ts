export type Priority = 'high' | 'medium' | 'low';

export interface Worker {
  id: string; // Format: W001, W002, etc.
  name: string;
  availability: boolean;
  totalAssignedHours: number; // Track workload
}

export interface Task {
  id: string; // Format: T001, T002, etc.
  description: string;
  priority: Priority;
  timeEstimate: number; // in hours
  deadline: string; // ISO date string (YYYY-MM-DD)
  assignedTo: string | null; // Worker ID or null if unassigned
  createdAt: string; // ISO date string
  completed: boolean;
}

export interface WorkerManagementData {
  workers: Worker[];
  tasks: Task[];
  nextWorkerId: number;
  nextTaskId: number;
}
