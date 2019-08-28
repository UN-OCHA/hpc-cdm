import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

// import { ReportsService } from 'app/shared/services/reports.service';

@Component({
  selector: 'app-filter-report-dropdown-toggle',
  templateUrl: './filterReportDropdownToggle.component.html',
  styleUrls: ['./filterReportDropdownToggle.component.scss']
})

export class FilterReportDropdownToggleComponent implements OnInit {
  public filterSelectedArray;

  @Input() filterBy = [];
  @Input() dropdownTitle = [];
  @Output() update = new EventEmitter();
  @Input() triggerUpdate?: Observable<any>;

  constructor() {}

  ngOnInit () {
    this.refilter()

    if (this.triggerUpdate) {
      this.triggerUpdate
        .subscribe(() => this.refilter())
    }
  }

  private refilter () {
    this.filterSelectedArray = this.filterBy.filter(filter => filter.selected).map(filter => filter.key || filter.name)
  }

  public updateToggle () {
    this.refilter();
    this.update.emit(this.filterBy.filter(filter => filter.selected));
  }

  public updateSelected (filterObject) {
    filterObject.selected = !filterObject.selected;
    this.updateToggle();
  }
}
