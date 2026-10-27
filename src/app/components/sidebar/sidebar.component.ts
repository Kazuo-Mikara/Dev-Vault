import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SnippetService } from '../../services/snippet.service';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 border-r border-slate-800 bg-[#090d16] flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-3.5rem)]">
      <!-- Top Section -->
      <div class="p-3 space-y-6">
        <div>
          <div class="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            WORKSPACE
          </div>
          <nav class="space-y-1">
            <!-- Snippets (Dashboard) -->
            <a
              routerLink="/snippets"
              routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-850 transition group"
            >
              <span class="font-mono text-sm font-semibold tracking-tighter">&lt;/&gt;</span>
              <span>Snippets</span>
            </a>

            <!-- New Snippet -->
            <a
              routerLink="/new"
              routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-850 transition group"
            >
              <span class="text-sm">⊞</span>
              <span>New Snippet</span>
            </a>

            <!-- API Playground -->
            <a
              routerLink="/api-playground"
              routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-850 transition group"
            >
              <span class="text-emerald-400 text-sm">⚡</span>
              <span>API Playground</span>
            </a>

            <!-- Tasks & Settings -->
            <a
              routerLink="/tasks"
              routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-850 transition group"
            >
              <span class="text-sm">⚏</span>
              <span>Tasks & Settings</span>
            </a>
          </nav>
        </div>
      </div>

      <!-- Bottom: Vault Status & Actions -->
      <div class="p-3 space-y-3 border-t border-slate-850 bg-[#070b13]">
        <!-- Vault Status Box -->
        <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span class="tracking-wider uppercase">VAULT STATUS</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
          </div>

          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between items-center text-slate-400">
              <span>Snippets</span>
              <span class="font-mono font-semibold text-white">{{ snippetService.totalCount() }}</span>
            </div>
            <div class="flex justify-between items-center text-slate-400">
              <span>Tasks Pending</span>
              <span class="font-mono font-semibold text-white">{{ taskService.pendingCount() }}</span>
            </div>
            <div class="pt-1">
              <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>LocalStorage</span>
                <span class="font-mono text-emerald-400 font-medium">{{ snippetService.storageUsage().freePercent }}% free</span>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  [style.width.%]="snippetService.storageUsage().freePercent"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action: Export Vault -->
        <button
          (click)="snippetService.exportJson()"
          class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition group"
        >
          <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export Vault (.json)</span>
        </button>

        <!-- Action: Open Angular Architecture Modal -->
        <button
          (click)="openArchitecture.emit()"
          class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-900/60 text-xs font-medium text-slate-400 hover:text-indigo-300 transition"
        >
          <span class="font-mono text-xs">◫</span>
          <span>Angular Architecture</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  readonly openArchitecture = output<void>();

  protected readonly snippetService = inject(SnippetService);
  protected readonly taskService = inject(TaskService);
}
