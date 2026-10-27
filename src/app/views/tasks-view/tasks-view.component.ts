import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { SnippetService } from '../../services/snippet.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tasks-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6 max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-indigo-400 text-lg">⚏</span>
            <h1 class="text-base font-bold text-white tracking-tight">Tasks & Vault Settings</h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950/60 text-indigo-400 border border-indigo-500/30">
              {{ taskService.pendingCount() }} Pending
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Organize architecture milestones, manage local persistence, and configure DevVault synchronization.
          </p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="viewTab.set('board')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            [ngClass]="viewTab() === 'board' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'"
          >
            Sprint Kanban
          </button>
          <button
            type="button"
            (click)="viewTab.set('settings')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            [ngClass]="viewTab() === 'settings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'"
          >
            Vault Settings
          </button>
        </div>
      </div>

      @if (viewTab() === 'board') {
        <!-- Add Task Quick Input -->
        <div class="p-4 rounded-2xl border border-slate-800 bg-[#0f1523] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            [ngModel]="newTaskTitle()"
            (ngModelChange)="newTaskTitle.set($event)"
            (keydown.enter)="createTask()"
            placeholder="+ Quick add task title (e.g. Implement SQLite WASM driver)..."
            class="flex-1 px-3.5 py-2 rounded-xl bg-[#090e18] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <select
            [ngModel]="newTaskPriority()"
            (ngModelChange)="newTaskPriority.set($event)"
            class="px-3 py-2 rounded-xl bg-[#090e18] border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <button
            type="button"
            (click)="createTask()"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition shrink-0"
          >
            Add Task
          </button>
        </div>

        <!-- Kanban Board: 3 Columns -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          
          <!-- Column 1: To Do -->
          <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-300">To Do</span>
              </div>
              <span class="text-[11px] font-mono text-slate-500">{{ taskService.todoTasks().length }}</span>
            </div>

            <div class="space-y-2.5">
              @for (task of taskService.todoTasks(); track task.id) {
                <div class="p-3.5 rounded-xl bg-[#090e18] border border-slate-850 space-y-2 hover:border-slate-700 transition">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-xs font-semibold text-white leading-snug">{{ task.title }}</h4>
                    <span 
                      class="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border shrink-0"
                      [ngClass]="{
                        'bg-rose-950/60 text-rose-400 border-rose-500/30': task.priority === 'high',
                        'bg-amber-950/60 text-amber-400 border-amber-500/30': task.priority === 'medium',
                        'bg-slate-850 text-slate-400 border-slate-700': task.priority === 'low'
                      }"
                    >
                      {{ task.priority }}
                    </span>
                  </div>
                  @if (task.description) {
                    <p class="text-[11px] text-slate-400 leading-relaxed">{{ task.description }}</p>
                  }
                  <div class="pt-2 border-t border-slate-850/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>#{{ task.tag }}</span>
                    <div class="flex items-center gap-2">
                      <button
                        (click)="taskService.moveTask(task.id, 'in_progress')"
                        class="text-indigo-400 hover:text-white transition"
                      >
                        Start →
                      </button>
                      <button
                        (click)="taskService.deleteTask(task.id)"
                        class="text-slate-600 hover:text-rose-400 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Column 2: In Progress -->
          <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-300">In Progress</span>
              </div>
              <span class="text-[11px] font-mono text-slate-500">{{ taskService.inProgressTasks().length }}</span>
            </div>

            <div class="space-y-2.5">
              @for (task of taskService.inProgressTasks(); track task.id) {
                <div class="p-3.5 rounded-xl bg-[#090e18] border border-indigo-900/40 space-y-2 hover:border-indigo-600/50 transition">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-xs font-semibold text-white leading-snug">{{ task.title }}</h4>
                    <span 
                      class="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border shrink-0"
                      [ngClass]="{
                        'bg-rose-950/60 text-rose-400 border-rose-500/30': task.priority === 'high',
                        'bg-amber-950/60 text-amber-400 border-amber-500/30': task.priority === 'medium',
                        'bg-slate-850 text-slate-400 border-slate-700': task.priority === 'low'
                      }"
                    >
                      {{ task.priority }}
                    </span>
                  </div>
                  @if (task.description) {
                    <p class="text-[11px] text-slate-400 leading-relaxed">{{ task.description }}</p>
                  }
                  <div class="pt-2 border-t border-slate-850/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>#{{ task.tag }}</span>
                    <div class="flex items-center gap-2">
                      <button
                        (click)="taskService.moveTask(task.id, 'todo')"
                        class="text-slate-400 hover:text-white transition"
                      >
                        ← Back
                      </button>
                      <button
                        (click)="taskService.moveTask(task.id, 'done')"
                        class="text-emerald-400 hover:text-emerald-300 font-bold transition"
                      >
                        Complete ✔
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Column 3: Done -->
          <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Done</span>
              </div>
              <span class="text-[11px] font-mono text-slate-500">{{ taskService.doneTasks().length }}</span>
            </div>

            <div class="space-y-2.5">
              @for (task of taskService.doneTasks(); track task.id) {
                <div class="p-3.5 rounded-xl bg-[#090e18] border border-slate-850/70 space-y-2 opacity-80 hover:opacity-100 transition">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-xs font-medium text-slate-300 line-through leading-snug">{{ task.title }}</h4>
                    <span class="text-[9px] font-mono text-emerald-400">✔</span>
                  </div>
                  @if (task.description) {
                    <p class="text-[11px] text-slate-500 leading-relaxed">{{ task.description }}</p>
                  }
                  <div class="pt-2 border-t border-slate-850/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>#{{ task.tag }}</span>
                    <button
                      (click)="taskService.moveTask(task.id, 'in_progress')"
                      class="text-slate-400 hover:text-white transition"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      }

      @if (viewTab() === 'settings') {
        <!-- Settings Panel -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- LocalStorage & Keyring Panel -->
          <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-5 space-y-4">
            <h3 class="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>☁</span> DevVault Keyring & Local Storage
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Snippets and tasks are reactive signals synchronized with HTML5 WebStorage. Export your vault anytime to preserve offline state.
            </p>

            <div class="p-3 rounded-xl bg-[#090e18] border border-slate-800 font-mono text-xs space-y-2">
              <div class="flex justify-between text-slate-400">
                <span>Stored Snippets:</span>
                <span class="text-white">{{ snippetService.totalCount() }} items</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Active Tasks:</span>
                <span class="text-white">{{ taskService.tasks().length }} items</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Storage Footprint:</span>
                <span class="text-emerald-400 font-semibold">{{ snippetService.storageUsage().kb }} KB</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                (click)="snippetService.exportJson()"
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
              >
                Download Vault JSON
              </button>
              <button
                type="button"
                (click)="snippetService.resetToDefault()"
                class="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs transition"
              >
                Reset to Seed Directives
              </button>
            </div>
          </div>

          <!-- Architecture & Signals Specs -->
          <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-5 space-y-4">
            <h3 class="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>⚡</span> Reactive Engine Telemetry
            </h3>
            <div class="space-y-3 text-xs">
              <div class="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1">
                <div class="font-semibold text-slate-200">DAG Evaluation Model</div>
                <div class="text-[11px] text-slate-400 font-mono">Push-notification / lazy-pull computation (glitch-free).</div>
              </div>
              <div class="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1">
                <div class="font-semibold text-slate-200">Change Detection Strategy</div>
                <div class="text-[11px] text-slate-400 font-mono">OnPush with fine-grained signal subscriptions. Zero zone overhead.</div>
              </div>
              <div class="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1">
                <div class="font-semibold text-slate-200">Framework Engine</div>
                <div class="text-[11px] text-emerald-400 font-mono">Angular 22.2 Standalone (No NgModule bloat)</div>
              </div>
            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class TasksViewComponent {
  protected readonly taskService = inject(TaskService);
  protected readonly snippetService = inject(SnippetService);
  private readonly toast = inject(ToastService);

  readonly viewTab = signal<'board' | 'settings'>('board');
  readonly newTaskTitle = signal<string>('');
  readonly newTaskPriority = signal<'low' | 'medium' | 'high'>('medium');

  createTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;
    this.taskService.addTask(title, '', this.newTaskPriority());
    this.newTaskTitle.set('');
  }
}
