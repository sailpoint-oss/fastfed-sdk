import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FastfedService} from '../fastfed.service';

@Component({
    selector: 'app-relying-party-list',
    templateUrl: './relying-party-list.component.html',
    styleUrls: ['./relying-party-list.component.scss']
})
export class RelyingPartyListComponent implements OnInit {

    public relyingParties$: Observable<any[]>;

    constructor(private fastFedService: FastfedService) {
    }

    ngOnInit() {
      this.relyingParties$ = this.fastFedService.getRelyingPartiesObservable();
    }

}
