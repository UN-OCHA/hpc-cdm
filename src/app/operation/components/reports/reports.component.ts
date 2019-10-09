import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationService } from '../../services/operation.service';
import { ReportsService } from '../../services/reports.service';
import { AuthService } from 'app/shared/services/auth/auth.service';

const TITLES = [
  'Operation Attachments',
  'HCT/ICCGs Attachments'
];

const ROUTES_STEPS = {
  '/reports': 0,
  '/entityreports': 1
};

const findStep = (url) => {
  const route = Object.keys(ROUTES_STEPS).filter(k => url.endsWith(k));
  return ROUTES_STEPS[route[0]];
};

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  title: string;
  public isAdmin = false;

  constructor(
    private operation: OperationService,
    private reports: ReportsService,
    private authService: AuthService,
    private router: Router,
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
    const stepIdx = findStep(this.router.url);
    this.title = TITLES[stepIdx];
    this.reports.stepIdx = stepIdx;
    this.activatedRoute.params.subscribe(params => {
      switch(stepIdx) {
        case 0:
          this.operation.getAttachments(params.id);
          return;
        case 1:
          this.operation.getEntities(params.id);
          return;
      }
    });
  }
}
