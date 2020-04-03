import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {FastfedService} from '../fastfed.service';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';


@Component({
    selector: 'app-confirmation',
    templateUrl: './consent.component.html',
    styleUrls: ['./consent.component.css']
})

export class ConsentComponent implements OnInit, OnDestroy {

    public stepperFormGroup: FormGroup;
    public confirmationResults: any;  // IdpConfirmationResult
    private subscription: Subscription;
    private entityId: string;
    private isCompleted: boolean;
    private errorMsg: string;
    private isError: boolean;

    constructor(private fastfedService: FastfedService, private activatedRoute: ActivatedRoute, private router: Router) {
        this.isError = false;
        this.isCompleted = false;
    }

    hasConfirmationResults(): boolean {
        return (this.confirmationResults != null);
    }

    hasDuplicates(): boolean {
        return (this.hasConfirmationResults() &&
            (
                this.confirmationResults.duplicateCheckResults.isProvisioningDuplicate
                || this.confirmationResults.duplicateCheckResults.isAuthenticationDuplicate
            )
        );
    }

    continueFastFed() {
        this.fastfedService.confirm(this.confirmationResults)
            .subscribe(
                // TODO:  success route instead of page
                result => {
                    this.isCompleted = true;
                },
                err => {
                    console.error(`Error with consent call: ${err}`);
                    this.isCompleted = true;
                    this.isError = true;
                    this.errorMsg = err;
                });
    }

    ngOnInit() {

        // Not used right now
        this.activatedRoute.queryParams
            .filter(params => params.eid)
            .subscribe(params => {
                this.entityId = params.eid;
                this.fastfedService.setEntityId(this.entityId);
            });
        ///////////////////////////////////////////////////////////////////

        this.stepperFormGroup = new FormGroup({
            duplicate: new FormControl()
        });

        this.subscription = this.fastfedService.getIdpConfirmationResults()
            .subscribe(r => this.confirmationResults = r);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
