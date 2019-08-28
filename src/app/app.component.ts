import { Component, ViewContainerRef, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import { SubscriptionLike as ISubscription } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

import { OAuthService } from 'angular-oauth2-oidc';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { JwksValidationHandler } from 'angular-oauth2-oidc';

import { environment } from '../environments/environment';
import { authConfig } from './auth.config';
import { PromptUpdateService } from './shared/services/prompt-update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnDestroy {

  public routeSubscription: ISubscription
  public sessionTerminationSubscription: ISubscription;
  public sessionTokenReceivedSubscription: ISubscription;

  constructor(private oauthService: OAuthService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              public vcr: ViewContainerRef,
              private titleService: Title,
              private promptUpdateService: PromptUpdateService,
              translate: TranslateService) {

    translate.setDefaultLang('en');
    translate.use(translate.getBrowserLang() || 'en');
    this.promptUpdateService.checkForUpdates();

    this.configureOauth();
    this.routeSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .pipe(map(() => this.activatedRoute))
      .pipe(map((route) => {
        while (route.firstChild) { route = route.firstChild };
        return route;
      }))
      .pipe(filter((route) => route.outlet === 'primary'))
      .pipe(mergeMap((route) => {
        return route.data
      }))
      .subscribe((event) => {
        this.titleService.setTitle(`HPC - ${environment.title}: ${event['title']}`)
      });
  }

  ngOnDestroy () {
    this.routeSubscription.unsubscribe();
    this.sessionTerminationSubscription.unsubscribe();
    this.sessionTokenReceivedSubscription.unsubscribe();
  }

  private configureOauth() {

    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.setStorage(localStorage);
    this.oauthService.tryLogin({});

    // Optional
    // this.oauthService.setupAutomaticSilentRefresh();

    this.oauthService.events.pipe(filter(e => e.type === 'session_terminated')).subscribe(e => {
      console.log(e, 'Your session has been terminated!');
    });

    this.oauthService.events.pipe(filter(e => e.type === 'token_received')).subscribe(e => {
      console.log(e, 'Load profile');
      this.oauthService.loadUserProfile();
    });

  }
}
