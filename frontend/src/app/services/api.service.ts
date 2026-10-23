import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subscription, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * ApiService - The bridge between Frontend and Backend.
 * This service handles all HTTP requests to our Spring Boot API.
 * It's safer to keep all API calls in one place rather than scattering them in components.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  /**
   * Base URL for the API. 
   * When running on my computer (localhost), it points to port 8081 using absolute URL.
   * In production, it would use relative path '/api'.
   * 
   * NOTE: I'm using port 8081 because that's where the backend container is mapped in docker-compose.
   */
  base = window.location.hostname === 'localhost' ? 'http://localhost:8081/api' : '/api';

  // --- Reactive State Management ---
  private profileSubject = new BehaviorSubject<any>(null);
  profile$ = this.profileSubject.asObservable();

  private avatarSubject = new BehaviorSubject<string | null>(null);
  avatar$ = this.avatarSubject.asObservable();

  // --- Caching Layer (Phase 2 Enhancement) ---
  private cache = new Map<string, { data: any, timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes in ms

  constructor(private http: HttpClient) {
    if (this.isLoggedIn()) {
      this.refreshProfile();
      this.loadAvatarInternal();
    }
  }

  /** Force a refresh of the entire profile state across the app */
  refreshProfile() {
    this.getMe().subscribe({
      next: (u) => this.profileSubject.next(u),
      error: () => this.profileSubject.next(null)
    });
  }

  /** Force a refresh of the avatar URL across the app */
  refreshAvatar() {
    this.invalidateCache('user-avatar');
    this.loadAvatarInternal();
  }

  private loadAvatarInternal() {
    this.getAvatarUrl().subscribe({
      next: (url) => this.avatarSubject.next(url),
      error: () => this.avatarSubject.next(null)
    });
  }

  // --- User Management ---

  /** Fetches all users from the database */
  listUsers(): Observable<any[]> {
    const key = 'users';
    const remote = this.http.get<any[]>(`${this.base}/users`).pipe(
      tap(data => this.updateCache(key, data))
    );
    return this.checkCache(key) || remote;
  }

  /** Fetches soft-deleted users from trash */
  listTrashUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/users/trash`);
  }

  getUsers(): Observable<any[]> {
    return this.listUsers();
  }

  /** Creates a new user (admin only) */
  createUser(payload: any): Observable<any> {
    return this.http.post(`${this.base}/users`, payload).pipe(
      tap(() => this.invalidateCache('users'))
    );
  }

  /** Restores a user from trash */
  restoreUser(id: number): Observable<any> {
    return this.http.put(`${this.base}/users/${id}/restore`, {}).pipe(
      tap(() => this.invalidateCache('users'))
    );
  }

  /** Fetches the current logged-in user profile */
  getMe(): Observable<any> {
    return this.http.get(`${this.base}/users/me`);
  }

  updateMe(user: any): Observable<any> {
    return this.http.put(`${this.base}/users/me`, user).pipe(
      tap(() => this.invalidateCache('users'))
    );
  }

  // --- Profile Picture (Avatar) ---

  /** Fetches the user's avatar as a blob and returns a temporary object URL */
  getAvatarUrl(): Observable<string> {
    const key = 'user-avatar';
    const cached = this.checkCache(key);
    if (cached) return cached;

    return this.http.get(`${this.base}/users/me/avatar?t=${new Date().getTime()}`, { responseType: 'blob' }).pipe(
      map(blob => URL.createObjectURL(blob)),
      tap(url => this.updateCache(key, url))
    );
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.base}/users/me/avatar`, formData).pipe(
      tap(() => {
        this.invalidateCache('user-avatar');
        this.invalidateCache('users');
      })
    );
  }

  deleteAvatar(): Observable<any> {
    return this.http.delete(`${this.base}/users/me/avatar`).pipe(
      tap(() => {
        this.invalidateCache('user-avatar');
        this.invalidateCache('users');
      })
    );
  }

  changePassword(payload: any): Observable<any> {
    return this.http.post(`${this.base}/users/change-password`, payload);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.base}/users/${id}`).pipe(
      tap(() => this.invalidateCache('users'))
    );
  }

  // --- Go-Kart Management ---

  /** Fetches the fleet of go-karts with pagination and search */
  listKarts(page: number = 0, size: number = 10, query: string = ''): Observable<any> {
    const key = `karts-${page}-${size}-${query}`;
    const remote = this.http.get<any>(`${this.base}/karts?page=${page}&size=${size}&query=${query}`).pipe(
      tap(data => this.updateCache(key, data))
    );
    return this.checkCache(key) || remote;
  }

  getKarts(): Observable<any[]> {
    const key = 'karts-all';
    const remote = this.http.get<any>(`${this.base}/karts?page=0&size=100`).pipe(
      map((data: any) => data.content || data),
      tap(data => this.updateCache(key, data))
    );
    return this.checkCache(key) || remote;
  }

  getKartSummary(): Observable<any> {
    const key = 'kart-summary';
    const remote = this.http.get<any>(`${this.base}/karts/summary`).pipe(
      tap(data => this.updateCache(key, data))
    );
    return this.checkCache(key) || remote;
  }

  /** Registers a new go-kart */
  createKart(payload: any): Observable<any> {
    return this.http.post(`${this.base}/karts`, payload).pipe(
      tap(() => this.invalidateCache('karts')),
      tap(() => this.invalidateCache('kart-summary'))
    );
  }

  /** Updates status (Available/Maintenance/Crashed) */
  updateKartStatus(id: number, status: string, statusNote: string): Observable<any> {
    return this.http.put(`${this.base}/karts/${id}`, { status, statusNote }).pipe(
      tap(() => this.invalidateCache('karts')),
      tap(() => this.invalidateCache('kart-summary'))
    );
  }

  // --- Spare Parts Inventory ---

  /** Fetches all spare parts */
  listParts(): Observable<any[]> {
    const key = 'parts';
    const remote = this.http.get<any[]>(`${this.base}/parts`).pipe(
      tap(data => this.updateCache(key, data))
    );
    return this.checkCache(key) || remote;
  }

  /** Adds a new part to the inventory */
  createPart(payload: any): Observable<any> {
    return this.http.post(`${this.base}/parts`, payload).pipe(
      tap(() => this.invalidateCache('parts'))
    );
  }

  /** Deletes a part */
  deletePart(id: number): Observable<any> {
    return this.http.delete(`${this.base}/parts/${id}`).pipe(
      tap(() => this.invalidateCache('parts'))
    );
  }

  /** Updates a part (e.g. for flagging restock) */
  updatePart(id: number, part: any): Observable<any> {
    return this.http.put(`${this.base}/parts/${id}`, part).pipe(
      tap(() => this.invalidateCache('parts'))
    );
  }

  // --- Maintenance Records ---

  /** Fetches maintenance logs */
  listMaintenance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/maintenance`);
  }

  /** Records a new maintenance activity */
  createMaintenance(payload: any): Observable<any> {
    return this.http.post(`${this.base}/maintenance`, payload).pipe(
      tap(() => this.invalidateCache('maintenance')),
      tap(() => this.invalidateCache('karts')),
      tap(() => this.invalidateCache('kart-summary'))
    );
  }

  /** Updates a maintenance log (e.g. for verification) */
  updateMaintenance(id: number, log: any): Observable<any> {
    return this.http.put(`${this.base}/maintenance/${id}`, log).pipe(
      tap(() => this.invalidateCache('maintenance'))
    );
  }

  // --- Authentication & Session ---

  /** 
   * Performs user login.
   * Sends username/password to backend and receives a JWT token in response.
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/auth/login`, { username, password }).pipe(
      tap((res: any) => {
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          this.refreshProfile();
          this.loadAvatarInternal();
        }
      })
    );
  }

  /** 
   * Extracts the user role from the stored JWT token.
   * This allows the frontend to show/hide buttons based on permission without making an API call.
   */
  getRole(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch (e) {
      return '';
    }
  }

  get username(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || '';
    } catch (e) { return ''; }
  }

  /** Checks if a token exists in local storage */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /** Removes the authentication token from local storage to log out */
  logout() {
    localStorage.removeItem('token');
    this.cache.clear(); // Wipe all cached data for isolation
    this.profileSubject.next(null);
    this.avatarSubject.next(null);
  }

  // --- Password Reset ---
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.base}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/auth/reset-password`, { token, password });
  }

  // --- Staff/Manager Actions ---

  reportCrash(id: number): Observable<any> {
    return this.http.post(`${this.base}/karts/${id}/crash`, {}).pipe(
      tap(() => this.invalidateCache('karts')),
      tap(() => this.invalidateCache('kart-summary'))
    );
  }

  pitStop(id: number): Observable<any> {
    return this.http.post(`${this.base}/karts/${id}/pitstop`, {});
  }

  resetHours(id: number): Observable<any> {
    return this.http.post(`${this.base}/karts/${id}/reset-hours`, {}).pipe(
      tap(() => this.invalidateCache('karts'))
    );
  }

  // --- Phase 3 TASKS ---
  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/tasks`);
  }

  createTask(task: any): Observable<any> {
    return this.http.post(`${this.base}/tasks`, task).pipe(
      tap(() => this.invalidateCache('tasks'))
    );
  }

  updateTaskStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.base}/tasks/${id}/status`, { status }).pipe(
      tap(() => this.invalidateCache('tasks'))
    );
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.base}/tasks/${id}`).pipe(
      tap(() => this.invalidateCache('tasks'))
    );
  }

  // --- PART REQUESTS ---
  getPartRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/part-requests`);
  }

  createPartRequest(req: any): Observable<any> {
    return this.http.post(`${this.base}/part-requests`, req).pipe(
      tap(() => this.invalidateCache('part-requests'))
    );
  }

  updatePartRequestStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.base}/part-requests/${id}/status`, { status }).pipe(
      tap(() => this.invalidateCache('part-requests'))
    );
  }

  // --- INCIDENTS ---
  getIncidents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/incidents`);
  }

  reportIncident(incident: any): Observable<any> {
    return this.http.post(`${this.base}/incidents`, incident).pipe(
      tap(() => this.invalidateCache('incidents'))
    );
  }

  reviewIncident(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/incidents/${id}/review`, data).pipe(
      tap(() => this.invalidateCache('incidents'))
    );
  }

  resolveIncident(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/incidents/${id}/resolve`, data).pipe(
      tap(() => this.invalidateCache('incidents'))
    );
  }

  // --- SCHEDULES ---
  getSchedules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/maintenance-schedules`);
  }

  createSchedule(sch: any): Observable<any> {
    return this.http.post(`${this.base}/maintenance-schedules`, sch).pipe(
      tap(() => this.invalidateCache('maintenance-schedules'))
    );
  }

  deleteSchedule(id: number): Observable<any> {
    return this.http.delete(`${this.base}/maintenance-schedules/${id}`).pipe(
      tap(() => this.invalidateCache('maintenance-schedules'))
    );
  }

  /**
   * Downloads a report file from the backend.
   */
  downloadReport(type: string, format: string): Observable<Blob> {
    return this.http.get(`${this.base}/reports/${type}.${format}`, { responseType: 'blob' });
  }

  // --- DOCUMENTS (FILE UPLOAD) ---
  listDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/documents`);
  }

  uploadDocument(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.base}/documents/upload`, formData);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/documents/${id}/download`, { responseType: 'blob' });
  }

  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.base}/documents/${id}`);
  }

  // --- ADMIN EXT ---
  backup(): Observable<any> {
    return this.http.post(`${this.base}/admin/backup`, {});
  }

  getAnalytics(): Observable<any> {
    return this.http.get(`${this.base}/admin/analytics`);
  }

  getAuditLog(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/admin/audit`);
  }

  // --- ANNOUNCEMENT MANAGEMENT ---
  getAnnouncement(): Observable<any> {
    return this.http.get(`${this.base}/admin/announcement`);
  }

  setAnnouncement(message: string): Observable<any> {
    return this.http.post(`${this.base}/admin/announcement`, { message });
  }

  // --- Helper for Caching ---
  private checkCache(key: string): Observable<any> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = (Date.now() - entry.timestamp) > this.CACHE_TTL;
    return isExpired ? null : of(entry.data);
  }

  private updateCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private invalidateCache(prefix?: string) {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // --- FLEET MANAGEMENT ---
  resetFleet(): Observable<any> {
    return this.http.post(`${this.base}/admin/reset-fleet`, {}).pipe(
      tap(() => this.invalidateCache('karts'))
    );
  }
}
