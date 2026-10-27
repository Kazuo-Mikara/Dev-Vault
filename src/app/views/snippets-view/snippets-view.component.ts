import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SnippetService } from '../../services/snippet.service';
import { ToastService } from '../../services/toast.service';
import { Snippet, SortOption } from '../../models/snippet.model';

@Component({
  selector: 'app-snippets-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-6 space-y-6 max-w-7xl mx-auto">
      
      <!-- Top Banner: Signals Reactive Engine Graph -->
      <div 
        class="relative overflow-hidden rounded-2xl border p-4 transition-all duration-300"
        [ngClass]="snippetService.isPulsing() ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-signal-pulse' : 'border-slate-800 bg-[#0f1523]/80'"
      >
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              ⚡
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">SIGNALS ENGINE ACTIVE:</span>
                <span class="text-xs text-slate-300 font-medium">Q(1) Glitch-Free Reactive Graph</span>
              </div>
              <div class="text-[11px] font-mono text-slate-400 mt-0.5">
                <span class="text-indigo-400 font-semibold">snippets()</span>
                <span class="text-slate-600 mx-1.5">→</span>
                <span class="text-emerald-400 font-semibold">computed(filteredSnippets)</span>
                <span class="text-slate-600 mx-1.5">→</span>
                <span class="text-purple-400 font-semibold">effect(syncStorage)</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 self-end sm:self-center">
            <div class="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span class="w-2 h-2 rounded-full bg-emerald-400" [ngClass]="snippetService.isPulsing() ? 'animate-ping' : ''"></span>
              <span>Quick propagation</span>
            </div>
            <button
              (click)="snippetService.triggerPulse()"
              class="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-xs font-mono text-slate-200 transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>Pulse Graph</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="space-y-3">
        <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          <!-- Search Bar -->
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              [ngModel]="snippetService.searchQuery()"
              (ngModelChange)="snippetService.setSearch($event)"
              placeholder="Search by token, tag, runtime (e.g. #signals, def, toSigna..."
              class="w-full pl-10 pr-28 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 transition shadow-inner font-mono"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-400 border border-indigo-500/30">
                ● {{ snippetService.filteredSnippets().length }} matches
              </span>
              <kbd class="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Ctrl+K
              </kbd>
            </div>
          </div>

          <!-- Sort & New Snippet Button -->
          <div class="flex items-center gap-2.5 shrink-0">
            <!-- Sort Selector -->
            <select
              [ngModel]="snippetService.sortOption()"
              (ngModelChange)="onSortChange($event)"
              class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="last_updated">Sort: Last Updated</option>
              <option value="title_asc">Sort: Title (A-Z)</option>
              <option value="most_starred">Sort: Most Starred</option>
              <option value="loc">Sort: Lines of Code</option>
            </select>

            <!-- New Snippet Button -->
            <a
              routerLink="/new"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs shadow-lg shadow-indigo-600/25 transition active:scale-95 shrink-0"
            >
              <span class="text-sm font-bold">+</span>
              <span>New Snippet</span>
              <kbd class="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-700/60 text-indigo-200 border border-indigo-400/30">Ctrl+N</kbd>
            </a>
          </div>
        </div>

        <!-- Language Filter Pills -->
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <button
            (click)="snippetService.setLanguage('all')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="snippetService.selectedLanguage() === 'all' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'"
          >
            All ({{ snippetService.languageCounts()['all'] }})
          </button>
          <button
            (click)="snippetService.setLanguage('typescript')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="snippetService.selectedLanguage() === 'typescript' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'"
          >
            TypeScript ({{ snippetService.languageCounts()['typescript'] }})
          </button>
          <button
            (click)="snippetService.setLanguage('python')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="snippetService.selectedLanguage() === 'python' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'"
          >
            Python ({{ snippetService.languageCounts()['python'] }})
          </button>
          <button
            (click)="snippetService.setLanguage('docker')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="snippetService.selectedLanguage() === 'docker' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'"
          >
            Docker ({{ snippetService.languageCounts()['docker'] }})
          </button>
          <button
            (click)="snippetService.setLanguage('rust')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="snippetService.selectedLanguage() === 'rust' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'"
          >
            Rust ({{ snippetService.languageCounts()['rust'] }})
          </button>
          <button
            (click)="snippetService.setLanguage('shell')"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            [ngClass]="snippetService.selectedLanguage() === 'shell' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'"
          >
            Shell ({{ snippetService.languageCounts()['shell'] }})
          </button>
        </div>
      </div>

      <!-- Section: Pinned Directives -->
      @if (snippetService.pinnedSnippets().length > 0) {
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-cyan-400">📌</span>
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300">Pinned Directives</h2>
              <span class="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {{ snippetService.pinnedCount() }} active
              </span>
            </div>
            <span class="text-[11px] font-mono text-slate-500">
              Synced to DevVault Cloud Keyring
            </span>
          </div>

          <!-- 3-Column Grid for Pinned Items -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (snippet of snippetService.pinnedSnippets(); track snippet.id) {
              <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-sm group">
                <div>
                  <!-- Header row: Language badge, pin, copy -->
                  <div class="flex items-center justify-between mb-2">
                    <span 
                      class="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight uppercase border"
                      [ngClass]="{
                        'bg-cyan-950/60 text-cyan-400 border-cyan-500/30': snippet.language === 'typescript',
                        'bg-blue-950/60 text-blue-400 border-blue-500/30': snippet.language === 'docker',
                        'bg-emerald-950/60 text-emerald-400 border-emerald-500/30': snippet.language === 'python'
                      }"
                    >
                      {{ snippet.languageBadge || snippet.language.toUpperCase() }}
                    </span>
                    <div class="flex items-center gap-1.5">
                      <button
                        (click)="snippetService.togglePin(snippet.id)"
                        class="p-1 rounded text-cyan-400 hover:text-white transition"
                        title="Unpin directive"
                      >
                        📌
                      </button>
                      <button
                        (click)="copyCode(snippet.code)"
                        class="p-1 rounded text-slate-400 hover:text-white transition"
                        title="Copy code"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Title & Description -->
                  <h3 class="text-xs font-bold text-white tracking-tight leading-snug group-hover:text-indigo-300 transition-colors">
                    {{ snippet.title }}
                  </h3>
                  <p class="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                    {{ snippet.description }}
                  </p>

                  <!-- Code Block -->
                  <div class="mt-3 rounded-xl bg-[#080d17] border border-slate-850 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed max-h-36">
                    <pre><code>{{ snippet.code }}</code></pre>
                  </div>
                </div>

                <!-- Footer: Tags & Stats -->
                <div class="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
                  <div class="flex flex-wrap gap-1">
                    @for (tag of snippet.tags; track tag) {
                      <span class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-400">
                        #{{ tag }}
                      </span>
                    }
                  </div>
                  <div class="flex items-center gap-1 font-mono text-slate-400">
                    <span>💬</span>
                    <span>{{ snippet.commentsCount || snippet.stars }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Metric KPI Cards Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Reactive Memory -->
        <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <span>REACTIVE MEMORY</span>
            <span class="text-emerald-400">▣</span>
          </div>
          <div class="my-2">
            <div class="text-xl font-bold font-mono text-white tracking-tight">1.42 <span class="text-xs text-slate-400 font-normal">MB Heap</span></div>
          </div>
          <div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-400 rounded-full" style="width: 19%"></div>
            </div>
            <div class="flex justify-end text-[10px] font-mono text-slate-500 mt-1">19%</div>
          </div>
        </div>

        <!-- 2. Computed Dependencies -->
        <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <span>COMPUTED DEPENDENCIES</span>
            <span class="text-cyan-400">☍</span>
          </div>
          <div class="my-2">
            <div class="text-xl font-bold font-mono text-white tracking-tight">{{ snippetService.activeNodesCount() }} <span class="text-xs text-slate-400 font-normal">Nodes Active</span></div>
          </div>
          <div class="text-[11px] text-slate-400">
            Zero untracked side-effects
          </div>
        </div>

        <!-- 3. Primary Language -->
        <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <span>PRIMARY LANGUAGE</span>
            <span class="text-indigo-400">&lt;/&gt;</span>
          </div>
          <div class="my-2">
            <div class="text-xl font-bold font-mono text-white tracking-tight">TS 5.4 <span class="text-xs text-slate-400 font-normal">42.8%</span></div>
          </div>
          <div class="text-[11px] text-slate-400">
            {{ snippetService.languageCounts()['typescript'] }} snippets indexed
          </div>
        </div>

        <!-- 4. Storage Sync -->
        <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <span>STORAGE SYNC</span>
            <span class="text-emerald-400">☁</span>
          </div>
          <div class="my-2">
            <div class="text-xl font-bold font-mono text-white tracking-tight">100% <span class="text-xs text-emerald-400 font-normal">Clean</span></div>
          </div>
          <div class="text-[11px] text-slate-400 font-mono">
            effect() synced {{ snippetService.lastSyncTime() }}
          </div>
        </div>
      </div>

      <!-- Section: Vault Registry -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-white tracking-tight">Vault Registry</h2>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Signal Filter Matrix
            </span>
          </div>
          <span class="text-[11px] font-mono text-slate-500">
            Showing verified directives
          </span>
        </div>

        <!-- 2-Column Responsive Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          @for (snippet of snippetService.registrySnippets(); track snippet.id) {
            <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-sm group">
              <div>
                <!-- Header row: Tag badge, Title, LOC, Pin, Copy -->
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <span 
                      class="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight uppercase border shrink-0"
                      [ngClass]="{
                        'bg-blue-500/10 text-blue-400 border-blue-500/30': snippet.language === 'typescript',
                        'bg-orange-500/10 text-orange-400 border-orange-500/30': snippet.language === 'rust',
                        'bg-purple-500/10 text-purple-400 border-purple-500/30': snippet.language === 'shell',
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30': snippet.language === 'python',
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30': snippet.language === 'docker'
                      }"
                    >
                      {{ snippet.languageBadge || snippet.language.toUpperCase().substring(0, 2) }}
                    </span>
                    <h3 class="text-xs font-bold text-white tracking-tight truncate group-hover:text-indigo-300 transition-colors">
                      {{ snippet.title }}
                    </h3>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0 text-slate-400">
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-850 text-slate-400 border border-slate-800">
                      {{ snippet.loc }} LOC
                    </span>
                    <button
                      (click)="snippetService.togglePin(snippet.id)"
                      class="p-1 rounded hover:text-white transition"
                      title="Pin snippet"
                    >
                      📌
                    </button>
                    <button
                      (click)="copyCode(snippet.code)"
                      class="p-1 rounded hover:text-white transition"
                      title="Copy code"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Description -->
                <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {{ snippet.description }}
                </p>

                <!-- Code block -->
                <div class="rounded-xl bg-[#080d17] border border-slate-850 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed max-h-48">
                  <pre><code>{{ snippet.code }}</code></pre>
                </div>
              </div>

              <!-- Footer: Tags & Time/Stars -->
              <div class="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
                <div class="flex flex-wrap gap-1">
                  @for (tag of snippet.tags; track tag) {
                    <span class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-400">
                      #{{ tag }}
                    </span>
                  }
                </div>
                <div class="flex items-center gap-3 font-mono text-slate-400">
                  <span>🕒 {{ snippet.updatedAt }}</span>
                  <div class="flex items-center gap-1">
                    <span>⭐</span>
                    <span>{{ snippet.stars }}</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Bottom Banner: Reactive Pipeline Architecture -->
      <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-white tracking-tight">Reactive Pipeline Architecture</h2>
          <span class="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            ChangeDetection: OnPush
          </span>
        </div>
        <p class="text-xs text-slate-400">Signals trigger zero extra render ticks by avoiding Angular zone dirty checks.</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <!-- 1. Source -->
          <div class="p-4 rounded-xl bg-[#0a0e1a] border border-slate-800/80 space-y-2">
            <div class="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
              <span>1. signal() source</span>
              <span>◎</span>
            </div>
            <div class="font-mono text-xs text-indigo-300">
              searchQuery = signal('')
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              Stores raw keyboard stream directly without triggering synchronous DOM reflows.
            </p>
          </div>

          <!-- 2. Derive -->
          <div class="p-4 rounded-xl bg-[#0a0e1a] border border-slate-800/80 space-y-2">
            <div class="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
              <span>2. computed() derive</span>
              <span>⇄</span>
            </div>
            <div class="font-mono text-xs text-emerald-300">
              filteredSnippets = computed(...)
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              Re-evaluates strictly when 'searchQuery' or 'languageFilter' changes.
            </p>
          </div>

          <!-- 3. Sink -->
          <div class="p-4 rounded-xl bg-[#0a0e1a] border border-slate-800/80 space-y-2">
            <div class="flex items-center justify-between text-xs font-mono font-bold text-purple-400">
              <span>3. effect() sink</span>
              <span>⚑</span>
            </div>
            <div class="font-mono text-xs text-purple-300">
              effect(() => persistLocal(...))
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              Passively serializes state changes directly to WebStorage sandbox.
            </p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class SnippetsViewComponent {
  protected readonly snippetService = inject(SnippetService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      this.router.navigate(['/new']);
    }
  }

  onSortChange(val: string) {
    this.snippetService.setSort(val as SortOption);
  }

  copyCode(code: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.toast.show('Snippet Copied', 'Code block copied to system clipboard.', 'success');
      });
    } else {
      this.toast.show('Snippet Copied', 'Code copied.', 'success');
    }
  }
}
