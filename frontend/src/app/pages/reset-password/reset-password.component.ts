import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { ButtonComponent } from '../../components/shared/button.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Set New Password</h2>
        <p class="subtitle">Enter your new secure password below.</p>
        
        @if (error) {
          <div class="error-alert">
            <p>{{ error }}</p>
          </div>
        }

        @if (!error) {
          <div class="form-group">
            <label>New Password</label>
            <input type="password" [(ngModel)]="password" class="form-control" placeholder="••••••••" (keyup.enter)="reset()">
          </div>

          <app-button (btnClick)="reset()" variant="primary">Update Password</app-button>
        }
        
        <div class="forgot-link">
            <a routerLink="/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top left, #1e293b, #0f172a); padding: 24px; }
    .login-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 2rem; padding: 2rem 2.5rem; width: 100%; max-width: 440px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    h2 { color: var(--text-main); font-size: 2.25rem; font-weight: 800; text-align: center; margin-bottom: 0.5rem; font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; background: linear-gradient(to right, #ffffff, var(--primary)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: rgba(255, 255, 255, 0.5); text-align: center; margin-bottom: 1.5rem; font-size: 1rem; font-weight: 500; }
    .error-alert { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(239, 68, 68, 0.2); line-height: 1.6; text-align: center; }
    .error-alert p { margin: 0; }
    .forgot-link { margin-top: 1.5rem; text-align: center; }
    .forgot-link a { color: rgba(255, 255, 255, 0.6); font-size: 0.9em; text-decoration: none; transition: color 0.2s; }
    .forgot-link a:hover { color: var(--primary); }
    app-button { width: 100%; display: block; margin-top: 1.5rem; }
    app-button ::ng-deep button { width: 100%; padding: 1.125rem; font-size: 1.1rem; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private loading: LoadingService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.error = 'Invalid or missing reset token.';
    }
  }

  reset() {
    if (!this.password || !this.token) return;
    this.loading.show();
    this.api.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.loading.hide();
        this.toast.success('Password updated successfully! Please login.');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading.hide();
        this.error = 'Failed to reset password. The link might be expired.';
      }
    });
  }
}
