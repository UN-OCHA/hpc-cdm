import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable,zip as observableZip, of } from 'rxjs';
import {map} from 'rxjs/operators';

import { ApiService } from 'app/shared/services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { CreateOperationService } from 'app/operation/services/create-operation.service';
import { CreateOperationChildComponent } from './../create-operation-child/create-operation-child.component';
import { GveEntryComponent } from './../gve-entry/gve-entry.component';

@Component({
  selector: 'operation-gves',
  templateUrl: './operation-gves.component.html',
  styleUrls: ['./operation-gves.component.scss']
})
export class OperationGvesComponent extends CreateOperationChildComponent implements OnInit {
  public list = [];
  public entityPrototypeId = null;
  public entity = {};
  @ViewChildren(GveEntryComponent) gves:QueryList<GveEntryComponent>;

  constructor(
    public createOperationService: CreateOperationService,
    public apiService: ApiService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute
  ) {
    super(createOperationService, apiService);
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe(params => {
      if(params.entityPrototypeId) {
        this.entityPrototypeId = +params.entityPrototypeId;
        this.entity = this.createOperationService.operation.opEntityPrototypes.filter(eP=> eP.id === this.entityPrototypeId)[0];
        this.list = this.createOperationService.operation.opGoverningEntities.filter(gve => gve.opEntityPrototype.id === this.entityPrototypeId);
      }
    });
  }

  delete(gve:any) {
    if(gve.id) {
      this.apiService.deleteOperationGve(gve.id).subscribe(response => {
        if (response.status === 'ok') {
          let index = this.createOperationService.operation.opGoverningEntities.map(function(o) { return o.id; }).indexOf(gve.id);
          this.createOperationService.operation.opGoverningEntities.splice(index, 1);
          this.refreshList();
          return this.toastr.warning('Governing entity removed.', 'Governing entity removed');
        }
      });
    }
  }

  public refreshList(newGve?:any) {
    if (newGve) {
      this.createOperationService.operation.opGoverningEntities.push(newGve);
    }
    this.list = this.createOperationService.operation.opGoverningEntities.filter(gve => gve.opEntityPrototype.id === this.entityPrototypeId);
  }

  addGve() {
    const EMPTY_GVE = {
      opEntityPrototypeId:this.entityPrototypeId,
      operationId: this.createOperationService.operation.id,
      opGoverningEntityVersion:{
        abbreviation: '', name: '', comments: '', date:'', terms:''
      }
    };
    this.list.push(EMPTY_GVE)
  }

  isLastEntryNew() {
    return this.list[this.list.length - 1].id === null;
  }

  public save (): Observable<any> {
    const isInvalid = this.gves.toArray().filter(att=> att.gveForm.invalid).length;
    if (this.list && this.list.length) {
      const postSaveObservables = [];
      this.list.forEach(governingEntity => {
        postSaveObservables.push(
          this.apiService.saveGoverningEntity(governingEntity));
      });

      return observableZip(
        ...postSaveObservables
      ).pipe(map((results) => {
        if (results.length != this.createOperationService.operation.opGoverningEntities.length) {
          results.forEach((r:any)=> {
            if (!this.createOperationService.operation.opGoverningEntities.filter(newGve => newGve.id === r.id).length) {
              this.createOperationService.operation.opGoverningEntities.push(r);
            }
          })
        }
        this.createOperationService.operation.opGoverningEntities.forEach((gve:any) => {
          const opAttachments = gve.opAttachments || [];
          gve = results.filter((r:any)=>r.id === gve.id)[0];
          gve.opAttachments = opAttachments;
        });
        this.refreshList();
        return {
          stopSave: true
        };
      }));
    } else {
      if (isInvalid) {
        this.toastr.error("Somes entities are not valid, please correct");
      }
      return of({stopSave:true});
    }
  }
}
