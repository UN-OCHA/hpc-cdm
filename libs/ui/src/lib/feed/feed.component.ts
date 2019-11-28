import { Component } from '@angular/core';
import { ApiService } from '@hpc/core';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent {
  mode: string = 'determinate';

  // api = { inProgress: false, isUp: true };
  constructor(private api: ApiService) {
  }
}

// <div class="marker">
//   <span class="fa-stack fa-lg">
//     <i *ngIf="api.inProgress" class="fa fa-spinner fa-pulse fa-stack-1x"></i>
//     <i *ngIf="!api.inProgress" class="fa fa-feed fa-stack-1x"></i>
//     <i *ngIf="!api.isUp" class="dim fa fa-ban fa-stack-2x"></i>
//   </span>
// </div>
//
