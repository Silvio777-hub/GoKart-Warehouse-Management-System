import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';

@Component({
    selector: 'app-maintenance-calendar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './maintenance-calendar.component.html',
    styleUrls: ['./maintenance-calendar.component.scss']
})
export class MaintenanceCalendarComponent implements OnInit {
    schedules: any[] = [];
    weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysInMonth: number[] = [];
    emptyDays: number[] = [];
    currentDate = new Date();

    constructor(private api: ApiService, private ws: WebSocketService) { }

    ngOnInit(): void {
        this.loadSchedules();
        this.generateCalendar();

        // Real-time updates
        this.ws.watch('/topic/maintenance-schedules').subscribe(() => this.loadSchedules());
    }

    loadSchedules() {
        this.api.getSchedules().subscribe(data => {
            this.schedules = data;
        });
    }

    get currentMonthYear(): string {
        return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // First day of month
        const firstDay = new Date(year, month, 1).getDay();
        this.emptyDays = Array(firstDay).fill(0);

        // Days in month
        const totalDays = new Date(year, month + 1, 0).getDate();
        this.daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);
    }

    getSchedulesForDay(day: number): any[] {
        const dateStr = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day).toDateString();
        return this.schedules.filter(s => new Date(s.nextDue).toDateString() === dateStr);
    }

    changeMonth(offset: number) {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + offset, 1);
        this.generateCalendar();
    }

    selectedDaySchedules: any[] = [];
    selectedDate: Date | null = null;

    selectDate(day: number) {
        this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
        this.selectedDaySchedules = this.getSchedulesForDay(day);
    }

    closeDetails() {
        this.selectedDate = null;
        this.selectedDaySchedules = [];
    }

    isToday(day: number): boolean {
        const now = new Date();
        return now.getDate() === day &&
            now.getMonth() === this.currentDate.getMonth() &&
            now.getFullYear() === this.currentDate.getFullYear();
    }

    isOverdue(s: any): boolean {
        return new Date(s.nextDue) < new Date();
    }
}
