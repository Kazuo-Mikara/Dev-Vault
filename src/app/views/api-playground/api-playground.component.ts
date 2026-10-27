import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiTesterService } from '../../services/api-tester.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-api-playground',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6 max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 text-lg">⚡</span>
            <h1 class="text-base font-bold text-white tracking-tight">API Playground & Micro-Tester</h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              HttpClient (inject)
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Test quick API endpoints, mock JSON payloads, and measure HTTP round-trip latency using Angular's fetch client.
          </p>
        </div>

        <!-- Presets Buttons -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 hidden sm:inline">Presets:</span>
          <button
            type="button"
            (click)="loadPreset('jsonplaceholder')"
            class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition"
          >
            Users API
          </button>
          <button
            type="button"
            (click)="loadPreset('todos')"
            class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition"
          >
            Todos API
          </button>
          <button
            type="button"
            (click)="loadPreset('post_mock')"
            class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition"
          >
            POST Create
          </button>
        </div>
      </div>

      <!-- Request Builder Bar -->
      <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-4 space-y-4">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <!-- Method Selector -->
          <select
            [ngModel]="method()"
            (ngModelChange)="method.set($event)"
            class="px-3 py-2.5 rounded-xl bg-[#090e18] border border-slate-800 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shrink-0"
            [ngClass]="{
              'text-emerald-400': method() === 'GET',
              'text-blue-400': method() === 'POST',
              'text-amber-400': method() === 'PUT',
              'text-rose-400': method() === 'DELETE'
            }"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <!-- URL Input -->
          <input
            type="text"
            [ngModel]="url()"
            (ngModelChange)="url.set($event)"
            placeholder="https://jsonplaceholder.typicode.com/todos/1"
            class="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090e18] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 font-mono"
          />

          <!-- Send Button -->
          <button
            type="button"
            (click)="sendRequest()"
            [disabled]="apiService.isLoading()"
            class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 shrink-0"
          >
            @if (apiService.isLoading()) {
              <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Sending...</span>
            } @else {
              <span>Send Request</span>
              <span class="font-mono text-[10px]">↵</span>
            }
          </button>
        </div>

        <!-- Request Config Tabs: Headers & Body -->
        <div class="space-y-2">
          <div class="flex items-center gap-3 border-b border-slate-800 pb-2">
            <button
              (click)="activeConfigTab.set('headers')"
              class="text-xs font-semibold pb-1 transition"
              [ngClass]="activeConfigTab() === 'headers' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'"
            >
              Headers (JSON)
            </button>
            <button
              (click)="activeConfigTab.set('body')"
              class="text-xs font-semibold pb-1 transition"
              [ngClass]="activeConfigTab() === 'body' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'"
            >
              Request Body (JSON)
            </button>
          </div>

          @if (activeConfigTab() === 'headers') {
            <textarea
              [ngModel]="headersJson()"
              (ngModelChange)="headersJson.set($event)"
              rows="3"
              placeholder='{ "Content-Type": "application/json" }'
              class="w-full p-2.5 rounded-xl bg-[#080d17] border border-slate-800 font-mono text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            ></textarea>
          }

          @if (activeConfigTab() === 'body') {
            <textarea
              [ngModel]="bodyJson()"
              (ngModelChange)="bodyJson.set($event)"
              rows="4"
              placeholder='{ "title": "DevVault directive", "author": "Alex Rivers" }'
              class="w-full p-2.5 rounded-xl bg-[#080d17] border border-slate-800 font-mono text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            ></textarea>
          }
        </div>
      </div>

      <!-- Response Panel -->
      @if (apiService.activeResponse(); as resp) {
        <div class="rounded-2xl border border-slate-800 bg-[#0f1523] p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-white uppercase tracking-wider">Response Payload</span>
              <span 
                class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border"
                [ngClass]="!resp.isError && resp.status >= 200 && resp.status < 300 ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' : 'bg-rose-950/60 text-rose-400 border-rose-500/40'"
              >
                {{ resp.status }} {{ resp.statusText }}
              </span>
            </div>

            <div class="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Latency: <strong class="text-white">{{ resp.timeMs }} ms</strong></span>
              <button
                (click)="copyResponse(resp.body)"
                class="px-2 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white transition text-xs"
              >
                ⧉ Copy JSON
              </button>
            </div>
          </div>

          <div class="rounded-xl bg-[#070b13] border border-slate-850 p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
            <pre><code>{{ formatBody(resp.body) }}</code></pre>
          </div>
        </div>
      }

      <!-- Recent History -->
      @if (apiService.history().length > 0) {
        <div class="space-y-3">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Request Log (In-Memory)
          </div>
          <div class="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0f1523] overflow-hidden">
            @for (h of apiService.history(); track h.id) {
              <div class="flex items-center justify-between p-3 text-xs font-mono">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="font-bold shrink-0" [ngClass]="h.method === 'GET' ? 'text-emerald-400' : 'text-blue-400'">
                    {{ h.method }}
                  </span>
                  <span class="text-slate-300 truncate">{{ h.url }}</span>
                </div>
                <div class="flex items-center gap-4 text-slate-500 shrink-0">
                  <span [ngClass]="h.status >= 200 && h.status < 300 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ h.status }}
                  </span>
                  <span>{{ h.durationMs }}ms</span>
                  <span class="text-slate-600">{{ h.timestamp }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class ApiPlaygroundComponent {
  protected readonly apiService = inject(ApiTesterService);
  private readonly toast = inject(ToastService);

  readonly method = signal<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  readonly url = signal<string>('https://jsonplaceholder.typicode.com/todos/1');
  readonly headersJson = signal<string>('{\n  "Accept": "application/json"\n}');
  readonly bodyJson = signal<string>('{\n  "title": "DevVault Directive",\n  "author": "Alex Rivers"\n}');
  readonly activeConfigTab = signal<'headers' | 'body'>('headers');

  loadPreset(type: string) {
    if (type === 'jsonplaceholder') {
      this.method.set('GET');
      this.url.set('https://jsonplaceholder.typicode.com/users/1');
      this.headersJson.set('{\n  "Accept": "application/json"\n}');
    } else if (type === 'todos') {
      this.method.set('GET');
      this.url.set('https://jsonplaceholder.typicode.com/todos?_limit=5');
      this.headersJson.set('{\n  "Accept": "application/json"\n}');
    } else if (type === 'post_mock') {
      this.method.set('POST');
      this.url.set('https://jsonplaceholder.typicode.com/posts');
      this.headersJson.set('{\n  "Content-Type": "application/json"\n}');
      this.bodyJson.set('{\n  "title": "Angular 22 Signals Microservice",\n  "body": "Glitch-free graph deployment verified.",\n  "userId": 1\n}');
      this.activeConfigTab.set('body');
    }
  }

  async sendRequest() {
    await this.apiService.executeRequest(
      this.method(),
      this.url(),
      this.headersJson(),
      this.bodyJson()
    );
  }

  formatBody(body: any): string {
    if (typeof body === 'object') {
      return JSON.stringify(body, null, 2);
    }
    return String(body);
  }

  copyResponse(body: any) {
    const text = typeof body === 'object' ? JSON.stringify(body, null, 2) : String(body);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.toast.show('Response Copied', 'Payload copied to clipboard.', 'success');
      });
    }
  }
}
