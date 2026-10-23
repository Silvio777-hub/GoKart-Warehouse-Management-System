import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from './services/api.service';
import { LoadingService } from './services/loading.service';
import { SpinnerComponent } from './components/shared/spinner.component';
import { ToastComponent } from './components/shared/toast.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, ToastComponent, NavbarComponent, SidebarComponent],
  template: `
    <app-spinner [loading]="(loading.isLoading$ | async) || false"></app-spinner>
    <app-toast></app-toast>
    
    <div class="app-layout" [class.authenticated]="api.isLoggedIn()">
      <app-sidebar *ngIf="api.isLoggedIn()"></app-sidebar>
      
      <div class="main-content-wrapper">
        <div class="main-content">
          <router-outlet></router-outlet>
        </div>
        
        <div class="footer" style="text-align: center; padding: 1.5rem; color: #666; font-size: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05);">
          Developed by <strong>JM Silvio</strong>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    .main-content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .authenticated .main-content-wrapper {
      margin-left: 260px; /* Sidebar width */
    }

    .main-content {
      flex: 1;
      padding: 0;
    }

    /* Keep landing/login centered */
    :host ::ng-deep .login-container {
       margin-left: 0 !important;
       width: 100vw;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(public api: ApiService, public loading: LoadingService) { }

  ngOnInit() {
    // Safety check: Ensure we start without a stuck loader
    this.loading.hide();
  }
}
