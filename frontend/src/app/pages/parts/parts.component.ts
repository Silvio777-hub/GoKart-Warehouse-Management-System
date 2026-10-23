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
    selector: 'app-parts',
    standalone: true,
    imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
    template: `
        <div class="page-container">
            <div class="header">
                <h2>Inventory Management</h2>
                @if (role !== 'USER') {
                    <div>
                        <app-button [variant]="showAddForm ? 'secondary' : 'primary'" (btnClick)="showAddForm = !showAddForm">
                            {{ showAddForm ? 'Cancel' : 'Add New Part' }}
                        </app-button>
                    </div>
                }
            </div>

            @if (showAddForm) {
                <app-card title="Add New Part" class="mb-4">
                    <div class="inline-action-form">
                        <div class="form-group">
                            <label>Select Standard Part</label>
                            <select class="form-control"
                                (change)="onPartSelect($any($event.target).value ? JSON.parse($any($event.target).value) : null)">
                                <option [value]="null">-- Select Standard Part --</option>
                                @for (p of standardParts; track p.sku) {
                                    <option [value]="JSON.stringify(p)">{{p.name}}</option>
                                }
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Initial Qty</label>
                            <input type="number" [(ngModel)]="newPart.quantity" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Min Thresh.</label>
                            <input type="number" [(ngModel)]="newPart.minStock" class="form-control">
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <app-button (btnClick)="addPart()" size="lg">Save Part</app-button>
                        </div>
                    </div>
                </app-card>
            }

            <app-card [hoverable]="false">
                <div class="table-responsive">
                    <table class="swam-table">
                        <thead>
                            <tr>
                                <th>Part Name</th>
                                <th>SKU</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                @if (role !== 'USER') {
                                    <th>Actions</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            @for (p of parts; track p.id) {
                                <tr>
                                    <td class="font-bold">{{ p.name }}</td>
                                    <td class="text-dim">{{ p.sku }}</td>
                                    <td [class.text-danger]="p.quantity < p.minStock" class="font-600">
                                        {{ p.quantity }}
                                        @if (p.restockFlag) {
                                            <span class="badge crashed" style="margin-left:8px">Restock</span>
                                        }
                                    </td>
                                    <td>
                                        @if (p.quantity < p.minStock) {
                                            <span class="badge maintenance">Low Stock</span>
                                        } @else {
                                            <span class="badge available">In Stock</span>
                                        }
                                        @if (p.lastAudited) {
                                            <div class="audit-info">
                                                Audited: {{ p.lastAudited | date:'shortDate' }}
                                            </div>
                                        }
                                    </td>
                                    @if (role !== 'USER') {
                                        <td>
                                            <div class="actions-cell">
                                                <app-button (btnClick)="deletePart(p.id)" variant="danger">Delete</app-button>
                                                @if (!p.restockFlag && role !== 'STAFF') {
                                                    <app-button (btnClick)="flagRestock(p)" variant="secondary">Flag</app-button>
                                                }
                                                @if (role === 'MANAGER' || role === 'ADMIN') {
                                                    <app-button (btnClick)="auditPart(p)" variant="primary">Audit</app-button>
                                                }
                                            </div>
                                        </td>
                                    }
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </app-card>

            <!-- NEW: Part Requests Section -->
            @if (role !== 'USER') {
                <div class="mt-4">
                    <h3 class="side-title">Parts Request Management</h3>

                    <!-- Staff can submit new requests -->
                    @if (role === 'STAFF') {
                        <app-card title="Request New Parts" class="mt-2">
                            <div class="inline-action-form">
                                <div class="form-group">
                                    <label>Part Needed</label>
                                    <select [(ngModel)]="newRequest.partId" class="form-control">
                                        <option value="" disabled>Select Part...</option>
                                        @for (p of parts; track p.id) {
                                            <option [value]="p.id">{{p.name}} ({{p.sku}})</option>
                                        }
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Quantity</label>
                                    <input type="number" [(ngModel)]="newRequest.quantity" class="form-control">
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <app-button (btnClick)="submitRequest()" size="lg">Submit Request</app-button>
                                </div>
                            </div>
                        </app-card>
                    }

                    <!-- Manager/Admin sees active requests -->
                    @if (role !== 'STAFF') {
                        <app-card title="Active Requests" class="mt-2" [hoverable]="false">
                            <div class="table-responsive">
                                <table class="swam-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Requester</th>
                                            <th>Part</th>
                                            <th>Qty</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @for (req of partRequests; track req.id) {
                                            <tr>
                                                <td>{{req.requestedAt | date:'short'}}</td>
                                                <td>{{req.requesterName}}</td>
                                                <td class="font-bold">{{req.partName}}</td>
                                                <td>{{req.quantity}}</td>
                                                <td><span class="badge available">{{req.status}}</span></td>
                                                <td>
                                                    @if (req.status === 'REQUESTED') {
                                                        <div class="actions-cell">
                                                            <app-button (btnClick)="approveRequest(req, 'APPROVED')">Approve</app-button>
                                                            <app-button (btnClick)="approveRequest(req, 'REJECTED')"
                                                                variant="danger">Deny</app-button>
                                                        </div>
                                                    }
                                                </td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </app-card>
                    }
                </div>
            }
        </div>
    `,
    styles: [`
        .page-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .header h2 {
            margin: 0;
            font-size: 1.5rem;
            font-family: 'Outfit';
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 0.75rem;
            align-items: flex-end;
        }

        .request-grid {
            grid-template-columns: 2fr 1fr 1fr;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .form-group label {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-dim);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .d-flex-end {
            align-self: flex-end;
        }

        .actions-cell {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        }

        .audit-info {
            font-size: 0.75rem;
            color: var(--text-dim);
            margin-top: 6px;
            font-style: italic;
        }

        .font-bold {
            font-weight: 700;
            color: var(--text-main);
        }

        .font-600 {
            font-weight: 600;
        }

        .text-danger {
            color: var(--danger) !important;
        }

        .text-dim {
            color: var(--text-dim);
        }

        .mt-2 {
            margin-top: 0.5rem;
        }

        .mt-4 {
            margin-top: 1rem;
        }

        .mb-4 {
            margin-bottom: 0.75rem;
        }

        .side-title {
            margin-top: 1rem;
            font-family: 'Outfit';
            font-size: 1.25rem;
        }
    `]
})
export class PartsComponent implements OnInit {
    parts: any[] = [];
    partRequests: any[] = [];
    showAddForm = false;
    newPart = { name: '', sku: '', quantity: 0, minStock: 0 };
    newRequest = { partId: '', quantity: 1 };
    JSON = JSON; // Expose JSON to template for dropdown parsing

