export type SnippetLanguage = 'typescript' | 'python' | 'docker' | 'rust' | 'shell' | 'go' | 'sql';

export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: SnippetLanguage;
  languageBadge?: string;
  targetArchitecture?: string;
  tags: string[];
  pinned: boolean;
  loc: number;
  bytes: number;
  commentsCount: number;
  stars: number;
  updatedAt: string;
  author: string;
}

export type SortOption = 'last_updated' | 'title_asc' | 'most_starred' | 'loc';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  tag: string;
  assignee: string;
  createdAt: string;
}

export interface ApiTestHistoryItem {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  status: number;
  statusText: string;
  durationMs: number;
  timestamp: string;
  responsePreview: string;
}
