import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Added for ngModel

import { AppRoutingModule } from './app-routing.module'; // Added
import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { KartsComponent } from './pages/karts/karts.component';
import { PartsComponent } from './pages/parts/parts.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UserManagementComponent } from './pages/users/users.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { IncidentsComponent } from './pages/incidents/incidents.component';
import { SchedulesComponent } from './pages/schedules/schedules.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AuditLogComponent } from './pages/audit-log/audit-log.component';
import { MaintenanceCalendarComponent } from './pages/maintenance-calendar/maintenance-calendar.component';

import { CardComponent } from './components/shared/card.component';
import { ButtonComponent } from './components/shared/button.component';
import { SpinnerComponent } from './components/shared/spinner.component';
import { ToastComponent } from './components/shared/toast.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    AppComponent,
    DashboardComponent,
    LoginComponent,
    NavbarComponent,
    KartsComponent,
    PartsComponent,
    MaintenanceComponent,
    ReportsComponent,
    SettingsComponent,
    UserManagementComponent,
    CardComponent,
    ButtonComponent,
    TasksComponent,
    IncidentsComponent,
    SchedulesComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AuditLogComponent,
    MaintenanceCalendarComponent,
    SpinnerComponent,
    ToastComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
