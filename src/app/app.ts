import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToastComponent } from './components/toast/toast.component';
import { QuickSearchComponent } from './components/quick-search/quick-search.component';
import { ArchitectureModalComponent } from './components/architecture-modal/architecture-modal.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    ToastComponent,
    QuickSearchComponent,
    ArchitectureModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly themeService = inject(ThemeService);

  readonly isQuickSearchOpen = signal<boolean>(false);
  readonly isArchitectureModalOpen = signal<boolean>(false);

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.isQuickSearchOpen.update(v => !v);
    }
  }

  openQuickSearch() {
    this.isQuickSearchOpen.set(true);
  }

  closeQuickSearch() {
    this.isQuickSearchOpen.set(false);
  }

  openArchitectureModal() {
    this.isArchitectureModalOpen.set(true);
  }

  closeArchitectureModal() {
    this.isArchitectureModalOpen.set(false);
  }
}
