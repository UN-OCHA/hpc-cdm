import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthService } from 'app/shared/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {

  constructor(
    private oauthService: OAuthService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    if (this.oauthService.hasValidAccessToken()) {
      this.authService.verifyUserProfile();
    }
  }

  public login() {
    this.oauthService.initImplicitFlow();
  }

  public logoff() {
    this.oauthService.logOut();
    window.location.href = this.oauthService.logoutUrl;
  }

  get access_token() {
    return this.oauthService.getAccessToken();
  }
}
