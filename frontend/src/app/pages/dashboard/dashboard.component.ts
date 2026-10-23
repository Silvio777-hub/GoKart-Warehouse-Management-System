import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { CardComponent } from '../../components/shared/card.component';
import { ButtonComponent } from '../../components/shared/button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent],
  template: `
    <div class="page-container">
      <div class="dashboard-grid">
        <!-- Fleet Status Section -->
        <app-card title="Fleet Status" class="fleet-card">
          <div class="analytics-grid">
            <div class="stat-box">
              <span class="stat-value">{{summary?.total || 0}}</span>
              <span class="stat-label">Total Karts</span>
            </div>
            <div class="stat-box">
              <span class="stat-value" style="color: var(--success)">{{summary?.available || 0}}</span>
              <span class="stat-label">Available</span>
            </div>
            <div class="stat-box">
              <span class="stat-value" style="color: var(--warning)">{{summary?.underMaintenance || 0}}</span>
              <span class="stat-label">Maintenance</span>
            </div>
            <div class="stat-box">
              <span class="stat-value" style="color: var(--danger)">{{summary?.crashed || 0}}</span>
              <span class="stat-label">Crashed</span>
            </div>
            <div class="stat-box">
              <span class="stat-value" style="color: var(--text-dim)">{{summary?.retired || 0}}</span>
              <span class="stat-label">Retired</span>
            </div>
            <div class="stat-box">
              <span class="stat-value" style="color: var(--primary)">{{summary?.other || 0}}</span>
              <span class="stat-label">Other</span>
            </div>
          </div>
        </app-card>

        <!-- Inventory Alerts -->
        @if (lowStockParts.length > 0) {
          <app-card title="Inventory Alerts" class="warning-card pulse-card">
            <div class="alert-header">
              <span class="alert-icon">warning</span>
              <p class="mb-0"><strong>Critical attention required!</strong> The following parts have hit reorder thresholds.</p>
            </div>
            <div class="alert-list mt-3">
              @for (p of lowStockParts; track p.id) {
                <div class="alert-item">
                  <span class="dot blink"></span>
                  <div class="alert-info">
                    <strong>{{p.name}}</strong>
                    <span class="alert-qty">Only {{p.quantity}} left (Min: {{p.minStock}})</span>
                  </div>
                  <app-button variant="secondary" size="sm" routerLink="/parts">Manage</app-button>
                </div>
              }
            </div>
          </app-card>
        }

        <!-- Quick Actions -->
        <app-card title="Quick Actions" class="actions-card">
            <div class="action-buttons">
              <app-button (btnClick)="downloadReport('karts.pdf')" variant="primary" icon="description">Usage Report (PDF)</app-button>
              <app-button (btnClick)="downloadReport('maintenance.csv')" variant="secondary" icon="history">Maintenance History (CSV)</app-button>
            </div>
        </app-card>
 
        <!-- Recent Maintenance -->
        <app-card title="Recent Maintenance" class="maint-card">
          <div class="table-responsive">
            <table class="swam-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Kart</th>
                </tr>
              </thead>
              <tbody>
                @for (m of maintenance.slice(0,8); track m.id) {
                  <tr>
                    <td>{{m.performedAt | date:'mediumDate'}}</td>
                    <td>{{m.description}}</td>
                    <td><span class="badge">{{m.kartCode}}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; }
    .dashboard-grid { 
        display: grid; 
        grid-template-columns: repeat(12, 1fr); 
        gap: 0.75rem; 
    }
    
    .fleet-card { grid-column: span 12; }
    
    .analytics-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
        gap: 0.5rem; 
        margin-top: 0.5rem; 
        width: 100%;
    }
    
    .warning-card { 
        grid-column: span 12; 
        border-left: 5px solid var(--danger); 
        background: linear-gradient(to right, rgba(185, 28, 28, 0.05), transparent);
    }
    .actions-card { grid-column: span 12; }
    .maint-card { grid-column: span 12; }

    @media (min-width: 1024px) {
        .actions-card { grid-column: span 4; }
        .maint-card { grid-column: span 8; }
        .warning-card { grid-column: span 7; }
    }

    .alert-header { display: flex; align-items: center; gap: 12px; }
    .alert-icon { font-family: 'Material Icons'; color: var(--danger); font-size: 1.5rem; }
    
    .pulse-card { animation: pulse-border 2s infinite; }
    @keyframes pulse-border {
        0% { border-left-color: var(--danger); }
        50% { border-left-color: #ef4444; }
        100% { border-left-color: var(--danger); }
    }

    .alert-list { display: flex; flex-direction: column; gap: 12px; }
    .alert-item { 
        display: flex; align-items: center; gap: 15px; 
        color: var(--text-main); font-size: 0.95rem; 
        background: var(--card-bg); padding: 0.75rem 1rem; border-radius: 0.75rem;
        border: 1px solid var(--card-border);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .alert-info { flex: 1; display: flex; flex-direction: column; }
    .alert-qty { font-size: 0.8rem; color: var(--danger); font-weight: 600; }
    
    .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--danger); }
    .blink { animation: blinker 1.5s linear infinite; }
    @keyframes blinker {
        50% { opacity: 0.3; }
    }
    
    .mb-0 { margin-bottom: 0; }
    .mt-3 { margin-top: 0.75rem; }
    
    .action-buttons {
        display: flex; gap: 1rem; flex-direction: column;
    }
    .action-buttons ::ng-deep app-button { width: 100%; }

    .badge { 
        background: var(--input-bg); color: var(--primary); 
        padding: 4px 8px; border-radius: 6px; 
        font-weight: 700; font-size: 0.75rem; 
        border: 1px solid var(--input-border); 
    }

  `]
})
export class DashboardComponent implements OnInit {
  summary: any = null;
  karts: any[] = [];
  parts: any[] = [];
  maintenance: any[] = [];

  constructor(public api: ApiService, private ws: WebSocketService) { }

  ngOnInit() {
    this.loadData();

    // Real-time updates
    this.ws.watch('/topic/karts').subscribe(() => this.loadData());
    this.ws.watch('/topic/maintenance').subscribe(() => this.loadData());
    this.ws.watch('/topic/parts').subscribe(() => this.loadData());
    this.ws.watch('/topic/tasks').subscribe(() => this.loadData());
  }

  loadData() {
    this.api.getKartSummary().subscribe(s => this.summary = s);
    this.api.listKarts(0, 10).subscribe({
      next: (d: any) => this.karts = d.content || [],
      error: (e) => console.error('Error loading karts', e)
    });
    this.api.listParts().subscribe({
      next: (d: any) => this.parts = d || [],
      error: (e) => console.error('Error loading parts', e)
    });
    this.api.listMaintenance().subscribe({
      next: (d: any) => this.maintenance = d || [],
      error: (e) => console.error('Error loading maintenance', e)
    });
  }

  get lowStockParts() {
    return this.parts.filter(p => p.quantity <= p.minStock);
  }

  downloadReport(filename: string) {
    const parts = filename.split('.');
    const type = parts[0];
    const format = parts[1] || 'pdf';

    this.api.downloadReport(type, format).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Download failed', err)
    });
  }
}
