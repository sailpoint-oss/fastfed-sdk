import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FastfedService} from '../fastfed.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, ActivationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';


@Component({
    selector: 'app-discovery',
    templateUrl: './discovery.component.html',
    styleUrls: ['./discovery.component.css']
})
export class DiscoveryComponent implements OnInit, OnDestroy {

    public stepperFormGroup: FormGroup;
    public selectedProvider: any;  // DiscoveryResult

    constructor(private fastfedService: FastfedService, private router: Router,
                private _formBuilder: FormBuilder) {

    }

    hasSelectedProvider(): boolean {
        return (this.selectedProvider != null);
    }

    hasDuplicates(): boolean {
        return (this.hasSelectedProvider() &&
            (
                this.selectedProvider.duplicateCheckResults.isProvisioningDuplicate
                || this.selectedProvider.duplicateCheckResults.isAuthenticationDuplicate
            )
        );
    }

    isFastFedPending() {
        return this.hasSelectedProvider() && this.selectedProvider.isWhitelistPending;
    }

    startFastFed() {
        this.fastfedService.consent(this.selectedProvider)
            .subscribe({
                next: () => this.openStartWindow(),
                error: err => console.error(`Error with consent call: ${err.message}`)
            });
    }

    openStartWindow() {
        // this will cause a popup blocked because it isn't in the click handler (at least on chrome).  we are at the
        // mercy of the user's browser settings.
        // window.open(this.selectedProvider.startUrl, "_blank")

        // at a minimum, try to open the window in a click handler
        // https://stackoverflow.com/questions/4907843/open-a-url-in-a-new-tab-and-not-a-new-window
        Object.assign(
            document.createElement('a'),
            {target: '_blank', href: this.selectedProvider.startUrl}
        ).click();
    }

    getDiscoveries(): Observable<any[]> {
        return this.fastfedService.getDiscoveryResultsObservable();
    }

    loadDiscoveryResults() {
        this.fastfedService.loadDiscoveryResults();
    }

    ngOnInit() {

        this.loadDiscoveryResults();

        this.fastfedService.getRemoveWhitelistObservable()
            .pipe(filter(eid => !!eid))
            .subscribe((entityId) => {
                this.loadDiscoveryResults();
            });

        this.stepperFormGroup = this._formBuilder.group({
            providerChooserControl: ['', Validators.required]
        });
    }

    ngOnDestroy() {

    }
}
