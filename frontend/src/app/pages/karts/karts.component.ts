import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { CardComponent } from '../../components/shared/card.component';
import { ButtonComponent } from '../../components/shared/button.component';

@Component({
    selector: 'app-karts',
    standalone: true,
    imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
    templateUrl: './karts.component.html',
    styleUrls: ['./karts.component.scss']
})
export class KartsComponent implements OnInit, OnDestroy {
    karts: any[] = [];
    newKartCode = '';
    showAddForm = false;

    newStatus = '';
    newNote = '';
    selectedKartId: number | null = null;

    // Pagination & Search
    page = 0;
    size = 10;
    totalElements = 0;
    totalPages = 0;
    searchQuery = '';
    lastUpdated = new Date();
    private refreshInterval: any;

    constructor(
        public api: ApiService,
        private ws: WebSocketService,
        private toast: ToastService,
        private loading: LoadingService
    ) { }

    ngOnInit(): void {
        this.loadKarts();

        // Real-time updates
        this.ws.watch('/topic/karts').subscribe(() => {
            if (this.selectedKartId === null && !this.showAddForm) {
                this.loadKarts();
            }
        });

        // Set up fallback real-time refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (this.selectedKartId === null && !this.showAddForm) {
                this.loadKarts();
            }
        }, 30000);
    }

    ngOnDestroy(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    get role() { return this.api.getRole(); }

    loadKarts() {
        this.loading.show();
        this.api.listKarts(this.page, this.size, this.searchQuery).subscribe({
            next: (data: any) => {
                this.karts = data.content;
                this.totalElements = data.totalElements;
                this.totalPages = data.totalPages;
                this.lastUpdated = new Date();
                this.loading.hide();
            },
            error: () => this.loading.hide()
        });
    }

    onSearch() {
        this.page = 0;
        this.loadKarts();
    }

    nextPage() {
        if (this.page < this.totalPages - 1) {
            this.page++;
            this.loadKarts();
        }
    }

    prevPage() {
        if (this.page > 0) {
            this.page--;
            this.loadKarts();
        }
    }

    addKart() {
        if (!this.newKartCode) return;
        this.loading.show();
        this.api.createKart({ code: this.newKartCode, status: 'AVAILABLE', hoursRun: 0 }).subscribe({
            next: () => {
                this.toast.success('Kart added successfully');
                this.loadKarts();
                this.newKartCode = '';
                this.showAddForm = false;
            },
            error: () => this.loading.hide()
        });
    }

    selectKart(kart: any) {
        this.selectedKartId = kart.id;
        this.newStatus = kart.status;
        this.newNote = kart.statusNote || '';
    }

    updateStatus(id: number) {
        if (!this.newStatus) return;

        // OPTIMISTIC: Update local UI immediately for that "instant" feel
        const kart = this.karts.find(k => k.id === id);
        let oldState: any = null;
        if (kart) {
            oldState = { ...kart };
            kart.status = this.newStatus;
            kart.statusNote = this.newNote;
        }

        // Close the edit mode immediately
        this.selectedKartId = null;

        // Background sync
        this.api.updateKartStatus(id, this.newStatus, this.newNote).subscribe({
            next: () => {
                this.toast.success('Kart updated');
            },
            error: () => {
                this.toast.error('Failed to update Kart');
                // Rollback if failure
                if (kart && oldState) Object.assign(kart, oldState);
                this.loadKarts();
            }
        });
    }

    quickCrash(id: number) {
        if (confirm('Report CRASH for this kart?')) {
            this.loading.show();
            this.api.reportCrash(id).subscribe({
                next: () => {
                    this.toast.error('Crash reported');
                    this.loadKarts();
                },
                error: () => this.loading.hide()
            });
        }
    }

    pitStop(id: number) {
        this.loading.show();
        this.api.pitStop(id).subscribe({
            next: () => {
                this.toast.info('Pit stop logged');
                this.loading.hide();
            },
            error: () => this.loading.hide()
        });
    }

    resetHours(id: number) {
        if (confirm('Reset engine hours to 0?')) {
            this.loading.show();
            this.api.resetHours(id).subscribe({
                next: () => {
                    this.toast.info('Engine hours reset');
                    this.loadKarts();
                },
                error: () => this.loading.hide()
            });
        }
    }
}

