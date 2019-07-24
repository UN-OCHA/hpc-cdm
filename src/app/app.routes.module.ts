import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {path: '', loadChildren: 'src/app/home/home.module'},
  {path: 'forms', loadChildren: 'src/app/forms/forms.module'},
  {path: 'submissions', loadChildren: 'src/app/submissions/submissions.module'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutes { }
