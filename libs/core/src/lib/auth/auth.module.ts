import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AuthService } from './auth.service';

@NgModule({
  imports: [
    CommonModule,
    OAuthModule.forRoot()
  ],
  providers: [
    AuthService
  ]
})
export class AuthModule {
  // constructor(@Optional() @SkipSelf() core: CoreModule) {
  //   if(core) {
  //     throw new Error('Core should only be injected in AppModule');
  //   }
  // }
}
