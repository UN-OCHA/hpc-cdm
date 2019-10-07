import { Component, OnInit } from '@angular/core';
import { OperationService } from 'app/operation/services/operation.service';

@Component({
  selector: 'gve-attachments-icons',
  templateUrl: './gve-attachments-icons.component.html',
  styleUrls: ['./gve-attachments-icons.component.scss']
})
export class GveAttachmentsIconsComponent implements OnInit {

  constructor(private operation: OperationService) {}

  ngOnInit() {
    this.operation.entities$.subscribe(entities => {
      console.log(entities)
    })
  }
}
