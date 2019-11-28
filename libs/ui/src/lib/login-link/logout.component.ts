import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-logout',
  template: '<p>logout works!</p>'
})
export class LogoutComponent implements OnInit {

  constructor(private oauthService: OAuthService) { }

  ngOnInit() {
    this.oauthService.logOut();
    window.location.href = this.oauthService.logoutUrl;
  }
}
