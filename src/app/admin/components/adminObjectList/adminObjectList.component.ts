
import {combineLatest as observableCombineLatest } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-admin-object-list',
  templateUrl: './adminObjectList.component.html',
  providers: [QuestionService]
})
export class AdminObjectListComponent implements OnInit {

  public objectType;
  public objects;
  public relationships;
  public newObjectForm;

  public currentPage;
  public limit = 50;

  constructor(
    private route: ActivatedRoute,
    private service: QuestionService
  ) {}

  ngOnInit() {
    observableCombineLatest(
      this.route.params,
      this.route.queryParams,
      (params, queryParams) => ({ params, queryParams }))
    .subscribe(ap => {
      this.objectType = ap.params['object'];
      this.currentPage = ap.queryParams['page'] ? +ap.queryParams['page'] : 0;

      if (this.objectType) {
        const params = {
          offset: this.currentPage * this.limit,
          limit: this.limit
        };
        if (this.objectType === 'planProcedure') {
          params['order'] = 'planId DESC';
          params['scopes'] = 'plan';
        }
        this.service.getObjectList(this.objectType, {params})
          .subscribe(objects => {

            this.objects = objects;

            if (objects.length > 0) {
              if (this.objectType !== 'planProcedure') {
                this.relationships = Object.keys(objects[0]).filter((key => {
                  return key.toLowerCase().indexOf('id') !== -1 && key !== 'id';
                }));
              }
            }
          });
      }
    });
  }
}
