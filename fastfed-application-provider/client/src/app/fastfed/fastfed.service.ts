import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

// import {DiscoveryResult} from 'fastfed-node-sdk';

@Injectable({
    providedIn: 'root'
})
export class FastfedService {

    private discoveryResultsSubject: BehaviorSubject<any[]>; // BehaviorSubject<DiscoveryResult[]>;
    private removeWhitelistSubject: BehaviorSubject<any>;

    constructor(private httpClient: HttpClient) {
        this.discoveryResultsSubject = new BehaviorSubject</*DiscoveryResult*/any[]>([]);
        this.removeWhitelistSubject = new BehaviorSubject<number>(null);

        this.loadDiscoveryResults();
    }

    /**
     * Subscribe to the discovery results
     */
    public getDiscoveryResultsObservable(): Observable<any[]> /*Observable<DiscoveryResult[]>*/ {
        return this.discoveryResultsSubject.asObservable();
    }

    /**
     * Subscribe to the whitelist removal
     */
    public getRemoveWhitelistObservable(): Observable<number> {
        return this.removeWhitelistSubject.asObservable();
    }

    public getWhitelistedProvidersObservable(): Observable<any[]> {
        return this.httpClient
            .get</*WhitelistRecord[]*/any[]>(`${environment.proxyServer}/fastfed/whitelist`);
    }

    public removeWhitelistedProvider(entityId: string) {
        this.httpClient
            .delete(`${environment.proxyServer}/fastfed/whitelist/${entityId}`)
            .subscribe(() => {
                this.removeWhitelistSubject.next(entityId);
            })
    }

    /**
     * Consent/confirm that all requirements have been met and agreed to
     * @param discoveryResult
     */
    public consent(discoveryResult: /*DiscoveryResult*/object): Observable<any> {
        return this.httpClient
            .post<any>(`${environment.proxyServer}/common/consent`, discoveryResult,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/plain'
                    }
                });
    }

    public loadDiscoveryResults() {
        this.httpClient
            .get</*DiscoveryResult[]*/any[]>(`${environment.proxyServer}/fastfed/discovery/WEBFINGER?account=acct:idp@example.com`)
            .subscribe((results) => {

                // notify subscribers and give them a copy of the array
                this.discoveryResultsSubject.next([...results]);
            });
    }
}
