import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {AppService} from '../../common/services/app.service';

@Component({
    selector: 'app-sso',
    templateUrl: './sso.component.html',
    styleUrls: ['./sso.component.css']
})
export class SsoComponent implements OnInit, OnDestroy {

    private ssoSettingsSubscription: Subscription;
    private ssoSettingsSubject: BehaviorSubject<any>;

    constructor(private applicationService: AppService) {
        this.ssoSettingsSubject = new BehaviorSubject<any>(null);
    }

    getSsoSettings(): Observable<any> {
        return this.ssoSettingsSubject.asObservable();
    }

    ngOnInit() {

        this.ssoSettingsSubscription = this.applicationService.getSSOSettings()
            .subscribe((ssoSettings) => {
                this.ssoSettingsSubject.next(ssoSettings);
        });
    }

    ngOnDestroy(): void {
        this.ssoSettingsSubscription.unsubscribe();
    }
}
