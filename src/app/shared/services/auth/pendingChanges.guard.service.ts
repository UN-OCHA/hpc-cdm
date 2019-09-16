import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {
  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    if (component === null) {
      return true;
    }
    // if there are no pending changes, just allow deactivation; else confirm first
    return component.canDeactivate && !component.canDeactivate() ?
      // NOTE: this warning message will only be shown when navigating elsewhere within your angular app;
      // when navigating away from your angular app, the browser will show a generic warning message
      // see http://stackoverflow.com/a/42207299/7307355
      confirm('You have unsaved changes which will be lost if you leave this screen. ' +
              'Click OK to navigate away or Cancel to go back and save your data first.')
      : true;
  }
}