    // List of standard predefined parts for the dropdown
    standardParts = [
        { name: 'Slick Tires (Set)', sku: 'TIRE-SLK-001' },
        { name: 'Rain Tires (Set)', sku: 'TIRE-RAIN-002' },
        { name: 'Brake Pad (Rear)', sku: 'BRK-PAD-R' },
        { name: 'Drive Chain 219', sku: 'CHN-219' },
        { name: 'Spark Plug NGK', sku: 'SPK-NGK-09' },
        { name: 'Engine Oil (1L)', sku: 'OIL-SYN-1L' },
        { name: 'Rear Axle 50mm', sku: 'AXL-R-50' },
        { name: 'Steering Wheel', sku: 'STR-WHL-01' },
        { name: 'Fuel Hosing (1m)', sku: 'FUEL-HOSE' },
        { name: 'Tie Rod', sku: 'TIE-ROD-01' }
    ];

    constructor(
        public api: ApiService,
        private ws: WebSocketService,
        private toast: ToastService,
        private loading: LoadingService
    ) { }

    /** Load parts on initialization */
    ngOnInit(): void {
        this.loadParts();

        // Real-time updates
        this.ws.watch('/topic/parts').subscribe(() => this.loadParts());
        this.ws.watch('/topic/part-requests').subscribe(() => {
            if (this.role !== 'STAFF') this.loadRequests();
        });
    }

    /** Helper to get current user role */
    get role() { return this.api.getRole(); }

    /** Fetches the parts list from the backend */
    loadParts() {
        this.loading.show();
        this.api.listParts().subscribe({
            next: (data: any) => {
                this.parts = data;
                this.loading.hide();
            },
            error: () => this.loading.hide()
        });
        if (this.role !== 'STAFF') {
            this.loadRequests();
        }
    }

    loadRequests() {
        this.api.getPartRequests().subscribe(data => this.partRequests = data);
    }

    submitRequest() {
        if (!this.newRequest.partId) return;
        this.loading.show();
        this.api.createPartRequest(this.newRequest).subscribe({
            next: () => {
                this.toast.success('Request submitted for approval.');
                this.newRequest = { partId: '', quantity: 1 };
                this.loading.hide();
            },
            error: () => this.loading.hide()
        });
    }

    approveRequest(req: any, status: string) {
        this.loading.show();
        this.api.updatePartRequestStatus(req.id, status).subscribe({
            next: () => {
                this.toast.info(`Request ${status.toLowerCase()}`);
                this.loadRequests();
                this.loadParts(); // To see updated levels if we implemented stock deduction
            },
            error: () => this.loading.hide()
        });
    }


    /**
     * Updates the newPart object when a standard part is selected from the dropdown.
     * @param part The selected standard part object
     */
    onPartSelect(part: any) {
        this.newPart.name = part.name;
        this.newPart.sku = part.sku;
    }

    addPart() {
        if (!this.newPart.name || !this.newPart.sku) return;
        this.loading.show();
        this.api.createPart(this.newPart).subscribe({
            next: () => {
                this.toast.success('Part added successfully');
                this.loadParts();
                this.newPart = { name: '', sku: '', quantity: 0, minStock: 0 };
                this.showAddForm = false;
            },
            error: () => this.loading.hide()
        });
    }

    deletePart(id: number) {
        if (confirm('Are you sure you want to delete this part?')) {
            // OPTIMISTIC: Remove immediately
            const previousParts = [...this.parts];
            this.parts = this.parts.filter(p => p.id !== id);

            this.api.deletePart(id).subscribe({
                next: () => {
                    this.toast.error('Part deleted');
                },
                error: () => {
                    this.toast.error('Failed to delete part');
                    this.parts = previousParts; // Rollback
                }
            });
        }
    }

    flagRestock(part: any) {
        // OPTIMISTIC
        const oldFlag = part.restockFlag;
        part.restockFlag = true;

        this.api.updatePart(part.id, { ...part, restockFlag: true }).subscribe({
            next: () => {
                this.toast.info('Restock flag added');
            },
            error: () => {
                part.restockFlag = oldFlag; // Rollback
                this.loadParts(); // Sync
            }
        });
    }

    auditPart(part: any) {
        // OPTIMISTIC
        const oldDate = part.lastAudited;
        part.lastAudited = new Date().toISOString();

        this.api.updatePart(part.id, { ...part, lastAudited: part.lastAudited }).subscribe({
            next: () => {
                this.toast.success('Part marked as Audited');
            },
            error: () => {
                part.lastAudited = oldDate; // Rollback
                this.loadParts(); // Sync
            }
        });
    }
}

