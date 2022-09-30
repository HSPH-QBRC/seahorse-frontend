import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MetadataCrossComparisonComponent } from './metadataCrossComparison/metadataCrossComparison.component';
import { HomepageComponent} from './homepage/homepage.component';

const routes: Routes = [
  {
    path: '',
    component: HomepageComponent
  },
  {
    path: 'metadatacrosscomparison',
    component: MetadataCrossComparisonComponent
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
