import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'dashboard', class: '' },
    { path: '/sso', title: 'Single Sign-On',  icon: 'fingerprint', class: '' },
    { path: '/application-list', title: 'SCIM Clients',  icon: 'apps', class: '' },
    { path: '/fastfed', title: 'Configuration',  icon: 'settings', class: '' },
    { path: '/whitelist', title: 'Pending Handshakes',  icon: 'hourglass_empty', class: '' }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
