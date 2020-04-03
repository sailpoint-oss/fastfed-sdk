import {Routes} from '@angular/router';

import {DashboardComponent} from '../../dashboard/dashboard.component';
import {SsoComponent} from '../../fastfed/sso/sso.component';
import {ApplicationsListComponent} from '../../applications-list/applications-list.component';
import {DiscoveryComponent} from '../../fastfed/discovery/discovery.component';
import {WhitelistComponent} from '../../fastfed/whitelist/whitelist.component';



export const AdminLayoutRoutes: Routes = [
    {path: 'dashboard', component: DashboardComponent},
    {path: 'sso', component: SsoComponent},
    {path: 'application-list', component: ApplicationsListComponent},
    {path: 'fastfed', component: DiscoveryComponent},
    {path: 'whitelist', component: WhitelistComponent}
];

