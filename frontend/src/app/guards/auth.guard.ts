import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../services/api.service';

/**
 * Route guard that prevents unauthorized access to protected pages.
 * Ensures that only logged-in users can navigate to the application dashboard.
 */
export const authGuard: CanActivateFn = () => {
    const api = inject(ApiService);
    const router = inject(Router);

    // 1. Check the ApiService to see if a valid token exists
    if (api.isLoggedIn()) {
        return true;
    } else {
        // 2. If not logged in, redirect the user back to the login page
        router.navigate(['/login']);
        return false;
    }
};
