import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from 'app/shared/services/operation/operation.service';
import { ReportsService } from '../../services/reports.service';
import { AuthService } from 'app/shared/services/auth/auth.service';

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  title: string;
  operationId: number;
  entityPrototypeId: number;
  public isAdmin = false;

  constructor(
    private operation: OperationService,
    private authService: AuthService,
    private reports: ReportsService,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    if (!this.authService.participant) {
      this.authService.fetchParticipant().subscribe(participant => {
        if (participant && participant.roles) {
          this.isAdmin = participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin');
        }
      });
    } else {
      if (this.authService.participant && this.authService.participant.roles) {
        this.isAdmin = this.authService.participant.roles.find((role:any) => role.name === 'rpmadmin' || role.name === 'hpcadmin');
      }
    }

    this.activatedRoute.params.subscribe(params => {
      this.operation.route = 'REPORTS_VIEW';
      this.operationId = params.id;
      this.entityPrototypeId = params.entityPrototypeId;
      if(params.entityPrototypeId) {
        this.operation.loadEntities(params.entityPrototypeId, params.id);
        this.operation.entityPrototypes$.subscribe(response => {
          response.forEach((ep, idx) => {
            if(ep.id == params.entityPrototypeId) {
              this.reports.stepIdx = idx + 1;
              // TODO adjust locale
              this.title = ep.value.name.en.plural;
            }
          })
        });
      } else {
        this.reports.stepIdx = 0;
        this.operation.loadAttachments(params.id);
        this.title = 'Operation Attachments';
      }
    });
    this.operation.selectedEntity$.subscribe(entity => {
      if(entity) {
        this.operation.loadEntityAttachments(entity.id);
      }
    });
  }
}
