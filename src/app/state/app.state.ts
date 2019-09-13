import { State, Action, StateContext, Selector } from '@ngxs/store';

import {
  GetOperation,
  GetOperationFailed,
  GetOperationAttachments,
  GetOperationAttachmentsFailed,
} from './app.actions';

import {
  App
} from './app.interfaces';

import { ApiService } from '../shared/services/api/api.service';

export const getAppInitialState = (): App => ({
  operation: null,
  operationAttachments: []
});


@State<App>({
  name: 'app',
  defaults: getAppInitialState()
})
export class AppState {
  constructor(private api: ApiService) { }

  @Selector()
  static operation(state: App) {
    return state.operation;
  }

  @Selector()
  static operationAttachments(state: App) {
    return state.operationAttachments;
  }

  @Action(GetOperation)
  async getOperation(ctx: StateContext<App>, action: GetOperation) {
    try {
      return new Promise(resolve => {
        this.api.getOperation(action.payload)
        .subscribe(operation => {
          const state = ctx.getState()
          ctx.setState({...state, operation});
          resolve();
        });
      });
    } catch (error) {
      ctx.dispatch(new GetOperationFailed(error))
    }
  }

  @Action(GetOperationAttachments)
  async getOperationAttachments(ctx: StateContext<App>, action: GetOperationAttachments) {
    try {
      let state = ctx.getState();
      if(!state.operation || state.operation.id !== action.payload) {
        await this.getOperation(ctx, new GetOperation(action.payload));
      }
      state = ctx.getState();//TODO do i need this?
      this.api.getOperationAttachments(state.operation.id)
      .subscribe(op => {
        const operationAttachments = op.operationAttachments;
        ctx.setState({...state, operationAttachments});
      });
    } catch (error) {
      ctx.dispatch(new GetOperationAttachmentsFailed(error))
    }
  }
}
