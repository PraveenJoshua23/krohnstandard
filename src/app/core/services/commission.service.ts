import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { COMMISSION_CONFIG } from '../../shared/config/commission.config';

export interface CommissionPayload {
  name: string;
  email: string;
  phone: string;
  collection: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class CommissionService {
  private readonly http = inject(HttpClient);

  /** Drives the modal's open/closed state across the app. */
  readonly isModalOpen = signal(false);

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  /**
   * POST the payload to the Google Apps Script web app.
   *
   * Sent as text/plain to avoid a CORS preflight — the Apps Script
   * receives the raw JSON body via e.postData.contents and parses it.
   */
  submit(payload: CommissionPayload): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    return this.http.post(COMMISSION_CONFIG.appsScriptUrl, JSON.stringify(payload), {
      headers,
      responseType: 'text',
    });
  }
}
