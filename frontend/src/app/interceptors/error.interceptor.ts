import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

/**
 * HTTP Error Interceptor
 * Intercepts all HTTP errors globally and provides consistent error handling.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private router: Router, private toastService: ToastService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'An unexpected error occurred';

                if (error.error instanceof ErrorEvent) {
                    // Client-side or network error
                    errorMessage = `Network Error: ${error.error.message}`;
                    console.error('Client-side error:', error.error.message);
                } else {
                    // Backend returned an unsuccessful response code
                    console.error(`Backend returned code ${error.status}, body was:`, error.error);

                    // Handle Blob errors (e.g. PDF generation failure)
                    if (error.error instanceof Blob && error.error.type === 'application/json') {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            try {
                                const errBody = JSON.parse(e.target?.result as string);
                                const msg = errBody.message || errBody.error || error.statusText;
                                this.toastService.error(msg);
                            } catch (jsonErr) {
                                this.toastService.error('An error occurred processing the file.');
                            }
                        };
                        reader.readAsText(error.error);
                        // Return a dummy error so the pipe continues, handling effectively done asynchronously
                        return throwError(() => new Error('Blob Error Processing'));
                    }

                    switch (error.status) {
                        case 401:
                            if (req.url.includes('/auth/login')) {
                                errorMessage = 'Invalid Credentials. Please try again.';
                            } else {
                                errorMessage = 'Your session has expired. Please log in again.';
                                localStorage.removeItem('token');
                                this.router.navigate(['/login']);
                            }
                            break;
                        case 403:
                            errorMessage = 'You do not have permission to perform this action.';
                            break;
                        case 404:
                            errorMessage = error.error?.message || 'The requested resource was not found.';
                            break;
                        case 500:
                            errorMessage = error.error?.message || error.error?.error || 'A server error occurred. Please try again later.';
                            break;
                        case 0:
                            errorMessage = 'Unable to connect to the server. Please check your connection.';
                            break;
                        default:
                            errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
                    }
                }

                // Display error to user only if it's not a suppressed path
                const isAvatar404 = error.status === 404 && req.url.includes('/avatar');
                const isSuppressed = req.headers.has('X-Skip-Error-Toast') || isAvatar404;

                if (!isSuppressed) {
                    this.toastService.error(errorMessage);
                }

                return throwError(() => new Error(errorMessage));
            })
        );
    }
}
