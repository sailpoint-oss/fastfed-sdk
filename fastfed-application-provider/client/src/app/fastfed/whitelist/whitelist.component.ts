import {Component, OnDestroy, OnInit} from '@angular/core';
import {FastfedService} from '../fastfed.service';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import * as moment from 'moment';
import {filter} from 'rxjs/operators';

@Component({
    selector: 'app-whitelist',
    templateUrl: './whitelist.component.html',
    styleUrls: ['./whitelist.component.scss']
})
export class WhitelistComponent implements OnInit, OnDestroy {

    private whitelistedProvidersRefresh$: BehaviorSubject<any[]>;

    constructor(private fastfedService: FastfedService) {
        this.whitelistedProvidersRefresh$ = new BehaviorSubject(undefined);
    }

    getProviders(): Observable<any[]> {
        return this.whitelistedProvidersRefresh$.asObservable();
    }

    removeWhitelistProvider(entityId: string) {
        this.fastfedService.removeWhitelistedProvider(entityId);
    }

    getExpirationString(expiresOn: number) {
        return moment(expiresOn).format();
    }

    private getWhitelistProviders() {
        this.fastfedService.getWhitelistedProvidersObservable()
            .subscribe((providers) => {
                let newProviders = providers;
                if (providers && providers.length === 0) {
                    newProviders = null;
                }
                this.whitelistedProvidersRefresh$.next(newProviders);
            });
    }

    ngOnInit() {

        this.fastfedService.getRemoveWhitelistObservable()
            .pipe(filter(eid => !!eid))
            .subscribe(() => {
                this.getWhitelistProviders();
            });

        this.getWhitelistProviders();
    }

    ngOnDestroy(): void {
    }
}

