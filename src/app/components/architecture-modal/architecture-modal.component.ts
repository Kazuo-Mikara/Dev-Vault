import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-architecture-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl flex flex-col text-slate-200">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0a0f1d]">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-mono text-sm font-bold">
                ▲
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Modern Angular Reactive Architecture
                  <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                    Angular 22 Signals
                  </span>
                </h3>
                <p class="text-xs text-slate-400">Comparing fine-grained Signals, Dependency Injection, and OnPush change detection to React</p>
              </div>
            </div>
            <button
              (click)="close.emit()"
              class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-slate-800 bg-[#0c1222] px-6">
            <button
              (click)="activeTab.set('signals')"
              class="py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2"
              [ngClass]="activeTab() === 'signals' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Signals vs useState / useEffect
            </button>
            <button
              (click)="activeTab.set('di')"
              class="py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2"
              [ngClass]="activeTab() === 'di' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'"
            >
              <span class="w-2 h-2 rounded-full bg-blue-400"></span>
              Dependency Injection vs Context
            </button>
            <button
              (click)="activeTab.set('forms')"
              class="py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2"
              [ngClass]="activeTab() === 'forms' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-transparent text-slate-400 hover:text-slate-200'"
            >
              <span class="w-2 h-2 rounded-full bg-purple-400"></span>
              Reactive Forms & Validation
            </button>
          </div>

          <!-- Content Body -->
          <div class="p-6 overflow-y-auto space-y-6 text-sm">
            @if (activeTab() === 'signals') {
              <div class="space-y-4">
                <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h4 class="font-semibold text-white mb-1 flex items-center gap-2">
                    <span class="text-emerald-400 font-mono">signal()</span> & <span class="text-blue-400 font-mono">computed()</span>: Zero-Glitch Reactivity
                  </h4>
                  <p class="text-xs text-slate-400 leading-relaxed">
                    Unlike React where state updates re-execute the whole component function from top to bottom, Angular Signals track dependencies automatically via a push-pull directed acyclic graph (DAG). Only the exact DOM nodes reading the signal update!
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- React side -->
                  <div class="rounded-xl border border-slate-800 bg-[#080d1a] p-4">
                    <div class="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2 pb-2 border-b border-slate-800">
                      <span>React (useState + useMemo)</span>
                      <span class="text-slate-500">Re-renders component</span>
                    </div>
                    <pre class="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed"><code>const [query, setQuery] = useState('');
// Dependency array must be tracked manually
const filtered = useMemo(() => &#123;
  return items.filter(x => 
    x.title.includes(query)
  );
&#125;, [items, query]);</code></pre>
                  </div>

                  <!-- Angular side -->
                  <div class="rounded-xl border border-indigo-900/50 bg-[#090e1f] p-4 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
                    <div class="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2 pb-2 border-b border-slate-800">
                      <span>Angular 22 (Signals)</span>
                      <span class="text-emerald-500/80">Fine-grained DAG</span>
                    </div>
                    <pre class="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed"><code>query = signal('');
// No dependency array! Automatically tracked
filtered = computed(() => &#123;
  const q = this.query().toLowerCase();
  return this.items().filter(x => 
    x.title.toLowerCase().includes(q)
  );
&#125;);</code></pre>
                  </div>
                </div>

                <div class="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs leading-relaxed text-indigo-200">
                  <strong class="text-white">Glitch-Free Guarantee:</strong> When multiple signals update in the same microtask, downstream <code class="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded font-mono">computed()</code> signals only recalculate once, eliminating transient inconsistent state and infinite loops.
                </div>
              </div>
            }

            @if (activeTab() === 'di') {
              <div class="space-y-4">
                <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h4 class="font-semibold text-white mb-1">
                    Modern Dependency Injection with <code class="text-indigo-400 font-mono">inject()</code>
                  </h4>
                  <p class="text-xs text-slate-400 leading-relaxed">
                    Angular components don't need complex React Context Providers wrapped high in the tree. Services annotated with <code class="text-slate-300 font-mono">&#64;Injectable(&#123; providedIn: 'root' &#125;)</code> are true tree-shakable singletons injected anywhere using <code class="text-indigo-300 font-mono">inject(SnippetService)</code>.
                  </p>
                </div>

                <div class="rounded-xl border border-slate-800 bg-[#080d1a] p-4 font-mono text-xs text-slate-300">
                  <div class="text-emerald-400 mb-2 pb-2 border-b border-slate-800">
                    // Direct Service Injection in Standalone Components
                  </div>
                  <pre class="overflow-x-auto leading-relaxed"><code>&#64;Component(&#123;
  standalone: true,
  template: \`&lt;button (click)="vault.togglePin(id)"&gt;Pin&lt;/button&gt;\`
&#125;)
export class SnippetCardComponent &#123;
  // Injected cleanly without constructor boilerplate
  protected readonly vault = inject(SnippetService);
  protected readonly toast = inject(ToastService);
&#125;</code></pre>
                </div>
              </div>
            }

            @if (activeTab() === 'forms') {
              <div class="space-y-4">
                <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h4 class="font-semibold text-white mb-1">
                    Typed Reactive Forms & FormArray
                  </h4>
                  <p class="text-xs text-slate-400 leading-relaxed">
                    Angular's <code class="text-purple-400 font-mono">ReactiveFormsModule</code> decouples form model data from the DOM. Features built-in synchronous & asynchronous validators, <code class="text-slate-300 font-mono">FormArray</code> for dynamic arrays (such as tag pills), and reactive state observables/signals.
                  </p>
                </div>

                <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-2">
                  <div class="flex items-center gap-2 text-emerald-400 font-mono font-semibold">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    DevVault Implementation in create_new.ts:
                  </div>
                  <ul class="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong class="text-slate-200">FormGroup</strong> groups Title, Language, Context, and Code blocks.</li>
                    <li><strong class="text-slate-200">FormArray</strong> powers dynamic tag adding/removing with Enter key shortcuts.</li>
                    <li><strong class="text-slate-200">Validators</strong> verify minimum title length (5 chars), non-empty code, and valid language enum.</li>
                    <li><strong class="text-slate-200">Live JSON Debugger</strong> reflects real-time status: <span class="text-emerald-400 font-mono">VALID / INVALID</span>, <span class="text-blue-400 font-mono">DIRTY / PRISTINE</span>.</li>
                  </ul>
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0a0f1d]">
            <div class="text-xs text-slate-500 font-mono">
              DevVault v2.4 Architecture Spec
            </div>
            <button
              (click)="close.emit()"
              class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ArchitectureModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  readonly activeTab = signal<'signals' | 'di' | 'forms'>('signals');
}
