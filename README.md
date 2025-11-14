# Cleaning Business Worker Management System

A comprehensive web application demonstrating advanced **Data Structures and Algorithms (DSA)** concepts through a real-world cleaning business management system. Built with Next.js, TypeScript, and Tailwind CSS.

## 🎯 Project Overview

This application implements a remote worker management system that assigns tasks to cleaning staff by ID, prioritizes them (high/medium/low), allocates time estimates, and sets deadlines. It serves as an educational showcase of how DSA principles are applied in practical software development.

### Key Features
- **Worker Management**: Add, track, and manage cleaning staff availability
- **Task Assignment**: Create and assign cleaning tasks with priorities and deadlines
- **FIFO Queue Management**: Automatic task assignment with capacity constraints
- **Advanced Filtering**: Search, sort, and filter tasks by multiple criteria
- **Real-time Capacity Tracking**: Monitor worker workloads and availability
- **CSV Export**: Export task and worker data for reporting

## 🏗️ System Architecture

### MVC Pattern Implementation
```
├── Model (Data Layer)
│   ├── lib/data.ts         # Core business logic & data operations
│   ├── lib/types/index.ts  # TypeScript interfaces & type definitions
│   └── Local Storage       # Persistence layer
│
├── View (UI Layer)
│   ├── components/         # Reusable React components
│   └── app/                # Next.js pages & routing
│
└── Controller (Logic Layer)
    ├── Task Assignment     # Business rules & validation
    ├── Sorting Algorithms  # Priority & deadline sorting
    └── Queue Management    # FIFO operations
```

### Component Architecture
- **Navigation**: Glass-morphism header with route management
- **Dashboard**: Executive overview with statistics and data tables
- **Assign Page**: Worker/task creation forms with validation
- **Tasks Page**: Advanced filtering, sorting, and task management
- **Data Tables**: Responsive tables with inline actions

## 🔍 DSA Implementation Details

### Data Structures Used

#### 1. **Arrays as FIFO Queues**
```typescript
// Task queue implementation using JavaScript Arrays
tasks: Task[] = []; // FIFO queue for task assignment

// Queue operations
tasks.push(newTask);    // Enqueue (O(1))
const task = tasks.shift(); // Dequeue (O(n) - JavaScript array limitation)
```

**Use Case**: Task assignment follows First-In-First-Out (FIFO) scheduling. New tasks are added to the end of the queue and assigned to available workers in order.

#### 2. **Hash Maps for O(1) Lookups**
```typescript
// Worker lookup table for instant access
workerMap: Map<string, Worker> = new Map();

// Operations
workerMap.set(workerId, worker);     // O(1) insertion
const worker = workerMap.get(workerId); // O(1) lookup
workerMap.has(workerId);             // O(1) existence check
```

**Use Case**: Instant worker lookup by ID when assigning tasks, checking availability, or updating status.

#### 3. **Priority Weight System**
```typescript
const PRIORITY_WEIGHTS: Record<Priority, number> = {
  high: 3,      // Highest priority
  medium: 2,    // Medium priority
  low: 1,       // Lowest priority
};
```

**Use Case**: Enables custom sorting algorithms based on business-defined priority levels.

### Algorithms Implemented

#### 1. **Priority-Based Sorting (O(n log n))**
```typescript
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // First sort by priority weight (descending)
    const priorityDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by deadline (ascending) for same priority
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}
```

**Use Case**: Dashboard and task views show tasks in priority order, ensuring high-impact cleaning jobs are addressed first.

#### 2. **Deadline-Based Sorting (O(n log n))**
```typescript
export function sortTasksByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}
```

**Use Case**: Time-sensitive cleaning tasks are sorted by deadline to prevent service delays.

