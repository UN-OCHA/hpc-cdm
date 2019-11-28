import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginComponent } from './login.component';
import { LogoutComponent } from './logout.component';
import { AuthModule } from '@hpc/core';
import { MatIconModule, MatMenuModule, MatButtonModule } from '@angular/material';

@NgModule({
  declarations: [
    LoginComponent,
    LogoutComponent
  ],
  imports: [
    CommonModule,
    AuthModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  exports: [
    LoginComponent,
    LogoutComponent
  ]
})
export class LoginLinkModule {

  static forRoot() {
    return {
      ngModule: LoginLinkModule,
      providers: [ /* YOUR SERVICES HERE */ ]
    }
  }
}
