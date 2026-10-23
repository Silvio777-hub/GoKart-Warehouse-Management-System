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
    selector: 'app-incidents',
    standalone: true,
    imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
    template: `
    <div class="page-container">
        <div class="header">
            <h2>Incident Tracking</h2>
            <p class="text-dim">Monitor and resolve vehicle malfunctions and operational disruptions.</p>
        </div>

        @if (role !== 'USER') {
            <app-card title="Report New Incident" class="mb-4">
                <div class="inline-action-form">
                    <div class="form-group">
                        <label>Affected Kart</label>
                        <select [(ngModel)]="newIncident.kartId" class="form-control">
                            <option value="" disabled selected>Select Kart...</option>
                            @for (k of karts; track k.id) {
                                <option [value]="k.id">{{k.code}}</option>
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Severity</label>
                        <select [(ngModel)]="newIncident.severity" class="form-control">
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Problem Description</label>
                        <input [(ngModel)]="newIncident.description" placeholder="Describe what happened..." class="form-control">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <app-button (btnClick)="submitIncident()" size="lg">Report Incident</app-button>
                    </div>
                </div>
            </app-card>
        }

        <app-card [hoverable]="false" class="mt-4">
            <div class="table-responsive">
                <table class="swam-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Kart</th>
                            <th>Severity</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Action Plan</th>
                            <th>Resolution</th>
                            @if (role !== 'STAFF') {
                                <th>Actions</th>
                            }
                        </tr>
                    </thead>
                    <tbody>
                        @for (inc of incidents; track inc.id) {
                            <tr>
                                <td class="text-dim">{{inc.createdAt | date:'short'}}</td>
                                <td class="font-bold">{{inc.kart?.code}}</td>
                                <td>
                                    <span class="badge" [class.badge-high]="inc.severity === 'HIGH'" 
                                                       [class.badge-medium]="inc.severity === 'MEDIUM' || !inc.severity" 
                                                       [class.badge-low]="inc.severity === 'LOW'">
                                        {{inc.severity || 'MEDIUM'}}
                                    </span>
                                </td>
                                <td>{{inc.description}}</td>
                                <td>
                                    <span class="badge" [class.crashed]="inc.status === 'OPEN'" [class.available]="inc.status === 'CLOSED'">
                                        {{inc.status}}
                                    </span>
                                </td>
                                <!-- Action Plan Column -->
                                <td>
                                    @if (inc.status !== 'CLOSED' && role === 'MANAGER') {
                                        <div class="actions-cell">
                                            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                                                <select [(ngModel)]="inc.severity" class="form-control" style="font-size: 0.8rem;">
                                                    <option value="LOW">Low Impact</option>
                                                    <option value="MEDIUM">Medium Impact</option>
                                                    <option value="HIGH">Critical Impact</option>
                                                </select>
                                                <div class="actions-cell">
                                                    <input [(ngModel)]="inc.tempAction" placeholder="Action Plan..." class="form-control" style="flex: 1;">
                                                    <app-button (btnClick)="closeIncident(inc)" variant="primary">Close</app-button>
                                                </div>
                                            </div>
                                        </div>
                                    } @else {
                                        <span class="text-muted">
                                            {{inc.correctiveAction || 'Pending Review'}}
                                        </span>
                                    }
                                </td>
                                <!-- Resolution Column -->
                                <td>
                                    @if (inc.status === 'CLOSED' && role === 'MANAGER') {
                                        <div class="actions-cell">
                                            <input [(ngModel)]="inc.tempResolve" placeholder="Official Resolution..." class="form-control" style="flex: 1;">
                                            <app-button (btnClick)="resolveIncident(inc)" variant="secondary">Resolve</app-button>
                                        </div>
                                    } @else {
                                        <span class="text-muted">
                                            {{inc.resolution || (inc.status === 'CLOSED' ? 'Awaiting Manager Resolution' : 'In Progress')}}
                                        </span>
                                    }
                                </td>
                                @if (role === 'MANAGER') {
                                    <td>
                                        <button (click)="loadIncidents()" class="link-btn">Refresh</button>
                                    </td>
                                }
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </app-card>
    </div>
  `,
    styles: [`
    .header { margin-bottom: 0.75rem; }
    .header h2 { margin: 0; font-size: 1.5rem; font-family: 'Outfit'; font-weight: 700; }
    .header p { margin-top: 0.5rem; margin-bottom: 0; }
    .font-bold { font-weight: 700; color: var(--text-main); }
    .text-dim { color: var(--text-dim); }
    .text-muted { color: var(--text-muted); font-style: italic; font-size: 0.9rem; }
    .mb-4 { margin-bottom: 0.75rem; }
    .actions-cell { display: flex; gap: 8px; align-items: center; }
    
    .badge-high { background: rgba(255, 71, 87, 0.2); color: #ff4757; border: 1px solid rgba(255, 71, 87, 0.3); }
    .badge-medium { background: rgba(255, 165, 2, 0.2); color: #ffa502; border: 1px solid rgba(255, 165, 2, 0.3); }
    .badge-low { background: rgba(30, 144, 255, 0.2); color: #1e90ff; border: 1px solid rgba(30, 144, 255, 0.3); }
  `]
})
export class IncidentsComponent implements OnInit {
    incidents: any[] = [];
    karts: any[] = [];
    role = '';
    newIncident = { description: '', kartId: '', severity: 'MEDIUM' };

