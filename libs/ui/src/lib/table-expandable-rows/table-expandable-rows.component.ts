import {Component, Input} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'table-expandable-rows',
  templateUrl: 'table-expandable-rows.component.html',
  styleUrls: ['table-expandable-rows.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableExpandableRowsComponent {
  @Input() dataSource: any;
  @Input() columns?: any;
  @Input() renderer?: any;
  @Input() expandedElement?;
  // dataSource = ELEMENT_DATA;
  // columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
  // expandedElement: PeriodicElement | null;
}
