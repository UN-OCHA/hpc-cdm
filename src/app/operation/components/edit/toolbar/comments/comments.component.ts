import { Component, OnInit, Input } from '@angular/core';

import { ApiService } from 'app/shared/services/api/api.service';
import { AuthService } from 'app/shared/services/auth/auth.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  public loading = true;
  public submitting = false;
  public comments = [];
  private blankComment = {
    content: '',
    participantId: null
  };

  public submittingComment = _.cloneDeep(this.blankComment);

  @Input() operationId: number;
  @Input() canAdd: boolean;

  constructor (
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {

    this.load();
    this.authService.participantUpdated$
      .subscribe(() => {
        if (!this.loading) {
          this.load();
        }
      });
  }

  private load () {
    if (this.authService.participant && this.operationId) {
      this.blankComment.participantId = this.authService.participant.id;
      this.api.getCommentsForOperation(this.operationId)
        .subscribe(comments => {
          this.loading = false;
          this.comments = _.sortBy(comments, 'createdAt').reverse();
        });
    }

    this.submittingComment = _.cloneDeep(this.blankComment);
  }

  public submitComment () {
    this.submitting = true;
    this.comments.push(this.submittingComment);

    this.api.setOperationComments(this.operationId, this.comments)
      .subscribe(comments => {
        this.comments = comments;
        this.comments = _.sortBy(comments, 'createdAt').reverse();

        this.submittingComment = _.cloneDeep(this.blankComment);
        this.submitting = false;
      });
  }
}
