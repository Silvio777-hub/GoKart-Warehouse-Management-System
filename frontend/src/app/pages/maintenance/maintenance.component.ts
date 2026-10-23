import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { CardComponent } from '../../components/shared/card.component';
import { ButtonComponent } from '../../components/shared/button.component';

@Component({
    selector: 'app-maintenance',
    standalone: true,
    imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
    template: `
        <div class="page-container">
            <div class="header">
                <h2>Maintenance Logs</h2>
            </div>

            @if (role !== 'USER') {
                <app-card title="Log New Maintenance" class="mb-4">
                    <div class="inline-action-form">
                        <div class="form-group">
                            <label>Affected Kart</label>
                            <select [(ngModel)]="newLog.kartId" class="form-control">
                                <option value="" disabled selected>Select Kart</option>
                                @for (k of karts; track k.id) {
                                    <option [value]="k.id">{{ k.code }}</option>
                                }
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Service Date</label>
                            <input type="date" [(ngModel)]="newLog.date" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Maintenance Type</label>
                            <select [(ngModel)]="newLog.description" (ngModelChange)="onDescriptionChange()" class="form-control">
                                <option value="" disabled selected>Select Type</option>
                                @for (type of maintenanceTypes; track type) {
                                    <option [value]="type">{{ type }}</option>
                                }
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        @if (newLog.description === 'Other') {
                            <div class="form-group">
                                <label>Specify Other</label>
                                <input [(ngModel)]="otherDescription" placeholder="Specify maintenance..." class="form-control">
                            </div>
                        }

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" [(ngModel)]="isPriority">
                                Urgent Priority
                            </label>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <app-button (btnClick)="addLog()" size="lg">Submit Log</app-button>
                        </div>
                    </div>
                </app-card>
            }

            <app-card [hoverable]="false">
                @if (role === 'STAFF') {
                    <div class="table-header-actions">
                        <label class="checkbox-label text-dim">
                            <input type="checkbox" [(ngModel)]="onlyMyHistory">
                            Show Only My History
                        </label>
                    </div>
                }

                <div class="table-responsive">
                    <table class="swam-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Kart</th>
                                <th>Description</th>
                                <th>Technician</th>
                                @if (role !== 'STAFF') {
                                    <th>Actions</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            @for (m of displayLogs; track m.id) {
                                <tr>
                                    <td class="text-dim">{{ m.performedAt | date:'mediumDate' }}</td>
                                    <td class="font-bold">{{ m.kartCode || 'Unknown' }}</td>
                                    <td>
                                        {{ m.description }}
                                        @if (m.priority) {
                                            <span class="badge crashed" style="margin-left: 10px;">URGENT</span>
                                        }
                                        @if (m.verified) {
                                            <span class="badge available" style="margin-left: 10px;">Verified</span>
                                        }
                                    </td>
                                    <td class="text-muted">{{ m.performedBy || 'System' }}</td>
                                    @if (role !== 'STAFF') {
                                        <td>
                                            @if (!m.verified && (role === 'MANAGER' || role === 'ADMIN')) {
                                                <app-button (btnClick)="verifyLog(m)" variant="secondary">Verify</app-button>
                                            }
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
        .page-container {
            max-width: 1400px;
            margin: 0 auto;
            padding-bottom: 2rem;
        }

        .header {
            margin-bottom: 0.75rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h2 {
            margin: 0;
            font-size: 1.25rem;
            font-family: 'Outfit';
            font-weight: 700;
        }

        /* Form specific overrides if needed, but relying on global .form-grid */
        
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-main);
            user-select: none;
            padding: 0.25rem 0;
        }

        .checkbox-label input {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            accent-color: var(--primary);
            cursor: pointer;
        }

        .table-header-actions {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--card-border);
        }

        .font-bold {
            font-weight: 600;
            color: var(--text-main);
        }

        .actions-cell {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        }

        .text-dim { color: var(--text-dim); }
        .text-muted { color: var(--text-muted); }
        .mb-4 { margin-bottom: 0.75rem; }
    `]
})
export class MaintenanceComponent implements OnInit {
    logs: any[] = [];
    karts: any[] = [];
    newLog = { kartId: '', description: '', date: '' };
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

    checklists: any = {
        'Oil Change': [
            'Drain old oil',
            'Replace oil filter',
            'Refill with 10W-30 (0.6L)',
            'Check for leaks'
        ],
        'Tire Rotation': [
            'Inspect tire wear',
            'Swap front tires (crossed)',
            'Swap rear tires (parallel)',
            'Check tire pressure'
        ],
        'Brake Inspection': [
            'Check pad thickness',
            'Clean rotor with shop air',
            'Test pedal response',
            'Refill brake fluid if low'
        ]
    };
    activeChecklist: string[] | null = null;
    completedSteps: boolean[] = [];

    constructor(
        public api: ApiService,
        private toast: ToastService,
        private loading: LoadingService
    ) { }

    ngOnInit(): void {
        this.loadLogs();
        if (this.role === 'STAFF' || this.role === 'MANAGER' || this.role === 'ADMIN') {
            this.loadKarts();
        }
    }

    get role() { return this.api.getRole(); }

    loadLogs() {
        this.loading.show();
        this.api.listMaintenance().subscribe({
            next: (data: any) => {
                this.logs = data;
                this.loading.hide();
            },
            error: () => this.loading.hide()
        });
    }

    loadKarts() {
        this.api.getKarts().subscribe((data: any) => {
            this.karts = data;
        });
    }

    verifyLog(log: any) {
        this.loading.show();
        const updated = { ...log, verified: true };
        this.api.updateMaintenance(log.id, updated).subscribe({
            next: () => {
                this.toast.success('Maintenance verified');
                this.loadLogs();
            },
            error: () => this.loading.hide()
        });
    }

    onDescriptionChange() {
        const key = Object.keys(this.checklists).find(k => k.toLowerCase() === this.newLog.description.toLowerCase());
        if (key) {
            this.activeChecklist = this.checklists[key];
            this.completedSteps = new Array(this.activeChecklist!.length).fill(false);
        } else {
            this.activeChecklist = null;
        }
    }

    toggleStep(index: number) {
        this.completedSteps[index] = !this.completedSteps[index];
    }


    get displayLogs() {
        if (this.onlyMyHistory) {
            const myUsername = this.api.username;
            return this.logs.filter(l => l.performedBy === myUsername);
        }
        return this.logs;
    }

    onlyMyHistory = false;
    isPriority = false;

    addLog() {
        const finalDescription = this.newLog.description === 'Other' ? this.otherDescription : this.newLog.description;
        if (!this.newLog.kartId || !finalDescription || !this.newLog.date) return;

        const payload = {
            kartId: this.newLog.kartId,
            description: finalDescription,
            performedAt: new Date(this.newLog.date).toISOString(),
            priority: this.isPriority
        };

        this.loading.show();
        this.api.createMaintenance(payload).subscribe({
            next: () => {
                this.toast.success('Maintenance log added');
                this.loadLogs();
                this.newLog = { kartId: '', description: '', date: '' };
                this.otherDescription = '';
                this.isPriority = false;
            },
            error: () => this.loading.hide()
        });
    }
}

