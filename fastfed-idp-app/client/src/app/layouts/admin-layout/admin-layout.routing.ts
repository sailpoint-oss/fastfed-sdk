import {Routes} from '@angular/router';
import {ConsentComponent} from '../../fastfed/consent/consent.component';
import {RelyingPartyListComponent} from '../../fastfed/relying-party-list/relying-party-list.component';

export const AdminLayoutRoutes: Routes = [
    {
        path: 'consent',
        component: ConsentComponent
    }, {
        path: 'relyingParties',
        component: RelyingPartyListComponent
    }
];
