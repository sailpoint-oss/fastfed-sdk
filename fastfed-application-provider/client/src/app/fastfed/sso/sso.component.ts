import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {AppService} from '../../common/services/app.service';
var convert = require('xml-js');

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

    public getAuthEndpointMetadata(): Observable<object> {
    	let options = {compact: true, spaces: 4};
    	let ssoSettings = this.ssoSettingsSubject.getValue();

    	let json = null;
    	if (ssoSettings.authEndpointResponseBody) {
            json = convert.xml2json(ssoSettings.authEndpointResponseBody, options);
        }

    	return of(json);
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