#### 3. **Linear Search for Filtering (O(n))**
```typescript
export function searchTasks(query: string): Task[] {
  const lowercaseQuery = query.toLowerCase();
  return tasks.filter(task =>
    task.description.toLowerCase().includes(lowercaseQuery) ||
    task.id.toLowerCase().includes(lowercaseQuery) ||
    (task.assignedTo && task.assignedTo.toLowerCase().includes(lowercaseQuery))
  );
}
```

**Use Case**: Real-time search functionality across task descriptions, IDs, and assigned workers.

#### 4. **Capacity-Aware Assignment Algorithm**
```typescript
export function assignTaskToWorker(taskId: string, workerId: string): void {
  const worker = workerMap.get(workerId);
  const task = tasks.find(t => t.id === taskId);

  // Capacity validation
  if (worker.totalAssignedHours + task.timeEstimate > MAX_WORK_HOURS_PER_DAY) {
    throw new Error(`Worker would exceed maximum hours (${MAX_WORK_HOURS_PER_DAY})`);
  }

  // Assignment with capacity tracking
  task.assignedTo = workerId;
  worker.totalAssignedHours += task.timeEstimate;
}
```

**Use Case**: Prevents worker overload by enforcing 8-hour daily capacity limits.

### Performance Characteristics

| Operation | Time Complexity | Space Complexity | Use Case |
|-----------|----------------|------------------|----------|
| Worker Lookup | O(1) | O(n) | Task assignment |
| Task Search | O(n) | O(1) | Filtering tasks |
| Priority Sort | O(n log n) | O(n) | Dashboard display |
| Queue Operations | O(1) enqueue, O(n) dequeue* | O(n) | Task management |
| CSV Export | O(n) | O(n) | Data reporting |

*Note: JavaScript Array.shift() is O(n), but for this application size (typically <100 tasks), this is acceptable.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tm-dsa
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Start the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 How to Use the System

### 1. Dashboard (`/`)
- View executive overview with key metrics
- Monitor worker capacity and task queues
- See real-time statistics and urgent deadlines
- Quick access to task assignment actions

### 2. Assign Tasks (`/assign`)
- **Add Workers**: Create new cleaning staff with automatic ID generation (W001, W002, etc.)
- **Create Tasks**: Define cleaning jobs with:
  - Description and priority level
  - Time estimates (0.5-8 hours)
  - Deadlines
  - Optional immediate assignment
- **Capacity Monitoring**: Real-time availability tracking

### 3. Task Management (`/tasks`)
- **Advanced Filtering**: Search by keyword, status, priority
- **Multiple Sort Options**: Priority, deadline, creation date
- **Bulk Operations**: Assign, unassign, complete tasks
- **CSV Export**: Download task data for reporting
- **Real-time Updates**: Live queue statistics

### 4. Data Persistence
- All data automatically saves to browser localStorage
- No external database required
- Data persists between browser sessions

## 🛠️ Technical Implementation

### Core Technologies
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with custom design system
- **Local Storage**: Client-side persistence

### Key Design Patterns

#### 1. **Custom Hooks Pattern**
```typescript
// Centralized data management
export function useWorkerData() {
  const [workers, setWorkers] = useState<Worker[]>([]);

  const addWorker = (name: string) => {
    // Implementation
  };

  return { workers, addWorker };
}
```

#### 2. **Factory Pattern for Data Operations**
```typescript
// Consistent data operation interface
export const dataOperations = {
  createWorker: (name: string) => addWorker(name),
  createTask: (params) => addTask(params),
  assignTask: (taskId, workerId) => assignTaskToWorker(taskId, workerId),
};
```

#### 3. **Observer Pattern for UI Updates**
```typescript
// Reactive data binding
useEffect(() => {
  // Automatically update UI when data changes
  setTasks(getTasks());
}, [dataVersion]);
```

## 🎨 UI/UX Design System

### Design Principles
- **Glass-morphism**: Modern, translucent UI elements
- **Gradient Accents**: Purple-to-blue gradients for visual hierarchy
- **Card-based Layout**: Organized information architecture
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG-compliant color contrasts and interactions

