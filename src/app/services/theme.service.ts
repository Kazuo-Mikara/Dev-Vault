import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isDark = signal<boolean>(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('dev_vault_theme');
      if (stored) {
        this.isDark.set(stored === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDark.set(prefersDark);
      }

      // Reactive effect synchronizing DOM and localStorage
      effect(() => {
        const dark = this.isDark();
        if (dark) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
          localStorage.setItem('dev_vault_theme', 'dark');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
          localStorage.setItem('dev_vault_theme', 'light');
        }
      });
    }
  }

  toggleTheme() {
    this.isDark.update(v => !v);
  }
}
