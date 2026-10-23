import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="sidebar" *ngIf="api.isLoggedIn()">
      <div class="sidebar-header">
        <div class="user-peek">
           <div class="avatar-container">
              <img *ngIf="avatarUrl" [src]="avatarUrl" class="avatar" alt="Avatar">
              <div *ngIf="!avatarUrl" class="avatar-fallback">{{ initials }}</div>
           </div>
           <div class="user-info">
              <span class="role-badge" [class]="role.toLowerCase()">{{role}}</span>
              <span class="username">{{api.username}}</span>
           </div>
        </div>
      </div>

      <div class="nav-sections">
        <!-- General Section -->
        <div class="nav-group">
          <label>General</label>
          <a *ngIf="role === 'ADMIN'" routerLink="/dashboard" routerLinkActive="active">
            Dashboard
          </a>
          <a *ngIf="role === 'ADMIN' || role === 'STAFF'" routerLink="/karts" routerLinkActive="active">
            Karts
          </a>
          <a *ngIf="role === 'MANAGER' || role === 'STAFF'" routerLink="/parts" routerLinkActive="active">
            Parts
          </a>
        </div>

        <!-- Operations Section -->
        <div class="nav-group">
          <label>Operations</label>
          <a *ngIf="role === 'ADMIN' || role === 'MANAGER' || role === 'STAFF'" routerLink="/tasks" routerLinkActive="active">
            Tasks
          </a>
          <a *ngIf="role === 'MANAGER' || role === 'STAFF'" routerLink="/maintenance" routerLinkActive="active">
            Maintenance
          </a>
          <a *ngIf="role === 'MANAGER'" routerLink="/schedules" routerLinkActive="active">
            Schedules
          </a>
          <a *ngIf="role === 'MANAGER' || role === 'STAFF'" routerLink="/calendar" routerLinkActive="active">
            Calendar
          </a>
          <a *ngIf="role === 'MANAGER' || role === 'STAFF'" routerLink="/incidents" routerLinkActive="active">
            Incidents
          </a>
        </div>

        <!-- Management Section -->
        <div class="nav-group">
          <label>Management</label>
          <a routerLink="/reports" routerLinkActive="active">
            Reports
          </a>
          <a *ngIf="role === 'ADMIN'" routerLink="/users" routerLinkActive="active">
            Users
          </a>
          <a *ngIf="role === 'ADMIN'" routerLink="/audit-log" routerLinkActive="active">
            Audit Logs
          </a>
        </div>

        <!-- Account Section -->
        <div class="nav-group mt-auto">
          <label>Account</label>
          <a routerLink="/settings" routerLinkActive="active">
            Settings
          </a>
          <a class="logout-link" (click)="logout()">
            Logout
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: #0f172a;
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      color: #94a3b8;
    }

    .sidebar-header {
      padding: 1.5rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 1rem;
    }

    .nav-sections {
      flex: 1;
      overflow-y: auto;
      padding: 0 1rem 1.5rem 1rem;
      display: flex;
      flex-direction: column;
    }

    .nav-group {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-group label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
      color: #475569;
      padding-left: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .nav-group a, .logout-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .nav-group a:hover, .logout-link:hover {
      background: rgba(255, 255, 255, 0.05);
      color: white;
    }

    .nav-group a.active {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
      font-weight: 600;
    }

    .icon {
      font-size: 1.1rem;
      width: 24px;
      text-align: center;
    }

    .mt-auto { margin-top: auto; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 1rem; }

    .user-peek {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .avatar-container {
      width: 82px;
      height: 82px;
      border-radius: 50%;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.05);
      border: 3px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }

    .avatar { width: 100%; height: 100%; object-fit: cover; }
    .avatar-fallback { font-size: 1.5rem; font-weight: 800; color: white; letter-spacing: 0.05em; }

    .user-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
    .username { color: white; font-weight: 700; font-size: 1.1rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }

    /* Role badges removed for clean aesthetic per user request */

    .logout-link { color: #f43f5e; }
    .logout-link:hover { background: rgba(244, 63, 94, 0.05); color: #fb7185; }
  `]
})
export class SidebarComponent implements OnDestroy {
  avatarUrl: string | null = null;
  username: string = '';
  private sub = new Subscription();

  constructor(public api: ApiService, private router: Router) {
    this.sub.add(this.api.avatar$.subscribe(url => this.avatarUrl = url));
    this.sub.add(this.api.profile$.subscribe(p => {
      this.username = p?.fullName || p?.username || this.api.username;
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get role() { return this.api.getRole(); }

  get initials() {
    return (this.username || 'U').substring(0, 2).toUpperCase();
  }

  logout() {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}
