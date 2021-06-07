import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {AppService} from '../../common/services/app.service';
import { NgxXml2jsonService } from 'ngx-xml2json';

@Component({
    selector: 'app-sso',
    templateUrl: './sso.component.html',
    styleUrls: ['./sso.component.css']
})
export class SsoComponent implements OnInit, OnDestroy {

    private ssoSettingsSubscription: Subscription;
    private ssoSettingsSubject: BehaviorSubject<any>;
    private parser: DOMParser;

    constructor(private applicationService: AppService) {
        this.ssoSettingsSubject = new BehaviorSubject<any>(null);
        this.parser = new DOMParser();
    }

    getSsoSettings(): Observable<any> {
        return this.ssoSettingsSubject.asObservable();
    }

    public toJSON(xml: string): string {
        const parsedXml = this.parser.parseFromString(xml, 'text/xml');
        return NgxXml2jsonService.xmlToJson(parsedXml);
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
