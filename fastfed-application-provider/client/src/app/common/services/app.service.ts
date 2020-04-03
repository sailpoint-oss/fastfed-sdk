import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private appListSubject: BehaviorSubject<any[]>;
  private ssoSettingsSubject: BehaviorSubject<any>;

  /**
   * Subscribe to the discovery results
   */
  public getApplications(): Observable<any[]> {
    return this.appListSubject.asObservable();
  }

  public getSSOSettings(): Observable<any> {
    return this.ssoSettingsSubject.asObservable();
  }

  constructor(private httpClient: HttpClient) {
    this.appListSubject = new BehaviorSubject</*DiscoveryResult*/any[]>([]);
    this.ssoSettingsSubject = new BehaviorSubject<any>(null);

    this.load();
  }

  private load() {
    this.httpClient
        .get<any[]>(`${environment.proxyServer}/common/apps`)
        .subscribe((results) => {
          // notify subscribers and give them a copy of the array
          this.appListSubject.next(results);
        });

    this.httpClient
        .get</*DiscoveryResult[]*/any[]>(`${environment.proxyServer}/common/sso`)
        .subscribe((settings) => {
          // notify subscribers and give them a copy of the settings
          this.ssoSettingsSubject.next({...settings});
        });
  }
}


