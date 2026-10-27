import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TaskItem } from '../models/snippet.model';
import { ToastService } from './toast.service';

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Migrate Auth tokens to SignalStore',
    description: 'Replace legacy BehaviorSubject auth session with deep immutable signalStore slices.',
    status: 'todo',
    priority: 'high',
    tag: 'security',
    assignee: 'Alex Rivers',
    createdAt: '1d ago'
  },
  {
    id: 'task-2',
    title: 'Add WebAssembly SQLite caching layer',
    description: 'Integrate browser OPFS with SQLite Wasm for offline query indexation.',
    status: 'in_progress',
    priority: 'medium',
    tag: 'storage',
    assignee: 'Alex Rivers',
    createdAt: '2d ago'
  },
  {
    id: 'task-3',
    title: 'Implement toSignal() SSE stream handler',
    description: 'Transform server-sent events directly to Signals using RxJS interop.',
    status: 'in_progress',
    priority: 'high',
    tag: 'signals',
    assignee: 'Alex Rivers',
    createdAt: '3d ago'
  },
  {
    id: 'task-4',
    title: 'Profile OnPush change detection overhead',
    description: 'Verify 0 unnecessary zone.js ticks across large snippet matrices.',
    status: 'todo',
    priority: 'high',
    tag: 'perf',
    assignee: 'Alex Rivers',
    createdAt: '3d ago'
  },
  {
    id: 'task-5',
    title: 'Hardened Docker container UID10001',
    description: 'Audit production Dockerfile rootless execution and unprivileged users.',
    status: 'todo',
    priority: 'medium',
    tag: 'devops',
    assignee: 'Alex Rivers',
    createdAt: '4d ago'
  },
  {
    id: 'task-6',
    title: 'Add Dynamic Metadata FormArray validator',
    description: 'Ensure snippet tags are valid alphanumeric slugs without leading hashes.',
    status: 'todo',
    priority: 'low',
    tag: 'forms',
    assignee: 'Alex Rivers',
    createdAt: '5d ago'
  },
  {
    id: 'task-7',
    title: 'Glitch-free DAG node benchmarking',
    description: 'Confirm diamond dependency evaluation resolves in single synchronous pass.',
    status: 'todo',
    priority: 'low',
    tag: 'core',
    assignee: 'Alex Rivers',
    createdAt: '5d ago'
  },
  {
    id: 'task-8',
    title: 'Clean up unneeded NgModules from legacy specs',
    description: 'Remove deprecated NgModule wrappers and finalize pure Standalone architecture.',
    status: 'todo',
    priority: 'low',
    tag: 'refactor',
    assignee: 'Alex Rivers',
    createdAt: '6d ago'
  },
  {
    id: 'task-9',
    title: 'Setup Docker multi-stage build cache',
    description: 'Leverage BuildKit cache mounts in GitHub Actions workflow.',
    status: 'done',
    priority: 'medium',
    tag: 'devops',
    assignee: 'Alex Rivers',
    createdAt: '1w ago'
  },
  {
    id: 'task-10',
    title: 'Bootstrap DevVault Standalone Angular 22 shell',
    description: 'Initial CLI project spinup with Tailwind 4 and SSR configuration.',
    status: 'done',
    priority: 'high',
    tag: 'setup',
    assignee: 'Alex Rivers',
    createdAt: '1w ago'
  }
];

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly toast = inject(ToastService);

  readonly tasks = signal<TaskItem[]>([]);

  constructor() {
    this.initTasks();

    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        try {
          localStorage.setItem('dev_vault_tasks_v2', JSON.stringify(this.tasks()));
        } catch {
          // ignore
        }
      });
    }
  }

  private initTasks() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem('dev_vault_tasks_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.tasks.set(parsed);
            return;
          }
        }
      } catch {
        // fallback
      }
    }
    this.tasks.set(INITIAL_TASKS);
  }

  readonly pendingCount = computed(() => {
    return this.tasks().filter(t => t.status !== 'done').length;
  });

  readonly todoTasks = computed(() => {
    return this.tasks().filter(t => t.status === 'todo');
  });

  readonly inProgressTasks = computed(() => {
    return this.tasks().filter(t => t.status === 'in_progress');
  });

  readonly doneTasks = computed(() => {
    return this.tasks().filter(t => t.status === 'done');
  });

  addTask(title: string, description: string, priority: 'low' | 'medium' | 'high' = 'medium', tag = 'task') {
    const newTask: TaskItem = {
      id: 'task-' + Date.now().toString(36),
      title,
      description,
      status: 'todo',
      priority,
      tag,
      assignee: 'Alex Rivers',
      createdAt: 'Just now'
    };
    this.tasks.update(list => [newTask, ...list]);
    this.toast.show('Task Created', `"${title}" added to backlog.`, 'success');
  }

  moveTask(id: string, newStatus: 'todo' | 'in_progress' | 'done') {
    this.tasks.update(list =>
      list.map(t => (t.id === id ? { ...t, status: newStatus } : t))
    );
  }

  deleteTask(id: string) {
    const t = this.tasks().find(x => x.id === id);
    this.tasks.update(list => list.filter(x => x.id !== id));
    if (t) {
      this.toast.show('Task Removed', `"${t.title}" deleted.`, 'info');
    }
  }
}
