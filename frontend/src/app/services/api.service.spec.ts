import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService (Auth)', () => {
    let service: ApiService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ApiService]
        });
        service = TestBed.inject(ApiService);
        httpMock = TestBed.inject(HttpTestingController);
        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should login and return token', () => {
        const mockResponse = { token: 'mock-jwt-token' };
        const username = 'testuser';
        const password = 'password';

        service.login(username, password).subscribe(res => {
            expect(res).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${service.base}/auth/login`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ username, password });
        req.flush(mockResponse);
    });

    it('should check if logged in', () => {
        expect(service.isLoggedIn()).toBeFalse();
        localStorage.setItem('token', 'some-token');
        expect(service.isLoggedIn()).toBeTrue();
    });

    it('should logout and clear state', () => {
        localStorage.setItem('token', 'some-token');
        service.logout();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('should extract role from token', () => {
        // Mocking an admin token (role: ADMIN)
        const adminToken = 'header.' + btoa(JSON.stringify({ role: 'ADMIN', sub: 'admin' })) + '.signature';
        localStorage.setItem('token', adminToken);

        expect(service.getRole()).toBe('ADMIN');
        expect(service.username).toBe('admin');
    });
});
