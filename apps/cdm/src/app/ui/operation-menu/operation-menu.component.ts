import { Component } from '@angular/core';
import { AuthService, AppService } from '@hpc/core';
import { Operation, User } from '@hpc/data';

@Component({
  selector: 'operation-menu',
  templateUrl: './operation-menu.component.html',
  styleUrls: ['./operation-menu.component.scss']
})
export class OperationMenuComponent {
  readonly user$ = this.authService.user$;
  readonly operation$ = this.appService.operation$;
  readonly entityPrototypes$ = this.appService.entityPrototypes$;

  constructor(
    private authService: AuthService,
    private appService: AppService) {}
}
