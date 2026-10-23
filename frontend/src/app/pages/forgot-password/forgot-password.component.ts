import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { ButtonComponent } from '../../components/shared/button.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Reset Password</h2>
        @if (!emailSent) {
          <p class="subtitle">Enter your email to receive a reset link.</p>
        }
        
        @if (emailSent) {
          <div class="success-alert">
            <p>If this email exists in our system, you will receive a reset link shortly.</p>
            <div class="forgot-link">
              <a routerLink="/login">Back to Login</a>
            </div>
          </div>
        }

        @if (!emailSent) {
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" class="form-control" placeholder="admin@example.com">
          </div>

          <app-button (btnClick)="sendLink()" variant="primary">Send Reset Link</app-button>
          
          <div class="forgot-link">
              <a routerLink="/login">Back to Login</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top left, #1e293b, #0f172a); padding: 24px; }
    .login-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; padding: 1.75rem 2.25rem; width: 100%; max-width: 380px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    h2 { color: var(--text-main); font-size: 1.5rem; font-weight: 800; text-align: center; margin-bottom: 0.35rem; font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; background: linear-gradient(to right, #ffffff, var(--primary)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: rgba(255, 255, 255, 0.5); text-align: center; margin-bottom: 1rem; font-size: 0.85rem; font-weight: 500; }
    .success-alert { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(16, 185, 129, 0.2); line-height: 1.6; text-align: center; }
    .success-alert p { margin: 0; }
    .forgot-link { margin-top: 1rem; text-align: center; }
    .forgot-link a { color: rgba(255, 255, 255, 0.6); font-size: 0.85em; text-decoration: none; transition: color 0.2s; }
    .forgot-link a:hover { color: var(--primary); }
    app-button { width: 100%; display: block; margin-top: 1rem; }
    app-button ::ng-deep button { width: 100%; height: 36px; padding: 0.5rem; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  emailSent = false;

  constructor(
    private api: ApiService,
    private loading: LoadingService,
    private toast: ToastService
  ) { }

  sendLink() {
    if (!this.email) return;
    this.loading.show();
    this.api.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading.hide();
        this.emailSent = true;
      },
      error: () => this.loading.hide()
    });
  }
}
