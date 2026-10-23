import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
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

import { authGuard } from './guards/auth.guard';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'karts', component: KartsComponent, canActivate: [authGuard] },
    { path: 'parts', component: PartsComponent, canActivate: [authGuard] },
    { path: 'maintenance', component: MaintenanceComponent, canActivate: [authGuard] },
    { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
    { path: 'users', component: UserManagementComponent, canActivate: [authGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
    { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },
    { path: 'incidents', component: IncidentsComponent, canActivate: [authGuard] },
    { path: 'schedules', component: SchedulesComponent, canActivate: [authGuard] },
    { path: 'audit-log', component: AuditLogComponent, canActivate: [authGuard] },
    { path: 'calendar', component: MaintenanceCalendarComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
