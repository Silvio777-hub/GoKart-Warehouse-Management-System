import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * HTTP Interceptor that attaches the JWT token to outgoing requests.
 * Automatically adds the "Authorization: Bearer <token>" header if a token exists in local storage.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    /**
     * Intercepts outgoing HTTP requests and modifies them to include the auth header.
     * @param request The outgoing request
     * @param next The next handler in the interceptor chain
     * @returns An observable of the HTTP event stream
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // 1. Retrieve the stored token from local storage
        const token = localStorage.getItem('token');

        // 2. If a token exists, clone the request and add the Authorization header
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        // 3. Pass the (potentially modified) request to the next handler
        return next.handle(request);
    }
}
