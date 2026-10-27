import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiTestHistoryItem } from '../models/snippet.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiTesterService {
  private readonly http = inject(HttpClient);

  readonly history = signal<ApiTestHistoryItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly activeResponse = signal<{
    status: number;
    statusText: string;
    timeMs: number;
    headers: Record<string, string>;
    body: any;
    isError: boolean;
  } | null>(null);

  async executeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    headersJson: string,
    bodyJson: string
  ) {
    this.isLoading.set(true);
    const startTime = performance.now();

    let customHeaders = new HttpHeaders();
    try {
      if (headersJson.trim()) {
        const parsedHeaders = JSON.parse(headersJson);
        for (const [k, v] of Object.entries(parsedHeaders)) {
          customHeaders = customHeaders.set(k, String(v));
        }
      }
    } catch {
      // ignore header parse error
    }

    let parsedBody: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method) && bodyJson.trim()) {
      try {
        parsedBody = JSON.parse(bodyJson);
      } catch {
        parsedBody = bodyJson;
      }
    }

    try {
      let req$;
      const options = {
        headers: customHeaders,
        observe: 'response' as const
      };

      if (method === 'GET') {
        req$ = this.http.get(url, options);
      } else if (method === 'POST') {
        req$ = this.http.post(url, parsedBody, options);
      } else if (method === 'PUT') {
        req$ = this.http.put(url, parsedBody, options);
      } else if (method === 'DELETE') {
        req$ = this.http.delete(url, options);
      } else {
        req$ = this.http.patch(url, parsedBody, options);
      }

      const res = await firstValueFrom(req$);
      const elapsed = Math.round(performance.now() - startTime);

      const respHeaders: Record<string, string> = {};
      res.headers.keys().forEach(k => {
        respHeaders[k] = res.headers.get(k) || '';
      });

      const responseObj = {
        status: res.status,
        statusText: res.statusText || 'OK',
        timeMs: elapsed,
        headers: respHeaders,
        body: res.body,
        isError: false
      };

      this.activeResponse.set(responseObj);
      this.addHistory(method, url, res.status, res.statusText || 'OK', elapsed, JSON.stringify(res.body));
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      const status = err.status || 500;
      const statusText = err.statusText || 'Network/CORS Error';

      const responseObj = {
        status,
        statusText,
        timeMs: elapsed,
        headers: {},
        body: err.error || { error: err.message || 'Request failed' },
        isError: true
      };

      this.activeResponse.set(responseObj);
      this.addHistory(method, url, status, statusText, elapsed, JSON.stringify(responseObj.body));
    } finally {
      this.isLoading.set(false);
    }
  }

  private addHistory(method: any, url: string, status: number, statusText: string, durationMs: number, preview: string) {
    const item: ApiTestHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      method,
      url,
      status,
      statusText,
      durationMs,
      timestamp: new Date().toLocaleTimeString(),
      responsePreview: preview?.substring(0, 80) || ''
    };
    this.history.update(h => [item, ...h.slice(0, 14)]);
  }
}
