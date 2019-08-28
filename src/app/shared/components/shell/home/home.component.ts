import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { SubscriptionLike as ISubscription } from 'rxjs';

import { OAuthService } from 'angular-oauth2-oidc';
import { AuthService } from 'app/shared/services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit, OnDestroy {

  public checkForUserSubscription: ISubscription;

  constructor(
    private oauthService: OAuthService,
    private router: Router,
    public authService: AuthService,
  ) { }

  ngOnInit() {
    if (!this.authService.verifiedUser) {
      this.checkForUserSubscription = this.authService.verifiedUserUpdated$
        .subscribe(user => {
          if (user) {
            if (this.oauthService.state) {
              this.router.navigateByUrl(this.oauthService.state);
            } else {
              this.router.navigate(['/map']);
            }
            this.checkForUserSubscription.unsubscribe();
          }
        });
    } else {
      if (this.oauthService.state) {
        this.router.navigateByUrl(this.oauthService.state);
      } else {
        this.router.navigate(['/map']);
      }
    }
  }

  ngOnDestroy () {
    if (this.checkForUserSubscription) {
      this.checkForUserSubscription.unsubscribe();
    }
  }

  public login() {
    this.oauthService.initImplicitFlow();
  }
}
