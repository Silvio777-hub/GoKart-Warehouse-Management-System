import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { CardComponent } from '../../components/shared/card.component';
import { ButtonComponent } from '../../components/shared/button.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="page-container">
      <div class="header">
        <div class="header-content">
          <h2>User Management</h2>
          <p class="text-dim">Configure access control and manage existing personnel.</p>
        </div>
        
        <div class="header-actions">
           <div class="btn-group">
            <app-button [variant]="viewMode==='ACTIVE'?'primary':'secondary'" (btnClick)="setView('ACTIVE')">Active Users</app-button>
            <app-button [variant]="viewMode==='TRASH'?'primary':'secondary'" (btnClick)="setView('TRASH')">Trash Bin</app-button>
           </div>

           @if (viewMode === 'ACTIVE') {
            <app-button [variant]="showForm ? 'secondary' : 'primary'" (btnClick)="showForm = !showForm">
                {{showForm ? 'Cancel' : 'Add New User'}}
            </app-button>
           }
        </div>
      </div>

      @if (showForm && viewMode === 'ACTIVE') {
        <app-card title="Create New Account" class="mb-4">
          <div class="inline-action-form">
              <div class="form-group">
                  <label>Username</label>
                  <input type="text" [(ngModel)]="newUser.username" placeholder="Username" class="form-control">
              </div>
              <div class="form-group">
                  <label>Password</label>
                  <input type="password" [(ngModel)]="newUser.password" placeholder="Password" class="form-control">
              </div>
              <div class="form-group" style="flex: 1.5;">
                  <label>Email Address</label>
                  <input type="email" [(ngModel)]="newUser.email" placeholder="email@example.com" class="form-control">
              </div>
              <div class="form-group">
                  <label>Access Role</label>
                  <select [(ngModel)]="newUser.role" class="form-control">
                      @if (currentUserRole === 'ADMIN') {
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                      }
                      <option value="STAFF">Staff</option>
                  </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                  <app-button (btnClick)="addUser()">Create Account</app-button>
              </div>
          </div>
        </app-card>
      }

      <app-card [hoverable]="false">
        <div class="table-responsive">
            <table class="swam-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Email</th>
                  <th>Username</th>
                  @if (currentUserRole === 'ADMIN') {
                    <th>Actions</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (u of filteredUsers; track u.id) {
                  <tr>
                    <td>
                      <div class="user-cell">
                        <div class="table-avatar">
                           <img *ngIf="u.hasAvatar" [src]="getAvatarUrl(u.id)" (error)="u.hasAvatar = false" alt="Avatar">
                           <div *ngIf="!u.hasAvatar" class="table-avatar-fallback">{{ u.getInitials() }}</div>
                        </div>
                        <span class="full-name">{{ u.fullName || 'No Name' }}</span>
                      </div>
                    </td>
                    <td>{{ u.email || '—' }}</td>
                    <td>{{ u.username }}</td>
                    @if (currentUserRole === 'ADMIN') {
                      <td>
                        <div class="actions">
                            <!-- Delete Button (Only for Active View) -->
                            @if (viewMode === 'ACTIVE' && canDelete(u)) {
                              <app-button variant="danger" (btnClick)="deleteUser(u.id)">
                                Delete
                              </app-button>
                            }
            
                            <!-- Restore Button (Only for Trash View) -->
                            @if (viewMode === 'TRASH') {
                              <app-button variant="primary" (btnClick)="restoreUser(u.id)">
                                Restore
                              </app-button>
                            }
                        </div>
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr>
                      <td colspan="5" style="text-align:center; opacity:0.6; padding: 2.5rem;">No users found.</td>
                  </tr>
                }
              </tbody>
            </table>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.75rem; }
    .header h2 { margin: 0; font-size: 1.5rem; font-family: 'Outfit'; font-weight: 700; }
    .header-content p { margin-top: 0.5rem; margin-bottom: 0; }
    .header-actions { display: flex; gap: 1rem; align-items: center; }
    .actions-cell { display: flex; gap: 8px; }
    .font-bold { font-weight: 700; color: var(--text-main); }
    .mb-4 { margin-bottom: 0.75rem; }
    .text-dim { color: var(--text-dim); }
    .mb-4 { margin-bottom: 0.75rem; }
    .text-dim { color: var(--text-dim); }

    .role-badge.staff { background: rgba(16, 185, 129, 0.1); color: #10b981; }

    .user-cell { display: flex; align-items: center; gap: 15px; padding: 5px 0; }
    .table-avatar { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1); flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
    .table-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .table-avatar-fallback { font-size: 1rem; font-weight: 800; color: white; }
    .full-name { font-weight: 700; font-size: 0.95rem; color: var(--text-main); }

    .actions { display: flex; gap: 8px; }
  `]
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = []; // Added filteredUsers
  showForm = false;
  viewMode: 'ACTIVE' | 'TRASH' = 'ACTIVE';
  newUser = { username: '', password: '', email: '', role: 'STAFF' };

  constructor(
    private api: ApiService,
    private ws: WebSocketService,
    private toast: ToastService,
    private loading: LoadingService
  ) { }

  get currentUserRole() { return this.api.getRole(); }

  ngOnInit() {
    this.loadUsers();
    this.ws.watch('/topic/users').subscribe(() => this.loadUsers());
  }

  setView(mode: 'ACTIVE' | 'TRASH') {
    this.viewMode = mode;
    this.loadUsers();
  }

  loadUsers() {
    this.loading.show();
    const obs = this.viewMode === 'ACTIVE' ? this.api.listUsers() : this.api.listTrashUsers();
    obs.subscribe({
      next: (data: any) => {
        this.users = data.map((u: any) => ({
          ...u,
          hasAvatar: true, // Optimistically assume they might have one, error handler will fix if not
          getInitials: () => (u.fullName || u.username || 'U').substring(0, 2).toUpperCase()
        }));
        this.filteredUsers = this.users; // Assign to filteredUsers
        this.loading.hide();
      },
      error: () => this.loading.hide()
    });
  }

  addUser() {
    if (!this.newUser.username || !this.newUser.password) return;
    this.loading.show();
    const payload = { ...this.newUser, fullName: this.newUser.username };
    this.api.createUser(payload).subscribe({
      next: () => {
        this.toast.success('User created successfully');
        this.loadUsers();
        this.showForm = false;
        this.newUser = { username: '', password: '', email: '', role: 'STAFF' };
      },
      error: () => this.loading.hide()
    });
  }

  getAvatarUrl(id: number) {
    return `${this.api.base}/users/${id}/avatar?t=${new Date().getTime()}`;
  }

  // Permission Logic
  canDelete(targetUser: any): boolean {
    const role = this.currentUserRole;
    if (role === 'MANAGER') {
      // Managers can only delete Staff
      return targetUser.role === 'STAFF';
    }
    if (role === 'ADMIN') {
      // Admins can delete anyone EXCEPT other Admins
      return targetUser.role !== 'ADMIN';
    }
    return false;
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to move this user to trash?')) {
      this.loading.show();
      this.api.deleteUser(id).subscribe({
        next: () => {
          this.toast.error('User moved to trash');
          this.loadUsers();
        },
        error: () => this.loading.hide()
      });
    }
  }

  restoreUser(id: number) {
    if (confirm('Restore this user?')) {
      this.loading.show();
      this.api.restoreUser(id).subscribe({
        next: () => {
          this.toast.success('User restored successfully');
          this.loadUsers();
        },
        error: () => this.loading.hide()
      });
    }
  }
}

