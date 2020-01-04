import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppService } from '@hpc/core';

@Injectable()
export class BlueprintResolver implements Resolve<any> {
  constructor(private appService: AppService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.appService.loadBlueprint(route.params.id);
  }
}
