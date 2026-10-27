import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { SnippetService } from '../../services/snippet.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="h-14 border-b border-slate-800 bg-[#090d16] px-4 flex items-center justify-between sticky top-0 z-40 select-none">
      <!-- Left: Logo & Version -->
      <div class="flex items-center gap-3">
        <a routerLink="/snippets" class="flex items-center gap-2.5 group">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span class="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
            DevVault
          </span>
        </a>

        <span class="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium text-cyan-400 border border-cyan-500/30 bg-cyan-950/40">
          v2.4 (Signals)
        </span>
      </div>

      <!-- Right: Search trigger, Status, Theme Switcher, Profile -->
      <div class="flex items-center gap-3">
        <!-- Quick Search Trigger (⌘K) -->
        <button
          (click)="openQuickSearch.emit()"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition shadow-inner"
        >
          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="hidden sm:inline">Quick Search...</span>
          <kbd class="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">⌘K</kbd>
        </button>

        <!-- Signals Engine Active Pill -->
        <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Signals: Active</span>
        </div>

        <!-- Dark / Light Mode Toggle -->
        <button
          (click)="theme.toggleTheme()"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition"
          [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          @if (theme.isDark()) {
            <span class="text-xs">☾</span>
            <span class="hidden sm:inline">Dark</span>
          } @else {
            <span class="text-xs text-amber-400">☀</span>
            <span class="hidden sm:inline">Light</span>
          }
        </button>

        <!-- Profile Avatar & Meta -->
        <div class="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div class="relative w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 ring-1 ring-slate-700 flex items-center justify-center text-white font-bold text-xs shadow">
            <span>AR</span>
            <span class="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-[#090d16]"></span>
          </div>
          <div class="hidden lg:block text-left">
            <div class="text-xs font-semibold text-slate-200 leading-tight">Alex Rivers</div>
            <div class="text-[10px] text-slate-500 font-mono leading-tight">Staff FE</div>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly openQuickSearch = output<void>();

  protected readonly theme = inject(ThemeService);
  protected readonly snippetService = inject(SnippetService);
}
