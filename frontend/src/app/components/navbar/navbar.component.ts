import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
    isMenuOpen = false;

    constructor(public api: ApiService, private router: Router) { }

    /** Returns the current user's role string */
    get role() { return this.api.getRole(); }

    /** Checks if a user is currently logged in */
    get isLoggedIn() { return this.api.isLoggedIn(); }

    /**
     * Clears the user session and redirects to the login page.
     */
    logout() {
        this.api.logout();
        this.router.navigate(['/login']);
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
}
