import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Snippet, SnippetLanguage, SortOption } from '../models/snippet.model';
import { ToastService } from './toast.service';

const INITIAL_SNIPPETS: Snippet[] = [
  {
    id: 'snip-pin-1',
    title: 'Angular 18 toSignal() HTTP Poller',
    description: 'Glitch-free micro-polling mechanism mapped to reactive state without RxJS memory leaks.',
    code: `const liveMetrics = toSignal(
  timer(0, 3000).pipe(
    switchMap(() => this.http.get<Metrics>('/api/vault/metrics')),
  ),
  { initialValue: null }
);`,
    language: 'typescript',
    languageBadge: 'TS explicit type',
    targetArchitecture: 'Angular 18+ Signals',
    tags: ['angular', 'signals', 'rxjs'],
    pinned: true,
    loc: 8,
    bytes: 204,
    commentsCount: 124,
    stars: 89,
    updatedAt: '12m ago',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-pin-2',
    title: 'Multi-stage Node/Go Prod Container',
    description: 'Alpine base with unprivileged user UID10001, stripped symbols, and minimal attack surface.',
    code: `FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-w -s" -o /vault
FROM scratch
COPY --from=builder /bin/vault /vault
ENTRYPOINT ["/vault"]`,
    language: 'docker',
    languageBadge: 'DOCKER 1-bit lint',
    targetArchitecture: 'Linux Kernel / POSIX',
    tags: ['docker', 'devops', 'prod'],
    pinned: true,
    loc: 7,
    bytes: 218,
    commentsCount: 98,
    stars: 142,
    updatedAt: '2h ago',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-pin-3',
    title: 'FastAPI Async Rate Limiter Middleware',
    description: 'Sliding window algorithm via Redis cluster with sliding TTL counters and fallback.',
    code: `async def rate_limit_middleware(req: Request, call_next):
    client_ip = req.client.host
    key = f"rate:{client_ip}:{int(time.time() // 60)}"
    count = await redis.incr(key)
    if count > 120:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    return await call_next(req)`,
    language: 'python',
    languageBadge: 'PY real asyncio',
    targetArchitecture: 'Node.js 22 LTS / Python',
    tags: ['python', 'fastapi', 'security'],
    pinned: true,
    loc: 8,
    bytes: 278,
    commentsCount: 213,
    stars: 178,
    updatedAt: '5h ago',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-reg-1',
    title: 'signalStore() with computed() selectors',
    description: 'Modern NgRx SignalStore pattern implementing deep immutability with computed derived slices.',
    code: `// Angular SignalStore Definition
export const SnippetStore = signalStore(
  { providedIn: 'root' },
  withState({ query: '', items: [] as Snippet[] }),
  withComputed(({ query, items }) => ({
    filteredList: computed(() => {
      const q = query().toLowerCase();
      return items().filter(x => x.title.toLowerCase().includes(q));
    })
  }))
);`,
    language: 'typescript',
    languageBadge: 'TS',
    targetArchitecture: 'Angular 18+ Signals',
    tags: ['angular18', 'signals', 'ngrx'],
    pinned: false,
    loc: 24,
    bytes: 382,
    commentsCount: 14,
    stars: 64,
    updatedAt: '42m ago',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-reg-2',
    title: 'Atomic Lock-Free RingBuffer',
    description: 'Crossbeam-based cache-padded single-producer single-consumer circular queue.',
    code: `use std::sync::atomic::{AtomicUsize, Ordering};

pub struct RingBuffer<T, const CAP: usize> {
    head: AtomicUsize,
    tail: AtomicUsize,
    slots: [Option<T>; CAP],
}

impl<T, const CAP: usize> RingBuffer<T, CAP> {
    pub fn push(&mut self, val: T) -> Result<(), T> {
        let h = self.head.load(Ordering::Acquire);
        /* Lockless head advance */
        self.head.store((h + 1) % CAP, Ordering::Release);
        Ok(())
    }
}`,
    language: 'rust',
    languageBadge: 'RS',
    targetArchitecture: 'Cross-platform',
    tags: ['rust', 'concurrency', 'zero-copy'],
    pinned: false,
    loc: 38,
    bytes: 495,
    commentsCount: 32,
    stars: 87,
    updatedAt: '3h ago',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-reg-3',
    title: 'Zero-Dependency Microservice Watchdog',
    description: 'Silent health check loop with exponential backoff and Webhook paging on failure.',
    code: `#!/usr/bin/env bash
set -euo pipefail

TARGET="http://127.0.0.1:8080/live"
while :; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET" || echo 000)
  if [ "$STATUS" -ne 200 ]; then
    echo "[ERR] Service down (HTTP $STATUS). Restarting..."
    systemctl restart vault-worker
  fi
  sleep 5
done`,
    language: 'shell',
    languageBadge: 'SH',
    targetArchitecture: 'Linux Kernel / POSIX',
    tags: ['bash', 'k8s', 'systemd'],
    pinned: false,
    loc: 16,
    bytes: 340,
    commentsCount: 8,
    stars: 41,
    updatedAt: '1d ago',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-reg-4',
    title: 'INT8 Dynamic Quantization Wrapper',
    description: 'Post-training dynamic 8-bit quantization for transformer embeddings on CPU fallback.',
    code: `import torch
from torch.ao.quantization import quantize_dynamic

def optimize_model_cpu(fp32_model: torch.nn.Module) -> torch.nn.Module:
    # Linear and Embedding layers quantized to qint8
    quantized_model = quantize_dynamic(
        fp32_model,
        {torch.nn.Linear, torch.nn.Embedding},
        dtype=torch.qint8
    )
    return quantized_model`,
    language: 'python',
    languageBadge: 'PY',
    targetArchitecture: 'PyTorch Core',
    tags: ['pytorch', 'quantization', 'ai'],
    pinned: false,
    loc: 21,
    bytes: 412,
    commentsCount: 45,
    stars: 93,
    updatedAt: '3d ago',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-reg-5',
    title: 'NgRx SignalStore Entity Adapter Helper',
    description: 'Provides a zero-boilerplate helper to construct typed SignalStore slices with automated entity crud, optimistic cache synchronization, and computed pagination signals.',
    code: `import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
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
);`,
    language: 'typescript',
    languageBadge: 'TS',
    targetArchitecture: 'Angular 18+ Signals',
    tags: ['signals', 'state-management', 'angular18', 'typescript'],
    pinned: false,
    loc: 26,
    bytes: 684,
    commentsCount: 29,
    stars: 112,
    updatedAt: 'Just now',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-reg-6',
    title: 'Custom Signal Linked Resource Fetcher',
    description: 'Deeply integrated Angular 19+ resource() primitive wrapper with optimistic caching and retry backoff.',
    code: `import { resource } from '@angular/core';

export function createVaultResource<T>(urlSignal: () => string) {
  return resource<T, string>({
    request: () => urlSignal(),
    loader: async ({ request: url, abortSignal }) => {
      const res = await fetch(url, { signal: abortSignal });
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return res.json() as Promise<T>;
    }
  });
}`,
    language: 'typescript',
    languageBadge: 'TS',
    targetArchitecture: 'Angular 18+ Signals',
    tags: ['angular', 'signals', 'resource', 'fetch'],
    pinned: false,
    loc: 14,
    bytes: 460,
    commentsCount: 19,
    stars: 58,
    updatedAt: '4d ago',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-reg-7',
    title: 'Rust Tokio Async Semaphore Pool',
    description: 'Controlled concurrency gate preventing socket descriptor exhaustion in high throughput proxies.',
    code: `use std::sync::Arc;
use tokio::sync::Semaphore;

pub struct ConcurrencyGate {
    sem: Arc<Semaphore>,
}

impl ConcurrencyGate {
    pub fn new(permits: usize) -> Self {
        Self { sem: Arc::new(Semaphore::new(permits)) }
    }
    pub async fn run<F, T>(&self, task: F) -> T 
    where F: std::future::Future<Output = T> {
        let _permit = self.sem.acquire().await.unwrap();
        task.await
    }
}`,
    language: 'rust',
    languageBadge: 'RS',
    targetArchitecture: 'Cross-platform',
    tags: ['rust', 'tokio', 'concurrency'],
    pinned: false,
    loc: 18,
    bytes: 480,
    commentsCount: 16,
    stars: 47,
    updatedAt: '5d ago',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-reg-8',
    title: 'Multi-Arch Docker Buildx bake.hcl',
    description: 'Deterministic reproducible matrix build configuration for amd64 and arm64 targets.',
    code: `group "default" {
  targets = ["api", "worker"]
}

target "base" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
}

target "api" {
  inherits = ["base"]
  target = "api-prod"
  tags = ["vault.internal/api:latest"]
}`,
    language: 'docker',
    languageBadge: 'DOCKER',
    targetArchitecture: 'Linux Kernel / POSIX',
    tags: ['docker', 'buildx', 'devops'],
    pinned: false,
    loc: 15,
    bytes: 290,
    commentsCount: 11,
    stars: 39,
    updatedAt: '6d ago',
    author: 'Alex Rivers'
  },
  {
    id: 'snip-reg-9',
    title: 'Systemd Unit Generator for Containerized Pods',
    description: 'Auto-generates hardened systemd service definitions with cgroup limits and auto-restart policies.',
    code: `#!/usr/bin/env bash
cat <<EOF > /etc/systemd/system/vault-app.service
[Unit]
Description=DevVault App Container
After=network.target docker.service
Requires=docker.service

[Service]
TimeoutStartSec=0
Restart=always
ExecStartPre=-/usr/bin/docker stop vault-app
ExecStart=/usr/bin/docker run --rm --name vault-app -p 8080:8080 dev-vault:latest
ExecStop=/usr/bin/docker stop vault-app

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload`,
    language: 'shell',
    languageBadge: 'SH',
    targetArchitecture: 'Linux Kernel / POSIX',
    tags: ['shell', 'systemd', 'devops'],
    pinned: false,
    loc: 20,
    bytes: 470,
    commentsCount: 15,
    stars: 36,
    updatedAt: '1w ago',
    author: 'Alex Rivers'
  }
];

