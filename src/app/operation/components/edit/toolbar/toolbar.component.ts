import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Router} from "@angular/router"

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { ApiService } from 'app/shared/services/api/api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input() editable: boolean;
  @Output() loadOperation = new EventEmitter();

  public mode = 'view';
  modalRef: BsModalRef;

  public processing = false;
  public showVersion = false;

  constructor(
    public cPS: CreateOperationService,
    private apiService: ApiService,
    private translate: TranslateService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  public duplicateOperation () {
    this.cPS.processing = 1;
    if (this.confirmAndShouldCancel()) {
      this.cPS.processing = 0;
      return;
    }
    this.apiService.duplicateOperation(this.cPS.operation.id).subscribe(newOperationVersion => {
      this.cPS.processing = 0;
      this.router.navigate(['/operation', newOperationVersion.operationId,'edit']);

    });
  }


  private confirmAndShouldCancel () {
    const confirmed = confirm(this.translate.instant('This operation has been published. To edit it a new version will be created, do you want to proceed?'));

    if (!confirmed) {
      return true;
    }
    return false;
  }
}
