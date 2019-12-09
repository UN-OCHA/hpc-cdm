import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';


@Component({
  selector: 'table-expandable-rows',
  templateUrl: './table-expandable-rows.component.html',
  styleUrls: ['./table-expandable-rows.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('titleExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class TableExpandableRowsComponent implements OnInit {
  @Input() dataSource?;
  @Input() columns?;
  @Input() title;
  columnsToDisplay = [];
  titleExpanded = false;
  expandedTitle = true;

  @ContentChild('operationTableExpandedRowTemplate', {static: false})
  expandedRowTemplateRef: TemplateRef<any>;

  ngOnInit() {
    this.columnsToDisplay = this.columns.map(c => c.columnDef);
    this.columnsToDisplay.push('actions');
  }

  toggleTitle() {
    this.titleExpanded = !this.titleExpanded;
  }
}
