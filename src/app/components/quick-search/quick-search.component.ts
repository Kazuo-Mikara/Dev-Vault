import { Component, input, output, signal, inject, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SnippetService } from '../../services/snippet.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-quick-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div 
        (click)="handleBackdropClick($event)"
        class="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      >
        <div class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl flex flex-col text-slate-200">
          
          <!-- Search Input Header -->
          <div class="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#0a0f1d] gap-3">
            <svg class="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              #searchInput
              type="text"
              [ngModel]="query()"
              (ngModelChange)="query.set($event)"
              placeholder="Search snippets, tokens, commands, or press ESC to exit..."
              class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
              ESC
            </span>
          </div>

          <!-- Results List -->
          <div class="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
            <!-- Navigation & Actions Section -->
            <div class="p-2">
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-2">
                Quick Navigation & Actions
              </div>
              <div class="grid grid-cols-2 gap-1.5">
                <button
                  (click)="navigateTo('/new')"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left text-slate-300 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-transparent transition"
                >
                  <span class="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">+</span>
                  <div>
                    <div class="font-medium">New Snippet</div>
                    <div class="text-[10px] text-slate-500">Open directive editor</div>
                  </div>
                </button>
                <button
                  (click)="navigateTo('/api-playground')"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left text-slate-300 hover:text-white hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-transparent transition"
                >
                  <span class="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">⚡</span>
                  <div>
                    <div class="font-medium">API Playground</div>
                    <div class="text-[10px] text-slate-500">Execute HTTP calls</div>
                  </div>
                </button>
                <button
                  (click)="navigateTo('/tasks')"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left text-slate-300 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/40 border border-transparent transition"
                >
                  <span class="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">⚙</span>
                  <div>
                    <div class="font-medium">Tasks & Settings</div>
                    <div class="text-[10px] text-slate-500">Track active backlog</div>
                  </div>
                </button>
                <button
                  (click)="theme.toggleTheme(); close.emit()"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left text-slate-300 hover:text-white hover:bg-amber-600/20 hover:border-amber-500/40 border border-transparent transition"
                >
                  <span class="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">◐</span>
                  <div>
                    <div class="font-medium">Toggle Theme</div>
                    <div class="text-[10px] text-slate-500">Dark / Light modes</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Snippets matches Section -->
            <div class="p-2">
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-2">
                Matching Snippets ({{ matchedSnippets().length }})
              </div>

              @if (matchedSnippets().length === 0) {
                <div class="text-xs text-slate-500 py-6 text-center">
                  No matching snippets found for "{{ query() }}"
                </div>
              }

              @for (item of matchedSnippets(); track item.id) {
                <div
                  (click)="selectSnippet(item)"
                  class="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer transition group"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <span 
                      class="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border shrink-0"
                      [ngClass]="{
                        'bg-blue-500/10 text-blue-400 border-blue-500/30': item.language === 'typescript',
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30': item.language === 'python',
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30': item.language === 'docker',
                        'bg-orange-500/10 text-orange-400 border-orange-500/30': item.language === 'rust',
                        'bg-purple-500/10 text-purple-400 border-purple-500/30': item.language === 'shell'
                      }"
                    >
                      {{ item.language }}
                    </span>
                    <div class="min-w-0">
                      <div class="text-xs font-semibold text-white group-hover:text-indigo-300 transition truncate">
                        {{ item.title }}
                      </div>
                      <div class="text-[11px] text-slate-400 truncate">
                        {{ item.description }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0 text-[10px] text-slate-500 font-mono">
                    @if (item.pinned) {
                      <span class="text-amber-400">📌 Pinned</span>
                    }
                    <span>{{ item.loc }} LOC</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-[#0a0f1d] text-[11px] text-slate-500">
            <div class="flex items-center gap-3">
              <span><kbd class="px-1 bg-slate-800 rounded border border-slate-700 text-slate-400 font-mono">↑↓</kbd> navigate</span>
              <span><kbd class="px-1 bg-slate-800 rounded border border-slate-700 text-slate-400 font-mono">↵</kbd> select</span>
              <span><kbd class="px-1 bg-slate-800 rounded border border-slate-700 text-slate-400 font-mono">esc</kbd> close</span>
            </div>
            <span class="font-mono text-emerald-400">Glitch-Free Search</span>
          </div>
        </div>
      </div>
    }
  `
})
export class QuickSearchComponent {
  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  private readonly snippetService = inject(SnippetService);
  private readonly router = inject(Router);
  protected readonly theme = inject(ThemeService);

  readonly query = signal<string>('');
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly matchedSnippets = signal<any[]>([]);

  constructor() {
    // Whenever query changes or dialog opens, filter
    this.snippetService.snippets(); // track
  }

  ngOnChanges() {
    if (this.isOpen()) {
      this.query.set('');
      this.filterList();
      setTimeout(() => {
        this.searchInput()?.nativeElement.focus();
      }, 50);
    }
  }

  filterList() {
    const q = this.query().toLowerCase().trim();
    if (!q) {
      this.matchedSnippets.set(this.snippetService.snippets().slice(0, 7));
      return;
    }
    const filtered = this.snippetService.snippets().filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    );
    this.matchedSnippets.set(filtered.slice(0, 10));
  }

  selectSnippet(item: any) {
    this.snippetService.setSearch(item.title);
    this.router.navigate(['/snippets']);
    this.close.emit();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.close.emit();
  }

  handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
