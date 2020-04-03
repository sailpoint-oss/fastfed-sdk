import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-start-handler',
    templateUrl: './start-handler.component.html',
    styleUrls: ['./start-handler.component.scss']
})
export class StartHandlerComponent implements OnInit {

    constructor(private httpClient: HttpClient, private route: ActivatedRoute) {
    }

    ngOnInit() {

        // we are starting.  change the url to our initial starting default page (consent)
        this.route
            .queryParamMap
            .subscribe((paramMap: any) => {
                console.log('Subscription handler called for StartHandlerComponent');
                window.location.href = `http://idp:4021?app_metadata_uri=${paramMap.params.app_metadata_uri}`
            });
    }


}
