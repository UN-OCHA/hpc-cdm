import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'table-selectable-rows',
  templateUrl: './table-selectable-rows.component.html',
  styleUrls: ['./table-selectable-rows.component.scss']
})
export class TableSelectableRowsComponent implements OnInit {
  @Input() dataSource;
  @Input() columns;
  @Input() route: string[];
  columnsToDisplay = [];

  constructor(private router: Router){}

  @ContentChild('rowTemplate', {static: false})
  rowTemplateRef: TemplateRef<any>;

  ngOnInit() {
    this.columnsToDisplay = this.columns.map(c => c.columnDef);
  }

  navigate(element) {
    this.router.navigate([...this.route, element.id]);
  }
}
