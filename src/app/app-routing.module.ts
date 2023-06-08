import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TestComponent } from './test/test.component'

const routes: Routes = [
  {
    path: '',
    component: HomepageComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  // {
  //   path: 'test',
  //   component: TestComponent
  // },
  // {
  //   path: 'dashboard/**',
  //   redirectTo: '/'
  // },
  {
    path: '**',
    component: HomepageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