    constructor(
        private api: ApiService,
        private ws: WebSocketService,
        private toast: ToastService,
        private loading: LoadingService
    ) { }

    ngOnInit() {
        this.role = this.api.getRole();
        this.loadIncidents();
        this.api.getKarts().subscribe(data => this.karts = data);

        // Real-time updates
        this.ws.watch('/topic/incidents').subscribe(() => this.loadIncidents());
    }

    loadIncidents() {
        this.loading.show();
        this.api.getIncidents().subscribe({
            next: (data) => {
                this.incidents = data;
                this.loading.hide();
            },
            error: () => this.loading.hide()
        });
    }

    submitIncident() {
        if (!this.newIncident.kartId || !this.newIncident.description) return;
        const payload = {
            description: this.newIncident.description,
            kart: { id: this.newIncident.kartId },
            severity: this.newIncident.severity || 'MEDIUM'
        };
        this.loading.show();
        this.api.reportIncident(payload).subscribe({
            next: () => {
                this.toast.success('Incident reported successfully');
                this.newIncident = { description: '', kartId: '', severity: 'MEDIUM' };
                this.loadIncidents();
            },
            error: () => this.loading.hide()
        });
    }

    closeIncident(inc: any) {
        if (!inc.tempAction) return;

        // OPTIMISTIC
        const oldStatus = inc.status;
        const oldAction = inc.correctiveAction;

        inc.status = 'CLOSED';
        inc.correctiveAction = inc.tempAction;

        const data = {
            status: 'CLOSED',
            correctiveAction: inc.tempAction,
            severity: inc.severity
        };

        this.api.reviewIncident(inc.id, data).subscribe({
            next: () => {
                this.toast.info('Incident closed');
            },
            error: () => {
                // Rollback
                inc.status = oldStatus;
                inc.correctiveAction = oldAction;
                this.loadIncidents();
            }
        });
    }

    resolveIncident(inc: any) {
        if (!inc.tempResolve) return;

        // OPTIMISTIC
        const oldRes = inc.resolution;
        inc.resolution = inc.tempResolve;

        const data = { resolution: inc.tempResolve };
        this.api.resolveIncident(inc.id, data).subscribe({
            next: () => {
                this.toast.success('Resolution recorded');
            },
            error: () => {
                inc.resolution = oldRes; // Rollback
                this.loadIncidents();
            }
        });
    }
}
