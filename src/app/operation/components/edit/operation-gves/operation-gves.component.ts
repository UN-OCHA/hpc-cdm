import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from 'app/operation/services/operation.service';

@Component({
  selector: 'operation-gves',
  templateUrl: './operation-gves.component.html',
  styleUrls: ['./operation-gves.component.scss']
})
export class OperationGvesComponent implements OnInit {

  constructor(
    private operation: OperationService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.operation.getEntities(params.entityPrototypeId, params.id);
    });
  }

  save () {
    // console.log(this.)
    // const isInvalid = this.gves.toArray().filter(att=> att.gveForm.invalid).length;
    // if (this.list && this.list.length) {
    //   const postSaveObservables = [];
    //   this.list.forEach(governingEntity => {
    //     postSaveObservables.push(
    //       this.apiService.saveGoverningEntity(governingEntity));
    //   });
    //
    //   return observableZip(
    //     ...postSaveObservables
    //   ).pipe(map((results) => {
    //     if (results.length != this.createOperationService.operation.opGoverningEntities.length) {
    //       results.forEach((r:any)=> {
    //         if (!this.createOperationService.operation.opGoverningEntities.filter(newGve => newGve.id === r.id).length) {
    //           this.createOperationService.operation.opGoverningEntities.push(r);
    //         }
    //       })
    //     }
    //     this.createOperationService.operation.opGoverningEntities.forEach((gve:any) => {
    //       const opAttachments = gve.opAttachments || [];
    //       gve = results.filter((r:any)=>r.id === gve.id)[0];
    //       gve.opAttachments = opAttachments;
    //     });
    //     this.refreshList();
    //     return {
    //       stopSave: true
    //     };
    //   }));
    // } else {
    //   if (isInvalid) {
    //     this.toastr.error("Somes entities are not valid, please correct");
    //   }
    //   return of({stopSave:true});
    // }
    return null;
  }
}
