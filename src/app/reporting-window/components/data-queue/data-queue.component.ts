import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataQueueService } from '../../services/data-queue.service';

@Component({
  selector: 'app-data-queue',
  templateUrl: './data-queue.component.html',
  styleUrls: ['./data-queue.component.scss']
})
export class DataQueueComponent implements OnInit {

  constructor(
    private queue: DataQueueService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.queue.loadDataEntries(params.id);
    });
  }
}
