import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';

@Injectable()
export class PromptUpdateService {

  constructor(
    public updates: SwUpdate,
    private toastr: ToastrService,
  ) {

    if (updates.isEnabled) {
      setInterval(() => { updates.checkForUpdate() }, 6 * 60 * 60);
    }
  }

  // Called from app.components.ts constructor
  public checkForUpdates() {
    if (this.updates.isEnabled) {
      this.updates.available.subscribe(event => {
        console.log('current version is', event.current);
        console.log('available version is', event.available);
        this.promptUser(event);
      });
      this.updates.activated.subscribe(event => {
        console.log('old version was', event.previous);
        console.log('new version is', event.current);
      });
    }
  }

  // If there is an update, promt the user
  private promptUser(e): void {
    if (e.available) {
      this.toastr.info('NOTICE: A new version of the HPC Projects Module has just been released, please click on OK to refresh your browser window to ensure that you are using the most up to date version'
        , 'New version released',
        {timeOut: 10000, closeButton: true})
        .onTap
        .pipe(take(1))
        .subscribe(() => this.toasterClickedHandler());
    }
  }

  private toasterClickedHandler() {
    document.location.reload()
  }

}
