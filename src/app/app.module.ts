import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MetadataCrossComparisonComponent } from './metadataCrossComparison/metadataCrossComparison.component';
import { GeneExpressionComparisonComponent } from './geneExpressionComparison/geneExpressionComparison.component';
import { MetadataToGeneExpressionComparison } from './metadataToGeneExpressionComparison/metadataToGeneExpressionComparison.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { BoxPlotComponent } from './boxplot/boxplot.component';
import { ScatterPlotComponent } from './scatterplot/scatterplot.component';
import { BarChartComponent } from './barchart/barchart.component';
import { HistogramComponent } from './histogram/histogram.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { LegendComponent } from './legend/legend.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HomepageComponent } from './homepage/homepage.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProgressSpinnerComponent } from './progress-spinner/progress-spinner.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AutocompleteInputComponent } from './autocomplete-input/autocomplete-input.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ImageModalComponent } from "./image-modal/image-modal.component";
import { MatDialogModule } from '@angular/material/dialog';
import { PathwaysComponent } from './gsea-dialog/gsea.component';
import { RugPlotComponent } from './rug-plot/rug-plot.component';
import { TableComponent } from './table/table.component'


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    MetadataCrossComparisonComponent,
    HeatmapComponent,
    BoxPlotComponent,
    ScatterPlotComponent,
    BarChartComponent,
    HistogramComponent,
    LegendComponent,
    HomepageComponent,
    ProgressSpinnerComponent,
    GeneExpressionComparisonComponent,
    MetadataToGeneExpressionComparison,
    DashboardComponent,
    AutocompleteInputComponent,
    ImageModalComponent,
    PathwaysComponent,
    RugPlotComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
