import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { ButtonComponent } from '../../components/shared/button.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
    template: `
        <div class="login-container">
            <div class="login-card">
                <h2>Go Kart Warehouse</h2>
                <p class="subtitle">Please sign in to continue.</p>

                <div class="form-group">
                    <input type="text" id="username" [(ngModel)]="username" name="username" 
                           class="form-control" placeholder="Username">
                </div>

                <div class="form-group">
                    <div class="password-wrapper">
                        <input [type]="showPassword ? 'text' : 'password'" id="password" [(ngModel)]="password" name="password" 
                               class="form-control" placeholder="Password" (keyup.enter)="login()">
                        <button type="button" class="toggle-password" (click)="togglePasswordVisibility()" [title]="showPassword ? 'Hide password' : 'Show password'">
                            @if (showPassword) {
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88L14.12 14.12"/><path d="M2 2l20 20"/><path d="M10.37 5.06a10.9 10.9 0 0 1 11.13 5.44"/><path d="M4.55 4.55A10.9 10.9 0 0 0 2 10.5a10.9 10.9 0 0 0 17 6"/><path d="M14.06 14.06a3 3 0 1 1-4.12-4.12"/><path d="M15 15l1.5 1.5"/><path d="M21 21l-1.5-1.5"/></svg>
                            } @else {
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            }
                        </button>
                    </div>
                </div>

                <app-button variant="primary" (btnClick)="login()" [disabled]="!username || !password">
                    LOGIN
                </app-button>

                <div class="forgot-link">
                    <a routerLink="/forgot-password">Forgot Password?</a>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at top left, #1e293b, #0f172a);
            padding: 24px;
        }

        .login-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            padding: 1.75rem 2.25rem;
            width: 100%;
            max-width: 380px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        h2 {
            color: var(--text-main);
            font-size: 1.5rem;
            font-weight: 800;
            text-align: center;
            margin-bottom: 0.35rem;
            font-family: 'Outfit', sans-serif;
            letter-spacing: -0.02em;
            background: linear-gradient(to right, #ffffff, var(--primary));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .subtitle {
            color: rgba(255, 255, 255, 0.5);
            text-align: center;
            margin-bottom: 1rem;
            font-size: 0.85rem;
            font-weight: 500;
        }

        .form-group {
            margin-bottom: 0.75rem;
        }

        .password-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .toggle-password {
            position: absolute;
            right: 1.25rem;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
        }

        .toggle-password:hover {
            color: var(--primary);
        }

        .form-control {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.4rem;
            padding: 0.5rem 0.75rem;
            color: var(--text-main);
            font-size: 0.85rem;
            transition: all 0.3s ease;
            box-sizing: border-box;
            height: 36px;
        }

        .form-control:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }

        .form-control::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }



        app-button {
            width: 100%;
            display: block;
            margin-top: 0.75rem;
        }

        app-button ::ng-deep button {
            width: 100%;
            padding: 0.5rem;
            font-size: 0.9rem;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .forgot-link {
            margin-top: 1.5rem;
            text-align: center;
        }

        .forgot-link a {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.9em;
            text-decoration: none;
            transition: color 0.2s;
        }

        .forgot-link a:hover {
            color: var(--primary);
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `]
})
export class LoginComponent {
    // Default username (now empty for text input)
    username = '';
    // User-entered password from the input field
    password = '';
    // Flag to toggle password visibility
    showPassword = false;

    constructor(
        private api: ApiService,
        private router: Router,
        private loading: LoadingService,
        private toast: ToastService
    ) { }

    /**
     * Submits the user credentials to the backend.
     * On success, stores the JWT token and redirects to the dashboard.
     */
    login() {
        this.loading.show();
        this.api.login(this.username, this.password).subscribe({
            next: (res: any) => {
                this.loading.hide();
                if (res.token) {
                    this.toast.success('Login successful! Welcome back.');
                    this.router.navigate(['/dashboard']);
                }
            },
            error: (err) => {
                this.loading.hide();
                console.error('Login failed:', err);
            }
        });
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }
}

