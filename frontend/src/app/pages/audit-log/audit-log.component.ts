import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';

@Component({
    selector: 'app-audit-log',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './audit-log.component.html',
    styleUrls: ['./audit-log.component.scss']
})
export class AuditLogComponent implements OnInit {
    logs: any[] = [];
    filterQuery: string = '';

    constructor(private api: ApiService, private ws: WebSocketService) { }

    ngOnInit(): void {
        this.loadLogs();
        this.ws.watch('/topic/audit').subscribe(() => this.loadLogs());
    }

    loadLogs() {
        this.api.getAuditLog().subscribe({
            next: (data) => {
                this.logs = data;
            },
            error: (err) => {
                console.error('Failed to load audit logs', err);
            }
        });
    }

    filteredLogs() {
        if (!this.filterQuery) return this.logs;
        const q = this.filterQuery.toLowerCase();
        return this.logs.filter(l =>
            l.action.toLowerCase().includes(q) ||
            l.user.toLowerCase().includes(q) ||
            l.details?.toLowerCase().includes(q)
        );
    }

    getActionClass(action: string): string {
        if (action.includes('CREATE')) return 'badge-success';
        if (action.includes('DELETE')) return 'badge-danger';
        if (action.includes('UPDATE')) return 'badge-warning';
        if (action.includes('RESET')) return 'badge-info';
        return 'badge-secondary';
    }
}
