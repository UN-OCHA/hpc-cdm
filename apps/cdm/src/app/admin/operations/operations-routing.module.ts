import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OperationPublishComponent } from './operation-publish/operation-publish.component';
import { operationAdminRoute } from '../admin.utils';

const routes: Routes = [
  operationAdminRoute('publish', OperationPublishComponent),
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class OperationsRoutingModule { }
