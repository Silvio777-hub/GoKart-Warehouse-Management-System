import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { CardComponent } from '../../components/shared/card.component';
import { ButtonComponent } from '../../components/shared/button.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>Settings</h2>
        <p class="text-dim info-text">Manage profile, security, and global preferences.</p>
      </div>
      
      <div class="settings-layout">
        <!-- Settings Nav -->
        <div class="settings-nav">
          <button (click)="activeTab = 'profile'" [class.active]="activeTab === 'profile'">
            Profile
          </button>
          <button (click)="activeTab = 'security'" [class.active]="activeTab === 'security'">
            Security
          </button>
          <button (click)="activeTab = 'preferences'" [class.active]="activeTab === 'preferences'">
            Preferences
          </button>
          <button *ngIf="api.getRole() === 'ADMIN'" (click)="activeTab = 'admin'" [class.active]="activeTab === 'admin'">
            Admin
          </button>
        </div>

        <!-- Settings Content -->
        <div class="settings-content">
          <div *ngIf="activeTab === 'profile'" class="tab-pane">
            <app-card title="Profile Management">
              <!-- Avatar Management -->
              <div class="avatar-section mb-4">
                  <div class="avatar-preview">
                      <img *ngIf="avatarUrl" [src]="avatarUrl" class="large-avatar" alt="Preview">
                      <div *ngIf="!avatarUrl" class="large-avatar-fallback">{{ initials }}</div>
                  </div>
                  <div class="avatar-controls">
                      <label class="avatar-label">Profile Picture</label>
                      <div class="btn-group">
                          <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none">
                          <app-button (btnClick)="fileInput.click()" variant="secondary">Upload New</app-button>
                          <app-button *ngIf="avatarUrl" (btnClick)="removeAvatar()" variant="danger">Remove</app-button>
                      </div>
                      <p class="hint">JPG or PNG, max 50MB. Updates system-wide.</p>
                  </div>
              </div>

              <div class="form-group mb-2">
                  <label>Full Name</label>
                  <input [(ngModel)]="user.fullName" class="form-control" placeholder="Your name">
              </div>
              <div class="form-group mb-2">
                  <label>Email Address</label>
                  <input type="email" [(ngModel)]="user.email" class="form-control" placeholder="yourname@example.com">
              </div>
              <div class="form-group mb-2">
                  <label>Bio / Notes</label>
                  <textarea [(ngModel)]="user.bio" class="form-control" rows="2" placeholder="Tell us about yourself..."></textarea>
              </div>
              <app-button (btnClick)="saveProfile()" variant="primary">Save Changes</app-button>
            </app-card>
          </div>

          <div *ngIf="activeTab === 'security'" class="tab-pane">
            <app-card title="Security & Access">
              <div class="form-group mb-4">
                <label>Current Password</label>
                <input type="password" [(ngModel)]="passwords.currentPassword" class="form-control" placeholder="••••••••">
              </div>
              <div class="form-group mb-1">
                <label>New Password</label>
                <input type="password" [(ngModel)]="passwords.newPassword" class="form-control" placeholder="••••••••">
              </div>
              <p class="hint mb-4">Choose a strong password with at least 8 characters.</p>
              <app-button (btnClick)="changePassword()" variant="secondary">Update Password</app-button>
            </app-card>
          </div>

          <div *ngIf="activeTab === 'preferences'" class="tab-pane">
            <app-card title="Preferences" class="no-hover">
                <div class="toggle-row">
                    <div class="toggle-info">
                        <span class="toggle-title">Dark Mode</span>
                        <p class="text-dim">Switch between light and dark visual themes.</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" [checked]="!isLightMode" (change)="toggleDarkMode()">
                        <span class="slider round"></span>
                    </label>
                </div>
            </app-card>
          </div>

          <div *ngIf="activeTab === 'admin' && api.getRole() === 'ADMIN'" class="tab-pane">
            <app-card title="Admin Controls" class="danger-zone">
              <div class="admin-control-row">
                  <div class="control-info">
                      <span class="control-title">Fleet Reset</span>
                      <p class="text-dim">Emergency action: set all karts to "AVAILABLE". Use with caution.</p>
                  </div>
                  <app-button variant="danger" (btnClick)="resetFleet()">Reset Status</app-button>
              </div>
            </app-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-layout { display: flex; gap: 2rem; margin-top: 1rem; align-items: flex-start; }
    
    .settings-nav { width: 220px; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
    .settings-nav button { background: none; border: none; padding: 0.75rem 1rem; text-align: left; color: #94a3b8; font-weight: 500; border-radius: 8px; transition: all 0.2s; cursor: pointer; display: flex; align-items: center; gap: 10px; }
    .settings-nav button:hover { background: rgba(255,255,255,0.05); color: white; }
    .settings-nav button.active { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
    
    .settings-content { flex: 1; min-width: 0; }
    .tab-pane { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

    .header { margin-bottom: 1rem; }
    .header h2 { margin: 0; font-size: 1.25rem; font-family: 'Outfit'; font-weight: 700; }
    .header p { margin-top: 0.25rem; }
    
    .info-text { font-size: 0.85rem; }
    .mb-4 { margin-bottom: 0.5rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    
    .hint { font-size: 0.85rem; color: var(--text-dim); }
    
    .toggle-row, .admin-control-row { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
    .toggle-info, .control-info { flex: 1; min-width: 180px; }
    .toggle-title, .control-title { display: block; font-weight: 700; color: var(--text-main); font-size: 1rem; margin-bottom: 0.15rem; }
    .toggle-info p, .control-info p { margin: 0; font-size: 0.85rem; }

    .danger-zone { border: 1px solid rgba(239, 68, 68, 0.2); }
    
    /* Ensure all inputs and textareas stay within the card bounds */
    textarea.form-control { resize: vertical; min-height: 60px; }

    /* Toggle Switch */
    .switch { position: relative; display: inline-block; width: 52px; height: 28px; flex-shrink: 0; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--input-border); transition: .4s; border-radius: 34px; }
    .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: var(--primary); }
    input:checked + .slider:before { transform: translateX(24px); }

    /* Avatar Settings specific */
    .avatar-section { display: flex; gap: 1.5rem; align-items: center; padding-bottom: 1.5rem; border-bottom: 1px solid var(--card-border); margin-bottom: 1.5rem; }
    .avatar-preview { flex-shrink: 0; }
    .large-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary); padding: 2px; }
    .large-avatar-fallback { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; color: white; }
    .avatar-controls { flex: 1; }
    .avatar-label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-main); }
    .avatar-controls .btn-group { display: flex; gap: 8px; margin-bottom: 0.5rem; }
    .avatar-controls .hint { margin: 0; }
  `]
})
export class SettingsComponent implements OnInit {
  user: any = {};
  passwords = { currentPassword: '', newPassword: '' };
  isLightMode = false;
  activeTab = 'profile';
  avatarUrl: string | null = null;

  constructor(
    public api: ApiService,
    private toast: ToastService,
    private loading: LoadingService
  ) { }

  ngOnInit() {
    this.api.getMe().subscribe(u => this.user = u);
    this.isLightMode = document.body.classList.contains('light-mode');
    this.loadAvatar();
  }

  get initials() {
    const name = this.user.fullName || this.api.username || 'U';
    return name.substring(0, 2).toUpperCase();
  }

  loadAvatar() {
    this.api.getAvatarUrl().subscribe({
      next: (url) => this.avatarUrl = url,
      error: () => {
        this.avatarUrl = null;
        // The ErrorInterceptor now suppresses the 404 toast for /avatar urls
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loading.show();
      this.api.uploadAvatar(file).subscribe({
        next: () => {
          this.api.refreshAvatar();
          this.loading.hide();
        },
        error: () => this.loading.hide()
      });
    }
  }

  removeAvatar() {
    if (confirm('Remove profile picture?')) {
      this.loading.show();
      this.api.deleteAvatar().subscribe({
        next: () => {
          this.toast.success('Profile picture removed');
          this.api.refreshAvatar();
          this.loading.hide();
        },
        error: () => this.loading.hide()
      });
    }
  }

  saveProfile() {
    this.loading.show();
    this.api.updateMe(this.user).subscribe({
      next: () => {
        this.loading.hide();
        this.toast.success('Profile updated successfully');
        this.api.refreshProfile();
      },
      error: () => this.loading.hide()
    });
  }

  resetFleet() {
    if (confirm('EMERGENCY: Are you sure you want to reset ALL karts to Available?')) {
      this.loading.show();
      this.api.resetFleet().subscribe({
        next: () => {
          this.loading.hide();
          this.toast.error('Fleet status has been reset');
        },
        error: () => this.loading.hide()
      });
    }
  }

  changePassword() {
    if (!this.passwords.currentPassword || !this.passwords.newPassword) return;
    this.loading.show();
    this.api.changePassword(this.passwords).subscribe({
      next: () => {
        this.loading.hide();
        this.toast.success('Password updated successfully');
        this.passwords = { currentPassword: '', newPassword: '' };
      },
      error: () => {
        this.loading.hide();
        this.toast.error('Invalid current password');
      }
    });
  }

  toggleDarkMode() {
    this.isLightMode = !this.isLightMode;
    document.body.classList.toggle('light-mode', this.isLightMode);
  }
}
