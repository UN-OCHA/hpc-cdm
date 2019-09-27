import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QueueHeaderComponent } from './queue-header/queue-header.component';
import { QueueFiltersComponent } from './queue-filters/queue-filters.component';
import { QueueTableComponent } from './queue-table/queue-table.component';
import { QueueEntryComponent } from './queue-entry/queue-entry.component';
import { QueueEntryVersionsComponent } from './queue-entry-versions/queue-entry-versions.component';
import { DataQueueComponent } from './data-queue.component';

@NgModule({
  declarations: [
    QueueHeaderComponent,
    QueueFiltersComponent,
    QueueTableComponent,
    QueueEntryComponent,
    QueueEntryVersionsComponent,
    DataQueueComponent
  ],
  imports: [
    BrowserModule,
    CommonModule
  ],
  exports: [
    DataQueueComponent
  ]
})
export class DataQueueModule { }
