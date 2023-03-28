import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MetadataCrossComparisonComponent } from './metadataCrossComparison/metadataCrossComparison.component';
import { HomepageComponent } from './homepage/homepage.component';
import { GeneExpressionComparisonComponent } from './geneExpressionComparison/geneExpressionComparison.component';
import { MetadataToGeneExpressionComparison } from './metadataToGeneExpressionComparison/metadataToGeneExpressionComparison.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: HomepageComponent
  },
  // {
  //   path: 'metadatacrosscomparison',
  //   component: MetadataCrossComparisonComponent
  // },
  // {
  //   path: 'metadatatogenecomparison',
  //   component: MetadataToGeneExpressionComparison
  // },
  // {
  //   path: 'geneexpressioncomparison',
  //   component: GeneExpressionComparisonComponent
  // },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'dashboard/**',
    redirectTo: '/'
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
