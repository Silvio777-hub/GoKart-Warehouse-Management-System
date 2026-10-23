import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="swam-card" [class.hover-effect]="hoverable">
      <div class="card-header" *ngIf="title">
        <h3>{{title}}</h3>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .swam-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 0.75rem;
      padding: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--card-shadow);
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .hover-effect:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      border-color: var(--primary);
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.5rem;
    }
    .card-icon { font-size: 1.25rem; color: var(--primary); }
    h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); font-weight: 700; font-family: 'Outfit', sans-serif; }
    .card-body { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; flex: 1; }
  `]
})
export class CardComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() hoverable: boolean = true;
}
