import { Component, OnInit } from '@angular/core';

import { ApiService } from 'app/shared/services/api/api.service';
import { ExportService } from 'app/shared/services/export.service';

@Component({
  selector: 'app-plan-list',
  templateUrl: './planList.component.html',
  styleUrls: ['./planList.component.css']
})
export class PlanListComponent implements OnInit {

  public processing = true;
  public plans = [];

  constructor(
    private apiService: ApiService,
    private exportService: ExportService,
  ) {}

  ngOnInit() {
    // TODO: pagination
    this.apiService.getPlans({ids: [636, 637]}).subscribe(plans => {
      this.plans = plans;
      this.plans.forEach(plan => {
        plan.projectCount = 0;
        plan.projectPublishedCount = 0;
        plan.sumCurrReqFunds = 0;
        plan.sumOrigReqFunds = 0;
        plan.sumLatestReqFunds = 0;

        const filterByStatus = 'draft,submitted,approved,hcreviewed,published';
        const groupBy = 'workflowStatus';
        this.apiService.getGroupedProjects({planId: plan.id, groupBy, filterByStatus}).subscribe(
          projectGroups => {
            projectGroups.forEach(projectGroup => {
              plan.sumCurrReqFunds += +projectGroup.sumCurrReqFunds;
              plan.sumOrigReqFunds += +projectGroup.sumOrigReqFunds;
              plan.sumLatestReqFunds += +projectGroup.sumLatestReqFunds;
              plan.projectCount += +projectGroup.projectCount;
              if (projectGroup.workflowStatusName === 'published') {
                plan.projectPublishedCount = +projectGroup.projectCount;
              }
            });
            this.processing = false;
        });
      });
    });
  }

  private exportHandler(exportDataFunction, plan, fromArray, toArray, fileName) {
    const statusOptions = 'submitted,approved,hcreviewed,published';
    plan.loadingExport = true;
    this.apiService[exportDataFunction](plan.id, statusOptions)
      .subscribe(results => {

        plan.loadingExport = false;

        const data = this.exportService.turnArrayOfObjectsIntoArrayOfArrays(
          results,
          fromArray,
          toArray
        );

        this.exportService.exportData([data], fileName);
      })
  }

  public exportSumIndicatorTarget(plan) {
    this.exportHandler(
      'getPlanIndicatorOverview',
      plan,
      [ 'planName',
        'clusterName',
        'planEntity',
        'indicator',
        'target',
        'projectTargetTotalSum',
        'projectCount'
      ],
      [ 'Plan name',
        'Cluster',
        'Cluster [objective/activity]',
        'Cluster indicator',
        'Indicator target',
        'Sum of project values',
        'Number of projects'
      ],
      `${plan.name} - Sum indicators targets.xlsx`
    );
  }

  public exportIndicatorTargetList(plan) {
    this.exportHandler(
      'getPlanIndicatorTargetList',
      plan,
      [ 'planName',
        'clusterName',
        'projectCode',
        'projectName',
        'projectVersion',
        'projectStatus',
        'planEntity',
        'indicator',
        'target',
        'projectTarget',
      ],
      [ 'Plan name',
        'Cluster',
        'Project code',
        'Project title',
        'Project version',
        'Project status',
        'Cluster [Objective/Activity]',
        'Indicator',
        'Indicator target',
        'Project target',
      ],
      `${plan.name} - Project indicator targets list.xlsx`
    );
  }

  public exportCaseloadsOverview(plan) {
    this.exportHandler(
      'getPlanCaseloadsOverview',
      plan,
      [ 'planName',
        'clusterName',
        'target',
        'projectCaseloadTotalSum',
        'projectCount',
      ],
      [ 'Plan name',
        'Cluster',
        'Cluster Caseloads',
        'Sum of Project Totals',
        '# of Projects',
      ],
      `${plan.name} - Sum caseload targets.xlsx`
    );
  }

  public exportCaseloadsDetail(plan) {
    this.exportHandler(
      'getPlanCaseloadsDetail',
      plan,
      [ 'planName',
        'clusterName',
        'projectCode',
        'projectName',
        'target',
        'projectTarget'
      ],
      [ 'Plan name',
        'Cluster',
        'Project Code',
        'Project Name',
        'Cluster Target',
        'Project Target',
      ],
      `${plan.name} - Project caseload targets list.xlsx`
    );
  }
}
