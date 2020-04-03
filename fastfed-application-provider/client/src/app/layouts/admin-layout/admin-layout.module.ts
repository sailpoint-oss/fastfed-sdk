import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AdminLayoutRoutes} from './admin-layout.routing';
import {DashboardComponent} from '../../dashboard/dashboard.component';
import {SsoComponent} from '../../fastfed/sso/sso.component';
import {ApplicationsListComponent} from '../../applications-list/applications-list.component';
import {DiscoveryComponent} from '../../fastfed/discovery/discovery.component';

import {
    MatButtonModule,
    MatInputModule,
    MatRippleModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSelectModule
} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import {MatStepperModule} from '@angular/material/stepper';
import {WhitelistComponent} from '../../fastfed/whitelist/whitelist.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AdminLayoutRoutes),
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        MatStepperModule,
        HttpClientModule
    ],
    declarations: [
        DashboardComponent,
        SsoComponent,
        ApplicationsListComponent,
        DiscoveryComponent,
        WhitelistComponent
    ]
})

export class AdminLayoutModule {
}
