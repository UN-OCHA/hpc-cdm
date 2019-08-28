import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AuthService } from 'app/shared/services/auth/auth.service';

@Component({
  selector: 'app-map-results',
  templateUrl: './map-results.component.html'
})
export class MapResultsComponent implements OnInit {

  public anyProjectsSelected = false;
  public collapseNotEditable = false;
  public loading = false;

  public isCdmAdmin = false;

  @Input() pagination;
  @Input() cdmResults;
  @Input() query;

  @Input() options;
  @Input() searchOptions;
  @Input() working;
  @Output() onDoSearch = new EventEmitter();

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {

    if (this.authService.participant) {
      const roles = this.authService.participant.roles
      this.isCdmAdmin = roles.find(role => role.name === 'cdmadmin' || role.name === 'hpcadmin');
    }
    this.searchOptions.groupBy = 'none';

  }

  public doSearch() {
    this.onDoSearch.emit();
  }
}
