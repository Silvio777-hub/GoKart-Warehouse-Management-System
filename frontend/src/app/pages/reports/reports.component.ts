import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { CardComponent } from '../../components/shared/card.component';
import { ButtonComponent } from '../../components/shared/button.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent],
  template: `
    <div class="page-container">
      <div class="header">
        <h2>System Reports & Documents</h2>
        <p class="text-dim">Secure document repository and system-wide data generation for all personnel.</p>
      </div>

      <!-- SECTION 1: UPLOAD (Available to ALL) -->
      <app-card title="Upload Report / Document" class="mt-30">
          <div class="inline-action-form">
              <div class="form-group">
                <input type="file" (change)="onFileSelected($event)" accept=".pdf,.csv" class="form-control" style="padding: 0.4rem;">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <app-button (btnClick)="uploadFile()" [disabled]="!selectedFile">Upload</app-button>
              </div>
          </div>
          <p class="text-dim" style="font-size: 0.8rem; margin-top: 0.5rem; margin-bottom: 0;">* Upload CSV or PDF files. Accessible to Managers & Admins.</p>
      </app-card>

      <!-- SECTION 2: SYSTEM GENERATED (Admin/Manager ONLY) -->
      @if (role !== 'STAFF') {
          <div class="mt-30">
              <h3 style="margin-bottom: 1.5rem; font-family: 'Outfit';">System Data Generation</h3>
              <div class="report-grid">
                @for (r of [
                    {t:'Fleet Status', d:'Operational status & hours', u:'karts'},
                    {t:'Maintenance History', d:'Repairs & replacements', u:'maintenance'},
                    {t:'Inventory Audit', d:'Usage trends', u:'parts'}
                ]; track r.t) {
                  <app-card [title]="r.t" class="report-card">
                    <p>{{r.d}}</p>
                    <div class="actions">
                      <app-button (btnClick)="downloadReport(r.u, 'csv')" variant="primary" style="flex:1">CSV</app-button>
                      <app-button (btnClick)="downloadReport(r.u, 'pdf')" variant="secondary" style="flex:1">PDF</app-button>
                    </div>
                  </app-card>
                }
              </div>
          </div>
      }

      <!-- SECTION 3: DOCUMENT REPOSITORY (Admin/Manager ONLY) -->
      @if (role !== 'STAFF') {
        <app-card title="Document Repository" class="mt-30">
            <div class="table-responsive">
              <table class="swam-table">
                  <thead>
                      <tr>
                          <th>Filename</th>
                          <th>Uploaded By</th>
                          <th>Date</th>
                          <th>Size</th>
                          <th>Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      @for (doc of documents; track doc.id) {
                        <tr>
                            <td>{{doc.filename}}</td>
                            <td>{{doc.uploadedBy}}</td>
                            <td>{{doc.uploadedAt | date:'shortDate'}}</td>
                            <td>{{(doc.sizeBytes / 1024) | number:'1.0-0'}} KB</td>
                            <td>
                                <button class="link-btn" (click)="downloadDocument(doc)">Download</button>
                                @if (role === 'ADMIN') {
                                  <button class="link-btn delete" (click)="deleteDocument(doc.id)">Delete</button>
                                }
                            </td>
                        </tr>
                      } @empty {
                        <tr>
                            <td colspan="5" style="text-align:center; padding:2rem; opacity:0.6;">No documents found.</td>
                        </tr>
                      }
                  </tbody>
              </table>
            </div>
        </app-card>
      }

      <!-- SECTION 4: ADMIN ONLY -->
      @if (role === 'ADMIN') {
        <div class="mt-30">
            @if (analytics) {
              <app-card title="Analytics Overview" class="mt-30">
                <div class="analytics-grid">
                    <div class="stat-box">
                        <span class="stat-value">{{analytics.totalKarts}}</span>
                        <span class="stat-label">Total Karts</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">{{analytics.activeKarts}}</span>
                        <span class="stat-label">Active</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">{{analytics.maintenanceKarts}}</span>
                        <span class="stat-label">In Repair</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">{{analytics.totalHours}}</span>
                        <span class="stat-label">Total Hours Run</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">{{analytics.totalStaff}}</span>
                        <span class="stat-label">Staff Members</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">{{analytics.totalLogs}}</span>
                        <span class="stat-label">Maint. Operations</span>
                    </div>
                </div>
              </app-card>
            }

            <app-card title="System Administration" class="mt-30">
                <div class="admin-actions">
                    <app-button (btnClick)="runBackup()" variant="secondary">
                        System Backup
                    </app-button>
                    <p class="hint">Creates a snapshot of the database in the <code>/backups</code> directory.</p>
                </div>
            </app-card>

            <app-card title="System Audit Log" class="mt-30">
                <div class="table-responsive">
                  <table class="swam-table">
                      <thead>
                          <tr>
                              <th>Timestamp</th>
                              <th>User</th>
                              <th>Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          @for (log of auditLogs; track log.timestamp) {
                            <tr>
                                <td>{{log.timestamp | date:'short'}}</td>
                                <td>{{log.user}}</td>
                                <td>{{log.action}}</td>
                            </tr>
                          }
                      </tbody>
                  </table>
                </div>
            </app-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .header { margin-bottom: 0.75rem; }
    .header h2 { margin: 0; font-size: 1.5rem; font-family: 'Outfit'; font-weight: 700; }
    .header p { margin-top: 0.2rem; margin-bottom: 0; font-size: 0.85rem; }
    .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75rem; margin-top: 0.75rem; }
    .report-card p { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.75rem; }
    .actions { display: flex; gap: 12px; }
    .mt-30 { margin-top: 1rem; }
    .mb-4 { margin-bottom: 0.75rem; }
    .analytics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.5rem; }
    
    .link-btn { background: none; border: none; font-weight: 600; cursor: pointer; padding: 0.5rem; transition: color 0.2s; color: var(--primary); }
    .link-btn:hover { color: var(--primary-hover); text-decoration: underline; }
    .link-btn.delete { color: var(--danger); }
    
    .hint { font-size: 0.85rem; color: var(--text-dim); margin-top: 1rem; }
    .hint { font-size: 0.85rem; color: var(--text-dim); margin-top: 1rem; }
    code { background: var(--input-bg); padding: 2px 6px; border-radius: 4px; color: var(--accent); }
  `]
})
export class ReportsComponent implements OnInit {
  auditLogs: any[] = [];
  documents: any[] = [];
  analytics: any = null;
  role = '';
  selectedFile: File | null = null;

