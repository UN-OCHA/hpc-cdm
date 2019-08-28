import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SubscriptionLike as ISubscription } from 'rxjs';

import { QuestionService } from '../../services/question.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-admin-object',
  templateUrl: './adminObject.component.html',
  providers: [QuestionService]
})
export class AdminObjectComponent implements OnInit, OnDestroy {
  private subscription;

  public questions = [];
  public relations = [];
  public objectType;
  public id;
  public object;

  public getObjectSubscription: ISubscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: QuestionService
  ) {
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
      this.objectType = params['object'];
      this.id = params['id'];

      if (this.objectType &&
          this.id &&
          this.id !== NaN) {
        this.getObjectSubscription = this.service.getObjectById(this.objectType, this.id)
          .subscribe((questions: Array<any>) => {
            this.questions = questions.filter(question => {
              return question.controlType !== 'related';
            });

            this.relations = questions.filter(question => {
              return question.controlType === 'related';
            });

          }, err => {
            if (err.status === 404) {
              this.router.navigate(['admin', this.objectType])
            }
          })
      }
    });
  }

  ngOnDestroy() {
    this.getObjectSubscription.unsubscribe();
    this.subscription.unsubscribe();
  }

  afterSubmit (infoAboutNewObject) {
    switch (infoAboutNewObject.eventType) {
      case 'delete':
        this.removeQuestion(infoAboutNewObject);
        break;
      default:
        this.pushQuestion(infoAboutNewObject);
    }
  }

  private removeQuestion (infoAboutNewObject) {
    this.relations.forEach(relationship => {
      if (relationship.key === infoAboutNewObject.key) {
        _.remove(relationship.value, ['id', infoAboutNewObject.data])
      }
    })
  }

  private pushQuestion (infoAboutNewObject) {
    const questionsArray = this.service.transformAPIObjectIntoQuestion(infoAboutNewObject.key, infoAboutNewObject.data)

    this.relations.forEach(relationship => {
      if (relationship.key === infoAboutNewObject.key) {

        relationship.value.unshift({
          id: infoAboutNewObject.data.id,
          nestedQuestions: questionsArray,
          objectType: infoAboutNewObject.key
        });
      }
    })
  }
}
