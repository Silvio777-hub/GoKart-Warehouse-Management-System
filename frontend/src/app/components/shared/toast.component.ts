import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast) {
        <div class="toast" [ngClass]="toast.type">
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      padding: 15px 25px;
      border-radius: 4px;
      color: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
      min-width: 200px;
    }
    .success { background-color: #2ecc71; }
    .error { background-color: #e74c3c; }
    .info { background-color: #3498db; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts: ToastMessage[] = [];

  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.toastService.toasts$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t !== toast);
      }, 3000);
    });
  }
}
