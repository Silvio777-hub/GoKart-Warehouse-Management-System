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
    selector: 'app-tasks',
    standalone: true,
    imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
    template: `
    <div class="page-container">
        <div class="header">
            <h2>Task Queue</h2>
            <p class="text-dim">Assign and track operational objectives across the technical team.</p>
        </div>
        
        <!-- Fulfillment Banner -->
        @if (isFullyFulfilled) {
            <div class="success-banner">
                 <div class="banner-content">
                    <div class="dot available"></div>
                    <div>
                        <h3>Operational Excellence</h3>
                        <p>All scheduled tasks have been fulfilled. Your queue is clear.</p>
                    </div>
                 </div>
            </div>
        }

        @if (role !== 'STAFF') {
            <app-card title="Assign New Task" class="mb-4">
                <div class="inline-action-form">
                    <div class="form-group">
                        <label>Task Description</label>
                        <input [(ngModel)]="newTask.description" placeholder="What needs to be done?" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Assign To</label>
                        <select [(ngModel)]="newTask.assigneeUsername" class="form-control">
                            <option value="" disabled selected>Select User...</option>
                            @for (u of availableAssignees; track u.username) {
                                <option [value]="u.username">
                                    {{u.username}} ({{u.role}})
                                </option>
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select [(ngModel)]="newTask.priority" class="form-control">
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <app-button (btnClick)="submitTask()" size="lg">Create Task</app-button>
                    </div>
                </div>
            </app-card>
        }

        <app-card [hoverable]="false">
            <div class="table-responsive">
                <table class="swam-table">
                    <thead>
                        <tr>
                            <th>Objective</th>
                            <th>Assignee</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (t of tasks; track t.id) {
                            <tr>
                                <td class="font-bold">{{t.description}}</td>
                                <td class="text-muted">{{t.assigneeUsername || 'Unassigned'}}</td>
                                <td>
                                    <span class="badge" 
                                          [class.crashed]="t.priority === 'HIGH'" 
                                          [class.maintenance]="t.priority === 'MEDIUM'"
                                          [class.available]="t.priority === 'LOW'">
                                        {{t.priority}}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge" [class.available]="t.status === 'DONE'" [class.maintenance]="t.status !== 'DONE'">
                                        {{t.status}}
                                    </span>
                                </td>
                                <td>
                                    <div class="actions-cell">
                                        @if (t.status !== 'DONE' && t.assigneeUsername === currentUser) {
                                            <app-button (btnClick)="markDone(t)" variant="secondary">Mark Done</app-button>
                                        }
                                        @if (role === 'ADMIN' || role === 'MANAGER' || t.creatorUsername === currentUser) {
                                            <app-button (btnClick)="deleteTask(t.id)" variant="danger">Delete</app-button>
                                        }
                                    </div>
                                </td>
                            </tr>
                        } @empty {
                            <tr>
                                <td colspan="5" class="empty-state">No active tasks assigned in the queue.</td>
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
    .header h2 { margin: 0; font-size: 1.5rem; font-family: 'Outfit'; }
    .header .text-dim { font-size: 0.85rem; margin-top: 0.2rem; }
    
    .success-banner { background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 1rem; padding: 0.75rem 1rem; margin-bottom: 0.75rem; border-left: 4px solid var(--success); }
    .banner-content { display: flex; align-items: center; gap: 1.5rem; }
    .banner-content h3 { margin: 0; color: var(--success); font-size: 1.25rem; }
    .banner-content p { margin: 0.25rem 0 0 0; color: var(--text-muted); font-size: 0.9rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.available { background: var(--success); box-shadow: 0 0 10px var(--success); }

    .form-grid { display: flex; gap: 0.75rem; align-items: flex-end; }
    .form-group { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
    .form-group label { font-size: 0.65rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
    .d-flex-end { align-self: flex-end; }

    .actions-cell { display: flex; gap: 8px; }
    .font-bold { font-weight: 700; color: var(--text-main); }
    .text-dim { color: var(--text-dim); }
    .text-muted { color: var(--text-muted); }
    .empty-state { text-align: center; padding: 1.5rem !important; color: var(--text-dim); font-style: italic; }
    .mb-4 { margin-bottom: 0.75rem; }
  `]
})
export class TasksComponent implements OnInit {
    tasks: any[] = [];
    allUsers: any[] = [];
    role = '';
    currentUser = '';
    newTask = { description: '', assigneeUsername: '', priority: 'MEDIUM', status: 'PENDING' };

    constructor(
        private api: ApiService,
        private ws: WebSocketService,
        private toast: ToastService,
        private loading: LoadingService
    ) { }

    ngOnInit() {
        this.role = this.api.getRole();
        this.currentUser = this.api.username;
        this.loadTasks();

        // Real-time updates
        this.ws.watch('/topic/tasks').subscribe(() => this.loadTasks());
        this.ws.watch('/topic/part-requests').subscribe(() => this.loadTasks());

        if (this.role === 'ADMIN' || this.role === 'MANAGER') {
            this.api.getUsers().subscribe(users => {
                this.allUsers = users;
            });
        }
    }

    get availableAssignees() {
        if (this.role === 'ADMIN') {
            // Admin can assign to Managers and Staff
            return this.allUsers.filter(u => u.role === 'MANAGER' || u.role === 'STAFF');
        } else if (this.role === 'MANAGER') {
            // Manager can only assign to Staff
            return this.allUsers.filter(u => u.role === 'STAFF');
        }
        return [];
    }

    get isFullyFulfilled() {
        return this.tasks.length > 0 && this.tasks.every(t => t.status === 'DONE');
    }

    loadTasks() {
        this.loading.show();
        this.api.getTasks().subscribe({
            next: (data) => {
                this.tasks = data || [];
                this.loading.hide();
            },
            error: () => this.loading.hide()
        });
    }

    submitTask() {
        if (!this.newTask.description || !this.newTask.assigneeUsername) {
            this.toast.error('Description and Assignee are required');
            return;
        }
        this.loading.show();
        this.api.createTask(this.newTask).subscribe({
            next: () => {
                this.toast.success('Task assigned successfully');
                this.newTask = { description: '', assigneeUsername: '', priority: 'MEDIUM', status: 'PENDING' };
                this.loadTasks();
            },
            error: () => this.loading.hide()
        });
    }

    markDone(task: any) {
        // OPTIMISTIC: Update local UI immediately
        const oldStatus = task.status;
        task.status = 'DONE';

        this.api.updateTaskStatus(task.id, 'DONE').subscribe({
            next: () => {
                this.toast.info('Task completed');
            },
            error: () => {
                this.toast.error('Failed to update task');
                task.status = oldStatus; // Rollback
                this.loadTasks(); // Full refresh to be safe
            }
        });
    }

    deleteTask(id: number) {
        if (confirm('Delete this task?')) {
            this.loading.show();
            this.api.deleteTask(id).subscribe({
                next: () => {
                    this.toast.error('Task removed');
                    this.loadTasks();
                },
                error: () => this.loading.hide()
            });
        }
    }
}
