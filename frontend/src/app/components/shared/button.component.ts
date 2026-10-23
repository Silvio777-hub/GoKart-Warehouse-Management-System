import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [class]="'btn-' + variant" [disabled]="disabled" (click)="!disabled && btnClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1.5px solid transparent;
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
    }
    button:disabled { opacity: 0.4; cursor: not-allowed; filter: grayscale(0.8); }
    
    .btn-primary { 
      background: var(--primary); 
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .btn-primary:hover:not(:disabled) { 
      background: var(--primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
    
    .btn-secondary { 
      background: var(--card-bg); 
      color: var(--text-main); 
      border-color: var(--input-border); 
    }
    .btn-secondary:hover:not(:disabled) { 
      background: var(--input-bg);
      border-color: var(--primary);
    }
    
    .btn-danger { 
      background: rgba(239, 68, 68, 0.1); 
      color: #ef4444; 
      border-color: rgba(239, 68, 68, 0.2); 
    }
    .btn-danger:hover:not(:disabled) { 
      background: #ef4444; 
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
    .icon { font-size: 1rem; }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() icon: string = '';
  @Input() disabled: boolean = false;
  @Output() btnClick = new EventEmitter<MouseEvent>();
}