### Component Library
- **Navigation**: Sticky header with glass effect
- **Data Tables**: Responsive with inline actions
- **Forms**: Rounded inputs with focus states
- **Cards**: Shadowed containers with subtle borders
- **Badges**: Status indicators with consistent styling

## 📊 Business Logic Implementation

### Worker Capacity Management
```typescript
const MAX_WORK_HOURS_PER_DAY = 8;

function canAssignTask(worker: Worker, task: Task): boolean {
  return worker.availability &&
         (worker.totalAssignedHours + task.timeEstimate) <= MAX_WORK_HOURS_PER_DAY;
}
```

### Task Priority Scoring
```typescript
function calculateTaskScore(task: Task): number {
  const priorityScore = PRIORITY_WEIGHTS[task.priority];
  const urgencyScore = calculateUrgency(task.deadline);
  return priorityScore + urgencyScore;
}
```

### FIFO Queue with Priority Override
```typescript
function getNextTaskToAssign(): Task | null {
  // Check for urgent high-priority tasks first
  const urgentTasks = tasks.filter(task =>
    task.priority === 'high' &&
    isUrgent(task.deadline) &&
    !task.assignedTo
  );

  if (urgentTasks.length > 0) {
    return urgentTasks[0]; // Override FIFO for urgent tasks
  }

  // Fall back to FIFO for regular tasks
  return tasks.find(task => !task.assignedTo) || null;
}
```

## 🔒 Error Handling & Validation

### Input Validation
- **Worker IDs**: Auto-generated (W001, W002, etc.)
- **Task IDs**: Auto-generated (T001, T002, etc.)
- **Dates**: Future date validation
- **Time Estimates**: 0.5-8 hour range enforcement
- **Capacity Limits**: 8-hour daily maximum per worker

### Error Recovery
- **Data Corruption**: Automatic fallback to empty state
- **Storage Errors**: Graceful degradation with user feedback
- **Network Issues**: Offline-first architecture with localStorage

## 🚀 Performance Optimizations

### 1. **Efficient Data Structures**
- Hash maps for O(1) worker lookups
- Indexed arrays for fast iteration
- Minimal object creation in render loops

### 2. **Lazy Loading**
- Components load only when needed
- Dynamic imports for heavy operations
- Progressive enhancement for features

### 3. **Memoization**
```typescript
const filteredTasks = useMemo(() => {
  return applyFiltersAndSorting(tasks, filters);
}, [tasks, filters]);
```

## 📈 Scalability Considerations

### Current Limitations
- Browser localStorage (5-10MB limit)
- Client-side only (no server synchronization)
- Single-user system

### Future Enhancements
- **Database Integration**: PostgreSQL/MongoDB for multi-user support
- **Real-time Sync**: WebSocket connections for live updates
- **Advanced Scheduling**: Calendar integration and recurring tasks
- **Analytics Dashboard**: Performance metrics and reporting

## 🧪 Testing Strategy

### Unit Tests
- Data structure operations
- Algorithm correctness
- Business logic validation
- Type safety verification

### Integration Tests
- Component interactions
- Data flow verification
- UI state management
- Error handling scenarios

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-dsa-algorithm`
3. **Implement changes with proper DSA documentation**
4. **Add comprehensive tests**
5. **Update README with new algorithm explanations**
6. **Submit a pull request**

## 📚 Educational Value

This project serves as a practical example of how fundamental computer science concepts are applied in modern web development:

- **Arrays**: Dynamic storage, queue operations
- **Hash Tables**: Fast lookups, data indexing
- **Sorting Algorithms**: Priority-based ordering
- **Search Algorithms**: Linear search with filtering
- **Time Complexity**: Performance analysis and optimization
- **Space Complexity**: Memory usage considerations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ to demonstrate the power of Data Structures and Algorithms in real-world applications.**
