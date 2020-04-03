import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {catchError} from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class FastfedService {

    private idpConfirmationResultSubject: BehaviorSubject<any>; // BehaviorSubject<IdpConfirmationResult[]>;
    private relyingPartiesSubject: BehaviorSubject<any[]>; // BehaviorSubject<IdpConfirmationResult[]>;
    private entityId: string;

    constructor(private httpClient: HttpClient) {
        this.idpConfirmationResultSubject = new BehaviorSubject</*IdpConfirmationResult*/any>(null);
        this.relyingPartiesSubject = new BehaviorSubject<any[]>(null);
        this.loadConfirmations();
    }

    getEntityId(): string {
        return this.entityId;
    }

    setEntityId(value: string) {
        if (this.entityId !== value) {
            this.entityId = value;
            this.loadConfirmations();
        }
    }

    /**
     * Subscribe to the discovery results
     */
    public getIdpConfirmationResults(): Observable<any> /*Observable<IdpConfirmationResult[]>*/ {
        return this.idpConfirmationResultSubject.asObservable();
    }

    /**
     * Consent/confirm that all requirements have been met and agreed to
     * @param idpConfirmationResult
     */
    public confirm(idpConfirmationResult: /*IdpConfirmationResult*/object): Observable<any> {
        return this.httpClient
            .post<any>(`${environment.proxyServer}/fastfed/continue`, idpConfirmationResult,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/plain'
                    }
                })
            .pipe(
                catchError(this.errorHandler)
            );
    }

    public getRelyingPartiesObservable() {
        this.getRelyingParties();
        return this.relyingPartiesSubject.asObservable();
    }

    private getRelyingParties() {
        return this.httpClient
            .get<any>(`${environment.proxyServer}/fastfed/relyingParties`)
            .pipe(
                catchError(this.errorHandler)
            ).subscribe(results => this.relyingPartiesSubject.next(results));
    }

    private errorHandler(error: HttpErrorResponse) {
        return of(`There was an error: {error.error}`);
    }

    private loadConfirmations() {

        this.httpClient
            .get<any[]>(`${environment.proxyServer}/fastfed/confirmations`)
            .subscribe((result) => {
                // notify subscribers and give them a copy of the array
                this.idpConfirmationResultSubject.next(result);
            });
    }
}
