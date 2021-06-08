import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
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

    public toJSON(xml: string): string {
    	var options = {compact: true, spaces: 4};
        return convert.xml2json(xml, options);
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
