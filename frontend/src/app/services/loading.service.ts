import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private safetyTimer: any;
    isLoading$ = this.loadingSubject.asObservable();

    show() {
        this.loadingSubject.next(true);
        // Safety timeout: Never stay dark for more than 10 seconds
        if (this.safetyTimer) clearTimeout(this.safetyTimer);
        this.safetyTimer = setTimeout(() => this.hide(), 10000);
    }

    hide() {
        this.loadingSubject.next(false);
        if (this.safetyTimer) clearTimeout(this.safetyTimer);
    }
}
