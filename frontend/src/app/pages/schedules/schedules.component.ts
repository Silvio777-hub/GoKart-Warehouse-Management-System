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
    selector: 'app-schedules',
    standalone: true,
    imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
    template: `
    <div class="page-container">
        <div class="header">
            <h2>Schedules</h2>
            <p class="text-dim info-text">Manage recurring maintenance protocols.</p>
        </div>

        @if (role !== 'STAFF') {
            <app-card title="Plan Recurring Maintenance" class="mb-4">
                <div class="inline-action-form">
                    <div class="form-group">
                        <label>Affected Kart</label>
                        <select [(ngModel)]="newSchedule.kartId" class="form-control">
                            <option value="" disabled selected>Select Kart...</option>
                            @for (k of karts; track k.id) {
                                <option [value]="k.id">{{k.code}}</option>
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Maintenance Type</label>
                        <select [(ngModel)]="newSchedule.description" class="form-control">
                            <option value="" disabled selected>Select Type</option>
                            @for (type of maintenanceTypes; track type) {
                                <option [value]="type">{{ type }}</option>
                            }
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    @if (newSchedule.description === 'Other') {
                        <div class="form-group">
                            <label>Specify Other</label>
                            <input [(ngModel)]="otherDescription" placeholder="Maintenance type..." class="form-control">
                        </div>
                    }
                    <div class="form-group">
                        <label>Interval (Days)</label>
                        <input type="number" [(ngModel)]="newSchedule.intervalDays" placeholder="30" class="form-control">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <app-button (btnClick)="submitSchedule()" size="lg">Set Schedule</app-button>
                    </div>
                </div>
            </app-card>
        }

        <app-card [hoverable]="false">
            <div class="table-responsive">
                <table class="swam-table">
                    <thead>
                        <tr>
                            <th>Kart</th>
                            <th>Description</th>
                            <th>Interval</th>
                            <th>Next Due</th>
                            <th>Status</th>
                            @if (role !== 'STAFF') {
                                <th>Actions</th>
                            }
                        </tr>
                    </thead>
                    <tbody>
                        @for (s of schedules; track s.id) {
                            <tr>
                                <td class="font-bold">{{s.kart?.code}}</td>
                                <td>{{s.description}}</td>
                                <td class="text-dim">Every {{s.intervalDays}} days</td>
                                <td>{{s.nextDue | date:'mediumDate'}}</td>
                                <td>
                                    <span class="badge" [class.crashed]="isOverdue(s)" [class.available]="!isOverdue(s)">
                                        {{isOverdue(s) ? 'OVERDUE' : 'OK'}}
                                    </span>
                                </td>
                                @if (role !== 'STAFF') {
                                    <td>
                                        <div class="actions-cell">
                                            <app-button (btnClick)="deleteSchedule(s.id)" variant="danger">Remove</app-button>
                                        </div>
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
    .urgent { background: #e74c3c !important; color: white; }
    .header { margin-bottom: 0.5rem; }
    .header h2 { margin: 0; font-size: 1.25rem; font-family: 'Outfit'; font-weight: 700; }
    .header p { margin-top: 0.25rem; margin-bottom: 0; }
    .info-text { font-size: 0.85rem; }
    .font-bold { font-weight: 700; color: var(--text-main); }
    .text-dim { color: var(--text-dim); }
    .mb-4 { margin-bottom: 0.5rem; }
    .actions-cell { display: flex; gap: 8px; }
  `]
})
export class SchedulesComponent implements OnInit {
    schedules: any[] = [];
    karts: any[] = [];
    role = '';
    newSchedule = { description: '', kartId: '', intervalDays: 30 };
    otherDescription = '';

    maintenanceTypes = [
        'Oil Change',
        'Tire Rotation',
        'Brake Inspection',
        'Engine Tuning',
        'Frame Alignment',
        'General Cleanup',
        'Electrical Check'
    ];

    constructor(
        private api: ApiService,
        private ws: WebSocketService,
        private toast: ToastService,
        private loading: LoadingService
    ) { }

    ngOnInit() {
        this.role = this.api.getRole();
        this.loadSchedules();
        this.api.getKarts().subscribe(data => this.karts = data);

        // Real-time updates
        this.ws.watch('/topic/maintenance-schedules').subscribe(() => this.loadSchedules());
    }

    loadSchedules() {
        this.loading.show();
        this.api.getSchedules().subscribe({
            next: (data) => {
                this.schedules = data;
                this.loading.hide();
            },
            error: () => this.loading.hide()
        });
    }

    submitSchedule() {
        const finalDescription = this.newSchedule.description === 'Other' ? this.otherDescription : this.newSchedule.description;
        if (!this.newSchedule.kartId || !finalDescription) return;

        const payload = {
            description: finalDescription,
            intervalDays: this.newSchedule.intervalDays,
            kart: { id: this.newSchedule.kartId }
        };
        this.loading.show();
        this.api.createSchedule(payload).subscribe({
            next: () => {
                this.toast.success('Maintenance schedule created');
                this.newSchedule = { description: '', kartId: '', intervalDays: 30 };
                this.otherDescription = '';
                this.loadSchedules();
            },
            error: () => this.loading.hide()
        });
    }

    deleteSchedule(id: number) {
        if (confirm('Remove this schedule?')) {
            // OPTIMISTIC
            const previous = [...this.schedules];
            this.schedules = this.schedules.filter(s => s.id !== id);

            this.api.deleteSchedule(id).subscribe({
                next: () => {
                    this.toast.error('Schedule removed');
                },
                error: () => {
                    this.toast.error('Failed to remove schedule');
                    this.schedules = previous; // Rollback
                }
            });
        }
    }

    isOverdue(s: any): boolean {
        return new Date(s.nextDue) < new Date();
    }
}