@Injectable({
  providedIn: 'root'
})
export class SnippetService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly toast = inject(ToastService);

  // Core Reactive Signals
  readonly snippets = signal<Snippet[]>([]);
  readonly searchQuery = signal<string>('');
  readonly selectedLanguage = signal<string>('all');
  readonly sortOption = signal<SortOption>('last_updated');
  readonly isPulsing = signal<boolean>(false);
  readonly lastSyncTime = signal<string>('4s ago');

  constructor() {
    this.initSnippets();

    if (isPlatformBrowser(this.platformId)) {
      // Passive effect() sink: persists snippets whenever signal changes
      effect(() => {
        const current = this.snippets();
        try {
          localStorage.setItem('dev_vault_snippets_v2', JSON.stringify(current));
          this.lastSyncTime.set('Just now');
        } catch {
          // LocalStorage full or private browsing
        }
      });
    }
  }

  private initSnippets() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem('dev_vault_snippets_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.snippets.set(parsed);
            return;
          }
        }
      } catch {
        // Fall back to INITIAL_SNIPPETS
      }
    }
    this.snippets.set(INITIAL_SNIPPETS);
  }

  // Computed signals
  readonly totalCount = computed(() => this.snippets().length);

  readonly languageCounts = computed(() => {
    const counts: Record<string, number> = {
      all: this.snippets().length,
      typescript: 0,
      python: 0,
      docker: 0,
      rust: 0,
      shell: 0,
      go: 0,
      sql: 0
    };

    for (const s of this.snippets()) {
      if (counts[s.language] !== undefined) {
        counts[s.language]++;
      }
    }
    return counts;
  });

  readonly filteredSnippets = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const lang = this.selectedLanguage().toLowerCase();
    const sort = this.sortOption();

    let result = this.snippets().filter(s => {
      const matchesLang = lang === 'all' || s.language.toLowerCase() === lang;
      if (!matchesLang) return false;

      if (!query) return true;

      const titleMatch = s.title.toLowerCase().includes(query);
      const descMatch = s.description.toLowerCase().includes(query);
      const codeMatch = s.code.toLowerCase().includes(query);
      const tagMatch = s.tags.some(t => t.toLowerCase().includes(query.replace(/^#/, '')));

      return titleMatch || descMatch || codeMatch || tagMatch;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sort === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sort === 'most_starred') {
        return b.stars - a.stars;
      }
      if (sort === 'loc') {
        return b.loc - a.loc;
      }
      return 0; // default order / last updated
    });

    return result;
  });

  readonly pinnedSnippets = computed(() => {
    return this.filteredSnippets().filter(s => s.pinned);
  });

  readonly registrySnippets = computed(() => {
    return this.filteredSnippets().filter(s => !s.pinned);
  });

  readonly pinnedCount = computed(() => this.pinnedSnippets().length);

  readonly activeNodesCount = computed(() => {
    // Reactive graph nodes active
    return 6 + (this.searchQuery() ? 1 : 0) + (this.selectedLanguage() !== 'all' ? 1 : 0);
  });

  readonly storageUsage = computed(() => {
    const raw = JSON.stringify(this.snippets());
    const bytes = new Blob([raw]).size;
    const kb = (bytes / 1024).toFixed(1);
    const freePercent = Math.max(10, 100 - Math.min(90, Math.round((bytes / 50000) * 100)));
    return {
      bytes,
      kb,
      freePercent
    };
  });

  // Action methods
  setSearch(query: string) {
    this.searchQuery.set(query);
  }

  setLanguage(lang: string) {
    this.selectedLanguage.set(lang);
  }

  setSort(sort: SortOption) {
    this.sortOption.set(sort);
  }

  togglePin(id: string) {
    this.snippets.update(items =>
      items.map(s => {
        if (s.id === id) {
          const nextPinned = !s.pinned;
          this.toast.show(
            nextPinned ? 'Directive Pinned' : 'Directive Unpinned',
            `"${s.title}" has been ${nextPinned ? 'pinned to directives' : 'moved to registry'}.`,
            'info'
          );
          return { ...s, pinned: nextPinned };
        }
        return s;
      })
    );
  }

  addSnippet(snippetData: Omit<Snippet, 'id' | 'updatedAt' | 'stars' | 'commentsCount' | 'loc' | 'bytes'> & { loc?: number; bytes?: number }): Snippet {
    const lines = snippetData.code.split('\n').length;
    const bytes = new Blob([snippetData.code]).size;

    const newSnippet: Snippet = {
      ...snippetData,
      id: 'snip-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      loc: snippetData.loc ?? lines,
      bytes: snippetData.bytes ?? bytes,
      stars: 1,
      commentsCount: 0,
      updatedAt: 'Just now',
      languageBadge: snippetData.languageBadge || snippetData.language.toUpperCase().substring(0, 2)
    };

    this.snippets.update(items => [newSnippet, ...items]);
    this.toast.show('Snippet Saved', `"${newSnippet.title}" added to DevVault`, 'success');
    return newSnippet;
  }

  updateSnippet(id: string, updates: Partial<Snippet>): void {
    const lines = updates.code ? updates.code.split('\n').length : undefined;
    const bytes = updates.code ? new Blob([updates.code]).size : undefined;

    this.snippets.update(items =>
      items.map(s => {
        if (s.id === id) {
          const updated = {
            ...s,
            ...updates,
            loc: lines ?? s.loc,
            bytes: bytes ?? s.bytes,
            updatedAt: 'Just now'
          };
          this.toast.show('Snippet Updated', `Changes to "${updated.title}" persisted.`, 'success');
          return updated;
        }
        return s;
      })
    );
  }

  deleteSnippet(id: string) {
    const item = this.snippets().find(s => s.id === id);
    this.snippets.update(items => items.filter(s => s.id !== id));
    if (item) {
      this.toast.show('Snippet Deleted', `"${item.title}" was removed from the vault.`, 'warning');
    }
  }

  triggerPulse() {
    this.isPulsing.set(true);
    this.toast.show('Signal Graph Pulsed', 'Glitch-free O(1) propagation verified across all reactive nodes.', 'info');
    setTimeout(() => {
      this.isPulsing.set(false);
    }, 1300);
  }

  exportJson() {
    if (!isPlatformBrowser(this.platformId)) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.snippets(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dev-vault-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.toast.show('Vault Exported', `${this.snippets().length} directives saved to .json`, 'success');
  }

  importJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.snippets.set(parsed);
        this.toast.show('Vault Restored', `Successfully loaded ${parsed.length} directives.`, 'success');
        return true;
      }
    } catch {
      this.toast.show('Import Error', 'Invalid JSON vault schema provided.', 'error');
    }
    return false;
  }

  resetToDefault() {
    this.snippets.set(INITIAL_SNIPPETS);
    this.toast.show('Vault Reset', 'Default directives restored.', 'info');
  }

  getSnippetById(id: string): Snippet | undefined {
    return this.snippets().find(s => s.id === id);
  }
}
