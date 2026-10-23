import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuditLogComponent } from './audit-log.component';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';

describe('AuditLogComponent', () => {
    let component: AuditLogComponent;
    let fixture: ComponentFixture<AuditLogComponent>;
    let apiService: ApiService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                RouterTestingModule,
                AuditLogComponent // Import as it is standalone
            ],
            providers: [ApiService]
        }).compileComponents();

        fixture = TestBed.createComponent(AuditLogComponent);
        component = fixture.componentInstance;
        apiService = TestBed.inject(ApiService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load logs on init', () => {
        const mockLogs = [{ action: 'TEST', user: 'admin', timestamp: new Date() }];
        spyOn(apiService, 'getAuditLog').and.returnValue(of(mockLogs));

        component.ngOnInit();

        expect(apiService.getAuditLog).toHaveBeenCalled();
        expect(component.logs).toEqual(mockLogs);
    });

    it('should filter logs correctly', () => {
        component.logs = [
            { action: 'CREATE_KART', user: 'admin', details: 'test' },
            { action: 'DELETE_KART', user: 'staff', details: 'test' }
        ];

        component.filterQuery = 'ADMIN';
        let filtered = component.filteredLogs();
        expect(filtered.length).toBe(1);
        expect(filtered[0].user).toBe('admin');

        component.filterQuery = 'DELETE';
        filtered = component.filteredLogs();
        expect(filtered.length).toBe(1);
        expect(filtered[0].action).toBe('DELETE_KART');
    });
});
