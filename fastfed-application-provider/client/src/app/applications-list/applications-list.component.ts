import {Component, OnInit} from '@angular/core';
import {AppService} from '../common/services/app.service';
import {Observable} from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'app-app-list',
    templateUrl: './applications-list.component.html',
    styleUrls: ['./applications-list.component.css']
})
export class ApplicationsListComponent implements OnInit {

    private applications$: Observable<any[]>;

    constructor(private applicationService: AppService) {
    }

    getExpirationString(expiresOn: number) {
        return moment(expiresOn).format();
    }

    ngOnInit() {
        this.applications$ = this.applicationService.getApplications();
    }

}
