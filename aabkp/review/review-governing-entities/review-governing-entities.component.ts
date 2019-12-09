import { Component, TemplateRef } from '@angular/core';
import { ReviewSectionComponent } from './../review-section/review-section.component';
import { OperationService } from '@cdm/core';


@Component({
  selector: 'app-review-governing-entities',
  templateUrl: './review-governing-entities.component.html',
  styleUrls: ['./review-governing-entities.component.scss']
})
export class ReviewGoverningEntitiesComponent extends ReviewSectionComponent {

  public objectKeys = Object.keys;
  public reviewHasAttachments = false;
  public reviewHasGE = false;
  public reviewHasCaseloads = false;
  public disagAttachment = {};
  // modalRef: BsModalRef;
  modalRef;

  constructor(
    // private modalService: BsModalService,
    public operationService: OperationService
  ) {
  }
  public buildView () {
    // const operation = this.operation;
    // let planEntities = [];
    // if ('planEntities' in operation && Array.isArray(operation.planEntities)) {
    //   planEntities = operation.planEntities.map(pE => pE.id);
    // }
    //
    // operation.plans.forEach(plan => {
    //   if (plan.governingEntities && plan.governingEntities.length) {
    //     plan.governingEntities.forEach(gE => {
    //       if (gE.selected) {
    //         if (gE.caseloads && gE.caseloads.length) {
    //           this.reviewHasCaseloads = true;
    //         }
    //         this.reviewHasGE = true;
    //         for (const childPlanEntityType in gE.childPlanEntities) {
    //           if (gE.childPlanEntities.hasOwnProperty(childPlanEntityType)) {
    //             const selectedEntities = gE.childPlanEntities[childPlanEntityType].filter(cPE => {
    //               // Only show childPlanEntities that are selected or have selected attachments
    //               const foundSelectedAttachment = cPE.attachments.find(attachment => attachment.selected);
    //               if (foundSelectedAttachment) {
    //                 this.reviewHasAttachments = true;
    //               }
    //               const isSelected = planEntities.indexOf(cPE.id) !== -1;
    //               return foundSelectedAttachment || isSelected;
    //             });
    //
    //             if (selectedEntities.length) {
    //               gE.childPlanEntities[childPlanEntityType] = selectedEntities;
    //             } else {
    //               delete gE.childPlanEntities[childPlanEntityType];
    //             }
    //           }
    //         }
    //       }
    //     });
    //   }
    // });
  }

  public openModal(template: TemplateRef<any>, attachment) {
    // this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
    // this.disagAttachment = attachment;
  }
}
