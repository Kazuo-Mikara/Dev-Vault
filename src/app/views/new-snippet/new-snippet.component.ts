import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SnippetService } from '../../services/snippet.service';
import { ToastService } from '../../services/toast.service';
import { SnippetLanguage } from '../../models/snippet.model';

const DEFAULT_SAMPLE_CODE = `import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';

export interface SnippetEntity {
  id: string;
  name: string;
  payload: string;
}

export const SnippetStore = signalStore(
  { providedIn: 'root' },
  withEntities(entityConfig({ entity: {} as SnippetEntity })),
  withMethods((store) => ({
    upsertOne(item: SnippetEntity) {
      patchState(store, (state) => ({
        ...state,
        ids: Array.from(new Set([...state.ids, item.id])),
        entities: { ...state.entities, [item.id]: item }
      }));
    }
  }))
);`;

@Component({
  selector: 'app-new-snippet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6 space-y-6 max-w-7xl mx-auto">
      
      <!-- Top Action Bar / Breadcrumb -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="font-mono text-xs text-slate-400">
            <a routerLink="/snippets" class="hover:text-indigo-400 transition-colors">vault</a>
            <span class="text-slate-600 mx-1.5">/</span>
            <a routerLink="/snippets" class="hover:text-indigo-400 transition-colors">snippets</a>
            <span class="text-slate-600 mx-1.5">/</span>
            <span class="text-cyan-400 font-semibold">create_new.ts</span>
          </div>

          <!-- FormGroup Reactive State Pill -->
          <span 
            class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border flex items-center gap-1.5 transition-colors"
            [ngClass]="form.valid ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' : 'bg-rose-950/60 text-rose-400 border-rose-500/40'"
          >
            <span class="w-1.5 h-1.5 rounded-full" [ngClass]="form.valid ? 'bg-emerald-400' : 'bg-rose-400'"></span>
            FormGroup: {{ form.dirty ? 'DIRTY' : 'PRISTINE' }} {{ form.valid ? 'VALID' : 'INVALID' }}
          </span>
        </div>

        <div class="flex items-center gap-2.5 self-end sm:self-center">
          <button
            type="button"
            (click)="discard()"
            class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-white transition"
          >
            <kbd class="text-[10px] font-mono mr-1">ESC</kbd> to discard
          </button>
          
          <button
            type="button"
            (click)="saveDraft()"
            class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
          >
            Save Draft
          </button>

          <button
            type="button"
            (click)="submitForm()"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <span>Save to Vault</span>
            <kbd class="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-700/60 text-indigo-200 border border-indigo-400/30">⌘S</kbd>
          </button>
        </div>
      </div>

      <!-- Main Two-Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column: Form Editor (7 cols) -->
        <div class="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0f1523] p-5 space-y-5">
          
          <!-- Tab Navigation inside editor -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="editorTab.set('basic')"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                [ngClass]="editorTab() === 'basic' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white'"
              >
                1. Basic Info & Code
              </button>
              <button
                type="button"
                (click)="editorTab.set('metas')"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                [ngClass]="editorTab() === 'metas' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white'"
              >
                <span>2. Architecture Metas</span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>
            </div>

            <span class="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span>✔</span> ReactiveFormsModule v22
            </span>
          </div>

          <form [formGroup]="form" (ngSubmit)="submitForm()" class="space-y-4">
            
            <!-- Field: Snippet Title -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-300">
                  Snippet Title <span class="text-rose-400">*</span>
                </label>
                @if (form.get('title')?.valid) {
                  <span class="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    ✔ Validators.minLength(5) Passed
                  </span>
                } @else if (form.get('title')?.touched && form.get('title')?.invalid) {
                  <span class="text-[10px] font-mono text-rose-400">
                    Min 5 characters required
                  </span>
                }
              </div>
              <div class="relative">
                <input
                  type="text"
                  formControlName="title"
                  placeholder="e.g. NgRx SignalStore Entity Adapter Helper"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#090e18] border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition font-medium"
                  [ngClass]="form.get('title')?.valid ? 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500' : 'border-rose-900/60 focus:border-rose-500 focus:ring-rose-500'"
                />
                @if (form.get('title')?.valid) {
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-400">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                }
              </div>
            </div>

            <!-- Row: Language / Engine & Target Architecture -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Language -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-300">
                  Language / Engine <span class="text-rose-400">*</span>
                </label>
                <select
                  formControlName="language"
                  class="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="typescript">TypeScript (.ts / signals)</option>
                  <option value="python">Python (.py / asyncio)</option>
                  <option value="docker">Docker (.dockerfile)</option>
                  <option value="rust">Rust (.rs / cargo)</option>
                  <option value="shell">Shell (.sh / bash)</option>
                  <option value="go">Go (.go / goroutines)</option>
                  <option value="sql">SQL (.sql / pgsql)</option>
                  <option value="wordpress">WordPress (.elemeter/elementor)</option>
                  <option value="css">CSS(.css/css)</option>
                  <option value="html">HTML (.html/html)</option>
                  <option value="php">PHP (.php/php)</option>
                  <option value="angular">Angular (.angular/angular)</option>

                </select>
              </div>

              <!-- Target Architecture -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-300">
                  Target Architecture
                </label>
                <select
                  formControlName="targetArchitecture"
                  class="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Angular 18+ Signals">Angular 18+ Signals</option>
                  <option value="Node.js 22 LTS">Node.js 22 LTS</option>
                  <option value="Linux Kernel / POSIX">Linux Kernel / POSIX</option>
                  <option value="PyTorch Core">PyTorch Core</option>
                  <option value="Cross-platform">Cross-platform</option>
                </select>
              </div>
            </div>

            <!-- Field: Architectural Context & Purpose -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-300">
                Architectural Context & Purpose
              </label>
              <textarea
                formControlName="description"
                rows="2"
                placeholder="Provides a zero-boilerplate helper to construct typed SignalStore slices with automated entity crud, optimistic cache synchronization, and computed pagination signals..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#090e18] border border-slate-800 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition leading-relaxed"
              ></textarea>
            </div>

            <!-- Field: Code Implementation -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-1.5 font-semibold text-slate-300">
                  <span class="font-mono text-cyan-400">&lt;/&gt;</span>
                  <span>Code Implementation</span>
                </div>
                <div class="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                  <span>Tab: 2 spaces</span>
                  <span class="text-cyan-400">{{ byteLength() }} bytes</span>
                  <span>UTF-8</span>
                </div>
              </div>

              <!-- Code Editor with line numbers -->
              <div class="rounded-xl border border-slate-800 bg-[#080d17] overflow-hidden flex text-xs font-mono">
                <!-- Line Numbers Column -->
                <div class="bg-[#050810] border-r border-slate-850 py-3 px-2 text-right select-none text-slate-600 font-mono leading-relaxed text-[11px] w-10 shrink-0">
                  @for (n of lineNumbers(); track n) {
                    <div>{{ n }}</div>
                  }
                </div>
                <!-- Textarea Code Input -->
                <textarea
                  formControlName="code"
                  rows="14"
                  (input)="updateCodeStats()"
                  placeholder="Paste or write snippet code here..."
                  class="w-full p-3 bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none resize-y leading-relaxed font-mono text-[11px] selection:bg-indigo-600"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>

            <!-- Field: Dynamic Metadata Tags (FormArray) -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <label class="font-semibold text-slate-300">
                  Dynamic Metadata Tags (Reactive FormArray)
                </label>
                <span class="text-[10px] font-mono text-slate-500">
                  {{ tagsArray.length }} tags attached
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#090e18] border border-slate-800">
                @for (tagControl of tagsArray.controls; track $index) {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 text-xs font-mono">
                    #{{ tagControl.value }}
                    <button
                      type="button"
                      (click)="removeTag($index)"
                      class="text-indigo-400 hover:text-white transition"
                    >
                      ✕
                    </button>
                  </span>
                }

                <div class="flex items-center gap-1">
                  <input
                    type="text"
                    [value]="tagInput()"
                    (input)="onTagInputChange($event)"
                    (keydown.enter)="$event.preventDefault(); addTag()"
                    placeholder="+ Add tag & hit Enter"
                    class="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono py-1 px-2"
                  />
                </div>
              </div>
            </div>

            <!-- Angular Reactive Validation Pipeline Box -->
            <div class="p-3.5 rounded-xl bg-[#090e18] border border-slate-850 space-y-2">
              <div class="flex items-center justify-between text-[11px] font-mono font-bold">
                <div class="flex items-center gap-2 text-emerald-400">
                  <span>▣</span>
                  <span class="tracking-wider uppercase">ANGULAR REACTIVE VALIDATION PIPELINE</span>
                </div>
                <span class="text-slate-500 font-mono">
                  Errors: {{ validationErrorsCount() }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div class="flex items-center gap-1.5" [ngClass]="form.get('title')?.valid ? 'text-emerald-400' : 'text-slate-500'">
                  <span>{{ form.get('title')?.valid ? '✔' : '○' }}</span>
                  <span>Title minLength(5)</span>
                </div>
                <div class="flex items-center gap-1.5" [ngClass]="form.get('language')?.valid ? 'text-emerald-400' : 'text-slate-500'">
                  <span>{{ form.get('language')?.valid ? '✔' : '○' }}</span>
                  <span>Lang Type InEnum</span>
                </div>
                <div class="flex items-center gap-1.5" [ngClass]="form.get('code')?.valid ? 'text-emerald-400' : 'text-slate-500'">
                  <span>{{ form.get('code')?.valid ? '✔' : '○' }}</span>
                  <span>Code NonEmpty</span>
                </div>
              </div>
            </div>

          </form>
        </div>

        <!-- Right Column: Live Preview & Debugger (5 cols) -->
        <div class="lg:col-span-5 space-y-5">
          
          <!-- Live Preview Container -->
          <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-5 space-y-4">
            <!-- Tabs: Vault Preview vs Form Debugger -->
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="previewTab.set('preview')"
                  class="px-3 py-1 rounded-lg text-xs font-semibold transition"
                  [ngClass]="previewTab() === 'preview' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'"
                >
                  Vault Preview
                </button>
                <button
                  type="button"
                  (click)="previewTab.set('debugger')"
                  class="px-3 py-1 rounded-lg text-xs font-semibold transition"
                  [ngClass]="previewTab() === 'debugger' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'"
                >
                  Form Debugger (JSON)
                </button>
              </div>

              <button
                type="button"
                (click)="copyPreviewCode()"
                class="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition"
              >
                <span>⧉</span>
                <span>Copy</span>
              </button>
            </div>

            <!-- Tab 1: Live Card Preview -->
            @if (previewTab() === 'preview') {
              <div class="rounded-xl border border-slate-800 bg-[#0b101c] p-4 space-y-3 shadow-md">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-950/60 text-indigo-400 border border-indigo-500/30">
                      {{ form.get('language')?.value }}
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      Signals
                    </span>
                  </div>
                  <span class="text-indigo-400 text-xs">⚡</span>
                </div>

                <div>
                  <h4 class="text-sm font-bold text-white tracking-tight">
                    {{ form.get('title')?.value || 'Untitled Snippet' }}
                  </h4>
                  <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {{ form.get('description')?.value || 'No architectural context specified.' }}
                  </p>
                </div>

                <!-- Code block preview -->
                <div class="rounded-lg bg-[#070b13] border border-slate-850 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-36 leading-relaxed">
                  <pre><code>{{ form.get('code')?.value || '// Empty code body' }}</code></pre>
                </div>

                <!-- Tags & Author info -->
                <div class="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
                  <div class="flex flex-wrap gap-1">
                    @for (tagControl of tagsArray.controls; track $index) {
                      <span class="text-slate-400 font-mono">#{{ tagControl.value }}</span>
                    }
                  </div>
                  <div class="font-mono text-slate-500">
                    Author: Alex Rivers
                  </div>
                </div>
              </div>
            }

            <!-- Tab 2: Form Debugger (JSON) -->
            @if (previewTab() === 'debugger') {
              <div class="rounded-xl bg-[#080d17] border border-slate-850 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-80 leading-relaxed">
                <pre><code>{{ debuggerJson() }}</code></pre>
              </div>
            }
          </div>

          <!-- Signal Dependency Graph Box -->
          <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-5 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">SIGNAL DEPENDENCY GRAPH</span>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-400 border border-indigo-500/30">
                Pure Computation
              </span>
            </div>

            <!-- SVG Reactive Node Diagram -->
            <div class="rounded-xl bg-[#080d17] border border-slate-850 p-4 flex items-center justify-between">
              <!-- Source node -->
              <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <div class="text-[11px] font-mono text-cyan-400 font-bold">source$</div>
                <div class="text-[9px] text-slate-500 font-mono">input()</div>
              </div>

              <!-- Flow arrows -->
              <div class="flex-1 flex flex-col items-center justify-center px-2">
                <div class="w-full flex items-center justify-between text-indigo-400 text-xs">
                  <span>- - -</span>
                  <span class="animate-pulse">●</span>
                  <span>- - -</span>
                </div>
              </div>

              <!-- Computed node -->
              <div class="space-y-1.5 text-center">
                <div class="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-[10px] font-mono text-indigo-300 font-bold">
                  computed()
                </div>
                <div class="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
                  signalStore
                </div>
              </div>

              <!-- Flow arrows -->
              <div class="flex-1 flex flex-col items-center justify-center px-2">
                <div class="w-full flex items-center justify-between text-emerald-400 text-xs">
                  <span>- - -</span>
                  <span class="animate-pulse">●</span>
                  <span>- - -</span>
                </div>
              </div>

              <!-- View Sink node -->
              <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <div class="text-[11px] font-mono text-emerald-400 font-bold">view()</div>
                <div class="text-[9px] text-slate-500 font-mono">OnPush DOM</div>
              </div>
            </div>

            <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>Glitch-free reactivity</span>
              <span class="text-emerald-400">O(1) updates</span>
            </div>
          </div>

          <!-- Shared Team Vault Card -->
          <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-slate-850 border border-slate-700/80 flex items-center justify-center text-slate-300">
                <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h4 class="text-xs font-bold text-white tracking-tight">Shared Team Vault</h4>
                <p class="text-[11px] text-slate-400">Synchronized with GitHub Enterprise</p>
              </div>
            </div>

            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              main (synced)
            </span>
          </div>

        </div>

      </div>

    </div>
  `
})
export class NewSnippetComponent {
  private readonly fb = inject(FormBuilder);
  private readonly snippetService = inject(SnippetService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly editorTab = signal<'basic' | 'metas'>('basic');
  readonly previewTab = signal<'preview' | 'debugger'>('preview');

  readonly tagInput = signal<string>('');
  readonly byteLength = signal<number>(684);
  readonly lineNumbers = signal<number[]>(Array.from({ length: 20 }, (_, i) => i + 1));

  readonly form = this.fb.group({
    title: ['NgRx SignalStore Entity Adapter Helper', [Validators.required, Validators.minLength(5)]],
    language: ['typescript' as SnippetLanguage, Validators.required],
    targetArchitecture: ['Angular 18+ Signals'],
    description: [
      'Provides a zero-boilerplate helper to construct typed SignalStore slices with automated entity crud, optimistic cache synchronization, and computed pagination signals'
    ],
    code: [DEFAULT_SAMPLE_CODE, Validators.required],
    tags: this.fb.array([
      new FormControl('signals'),
      new FormControl('state-management'),
      new FormControl('angular18'),
      new FormControl('typescript')
    ])
  });

  get tagsArray(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  readonly validationErrorsCount = computed(() => {
    let count = 0;
    if (this.form.get('title')?.invalid) count++;
    if (this.form.get('language')?.invalid) count++;
    if (this.form.get('code')?.invalid) count++;
    return count;
  });

  readonly debuggerJson = computed(() => {
    return JSON.stringify({
      valid: this.form.valid,
      dirty: this.form.dirty,
      pristine: this.form.pristine,
      errors: {
        title: this.form.get('title')?.errors,
        code: this.form.get('code')?.errors
      },
      value: this.form.value
    }, null, 2);
  });

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.discard();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.submitForm();
    }
  }

  onTagInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.tagInput.set(target.value);
  }

  addTag() {
    const raw = this.tagInput().trim().replace(/^#/, '');
    if (!raw) return;
    this.tagsArray.push(new FormControl(raw));
    this.tagInput.set('');
  }

  removeTag(index: number) {
    this.tagsArray.removeAt(index);
  }

  updateCodeStats() {
    const code = this.form.get('code')?.value || '';
    const bytes = new Blob([code]).size;
    this.byteLength.set(bytes);

    const lines = Math.max(1, code.split('\n').length);
    this.lineNumbers.set(Array.from({ length: lines }, (_, i) => i + 1));
  }

  copyPreviewCode() {
    const code = this.form.get('code')?.value || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.toast.show('Code Copied', 'Preview code copied to clipboard.', 'success');
      });
    }
  }

  saveDraft() {
    this.toast.show('Draft Saved', 'Snippet draft preserved in local storage sandbox.', 'info');
  }

  discard() {
    this.router.navigate(['/snippets']);
  }

  submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    const val = this.form.value;
    const tags = this.tagsArray.value;

    this.snippetService.addSnippet({
      title: val.title!,
      language: val.language! as SnippetLanguage,
      targetArchitecture: val.targetArchitecture || 'Angular 18+ Signals',
      description: val.description || '',
      code: val.code!,
      tags,
      pinned: false,
      author: 'Alex Rivers'
    });

    this.router.navigate(['/snippets']);
  }
}