  constructor(
    public api: ApiService,
    private router: Router,
    private toast: ToastService,
    private loading: LoadingService
  ) { }

  ngOnInit() {
    this.role = this.api.getRole();
    this.loadData();
  }

  loadData() {
    this.loading.show();
    if (this.role === 'ADMIN') {
      this.api.getAuditLog().subscribe(d => this.auditLogs = d);
      this.api.getAnalytics().subscribe(d => this.analytics = d);
    }

    // Only Managers and Admins can see the document repository
    if (this.role !== 'STAFF') {
      this.loadDocuments();
    } else {
      this.loading.hide();
    }
  }

  loadDocuments() {
    this.api.listDocuments().subscribe({
      next: (docs: any) => {
        this.documents = docs || [];
        this.loading.hide();
      },
      error: () => this.loading.hide()
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  uploadFile() {
    if (!this.selectedFile) return;
    this.loading.show();
    this.api.uploadDocument(this.selectedFile).subscribe({
      next: () => {
        this.toast.success('Document uploaded successfully');
        this.selectedFile = null;
        const inputs = document.querySelectorAll('input[type="file"]');
        inputs.forEach((i: any) => i.value = '');

        // Staff can upload but not list documents
        if (this.role !== 'STAFF') {
          this.loadDocuments();
        } else {
          this.loading.hide();
        }
      },
      error: () => this.loading.hide()
    });
  }

  downloadDocument(doc: any) {
    this.loading.show();
    this.api.downloadDocument(doc.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading.hide();
      },
      error: () => this.loading.hide()
    });
  }

  deleteDocument(id: number) {
    if (confirm('Delete this document permanently?')) {
      this.loading.show();
      this.api.deleteDocument(id).subscribe({
        next: () => {
          this.toast.error('Document deleted');
          this.loadDocuments();
        },
        error: () => this.loading.hide()
      });
    }
  }

  downloadReport(type: string, format: string) {
    const filename = `${type}_report.${format}`;
    this.loading.show();
    this.api.downloadReport(type, format).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading.hide();
        this.toast.info('Report downloaded');
      },
      error: () => this.loading.hide()
    });
  }

  runBackup() {
    if (confirm('Create a system backup now?')) {
      this.loading.show();
      this.api.backup().subscribe({
        next: (res) => {
          this.toast.success(res.message || 'Backup successful!');
          this.loading.hide();
        },
        error: () => this.loading.hide()
      });
    }
  }
}
