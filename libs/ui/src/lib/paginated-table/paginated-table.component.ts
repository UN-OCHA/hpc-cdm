import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';


@Component({
  selector: 'paginated-table',
  templateUrl: './paginated-table.component.html',
  styleUrls: ['./paginated-table.component.scss'],
})
export class PaginatedTableComponent implements OnInit {
  @Input() dataSource;
  @Input() columns;
  displayedColumns = [];

  ngOnInit() {
    this.displayedColumns = this.columns.map(c => c.columnDef);
  }

}

// <div class="toolbar">
//   <mat-form-field class="search">
//     <mat-icon matPrefix>search</mat-icon>
//     <input #in (input)="data.queryBy({search: in.value})" type="text" matInput placeholder="Search">
//   </mat-form-field>
//   <mat-form-field class="registration">
//     <input (dateChange)="data.queryBy({registration: $event.value})" matInput [matDatepicker]="picker" placeholder="Registration"/>
//     <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
//     <mat-datepicker #picker></mat-datepicker>
//   </mat-form-field>
// </div>
// <table mat-table [dataSource]="data" class="mat-elevation-z1">
//    <ng-container matColumnDef="id">
//     <th mat-header-cell *matHeaderCellDef> No. </th>
//     <td mat-cell *matCellDef="let user"> {{user.id}} </td>
//   </ng-container>
//
//   <ng-container matColumnDef="name">
//     <th mat-header-cell *matHeaderCellDef> Username </th>
//     <td mat-cell *matCellDef="let user"> {{user.username}} </td>
//   </ng-container>
//
//   <ng-container matColumnDef="email">
//     <th mat-header-cell *matHeaderCellDef> Mail </th>
//     <td mat-cell *matCellDef="let user"> {{user.email}} </td>
//   </ng-container>
//
//   <ng-container matColumnDef="registration">
//     <th mat-header-cell *matHeaderCellDef> Registration </th>
//     <td mat-cell *matCellDef="let user"> {{user.registrationDate | date }} </td>
//   </ng-container>
//
//   <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
//   <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
// </table>
// <mat-paginator *ngIf="data.page$ | async as page"
//   [length]="page.totalElements" [pageSize]="page.size"
//   [pageIndex]="page.number" [hidePageSize]="true"
//   (page)="data.fetch($event.pageIndex)">
// </mat-paginator>
