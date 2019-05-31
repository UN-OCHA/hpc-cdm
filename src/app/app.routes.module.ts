import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {path: '', loadChildren: './home/home.module'},
  {path: 'forms', loadChildren: './forms/forms.module'},
  {path: 'submissions', loadChildren: './submissions/submissions.module'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutes { }
