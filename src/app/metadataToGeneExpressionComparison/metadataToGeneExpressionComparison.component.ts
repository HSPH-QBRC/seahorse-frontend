import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
// import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-metadataToGeneExpressionComparison',
  templateUrl: './metadataToGeneExpressionComparison.component.html',
  styleUrls: ['./metadataToGeneExpressionComparison.component.scss']
})

export class MetadataToGeneExpressionComparison implements OnInit {
  searchValue = '';
  metadataId = 'SMEXPEFF';
  metadata2Id = '';
  displayScatterPlot = false;
  displayBoxPlot = false;
  displayHeatmap = false;
  currMetadataType = ''
  metadataLookUp = {};


  notIncludeList = ["SUBJID", "AGE", "SAMPID"]
  metadataArr = []
  isLoading = false;

  //For the Comparison table
  dataSource = [];
  displayedColumns: string[] = ['metadata2', 'test', 'test_statistic', 'pValue'];

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getListOfMetadata();
    this.getMetadataType(this.metadataId);
    this.getComparisonStats();

  }

  getListOfMetadata() {
    let apiUrl = "//3.143.251.117:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++VARNAME%0D%0Afrom%0D%0A++metadata%0D%0A`
    let annotationUrl = `sql=select%0D%0A++*%0D%0Afrom%0D%0A++metadata%0D%0A`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        for (let i = 0; i < res['rows'].length; i++) {
          let temp = {
            "varname": res['rows'][i][0],
            "vardesc": res['rows'][i][1].split(":"),
            "vardescFull": res['rows'][i][1],
            "type": res['rows'][i][2],
            "comment": res['rows'][i][3]
          }
          this.metadataArr.push(temp)

          this.metadataLookUp[res['rows'][i][0]] = temp
        }
      })
  }

  getMetadataType(meta) {
    let apiUrl = "http://3.143.251.117:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++VARNAME%2C%0D%0A++TYPE%0D%0Afrom%0D%0A++metadata%0D%0Awhere%0D%0A++VARNAME+%3D+"${meta}"`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        let type2 = res['rows'][0][1];
        this.plotTypeLookUp[meta] = type2;
        this.currMetadataType = this.plotTypeLookUp[this.metadataId]
      })
  }

  changeMetadata(name) {
    d3.select("#my_plotArea")
      .selectAll('div')
      .remove();

    this.plotTypeLookUp = {};
    this.metadataId = name;
    // this.getMetadataType(this.metadataId);
    this.getComparisonStats();
    window.scrollTo(0, 0);

  }

  getComparisonStats() {
    let metadata = "SMEXNCRT"
    let currPage = 0;
    let limit = 10;
    
    let apiUrl = "//3.143.251.117:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++METADATA1%2C%0D%0A++METADATA2%2C%0D%0A++TEST%2C%0D%0A++%5BTEST+STATISTCT%5D%2C%0D%0A++%5BP-VALUE%5D%0D%0Afrom%0D%0A++m2m%0D%0Awhere%0D%0A++"METADATA1"+%3D+"${this.metadataId}"%0D%0A++AND+"Test"+is+not+"None"%0D%0A++AND+%5BP-VALUE%5D+is+not+"null"%0D%0A++AND+%5BP-VALUE%5D+is+not+"nan"%0D%0Aorder+by%0D%0A++%5BP-VALUE%5D`
    let annotationUrl = `sql=select%0D%0A++METADATA%2C%0D%0A++ENSG%2C%0D%0A++TEST%2C%0D%0A++%5BTEST+STATISTIC%5D%2C%0D%0A++%5BP-VALUE%5D%0D%0Afrom%0D%0A++m2g%0D%0Awhere%0D%0A++"METADATA"+%3D+"${metadata}"%0D%0Aorder+by%0D%0A++%5BP-VALUE%5D%0D%0Alimit%0D%0A++${currPage}%2C+${limit}`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.dataSource = [];
        this.isLoading = false;
        for (let i = 0; i < res['rows'].length; i++) {
          let temp = {
            "gene": res['rows'][i][1],
            "test": res['rows'][i][2],
            'test_statistic': res['rows'][i][3],
            'pValue': res['rows'][i][4]
          }
          this.dataSource.push(temp)
        }
        // this.displayComparison()
      })

  }

  plotTypeLookUp = {};

  // displayComparison() {
  //   for (let i = 0; i < this.dataSource.length; i++) {
  //     let tempMeta2 = this.dataSource[i]['gene']
  //     this.getMetadataType(tempMeta2)
  //   }
  // }

  onSelectMetadata2(name) {
    window.scrollTo(0, 600)

    d3.select("#plotArea")
      .selectAll('svg')
      .remove();

    this.displayScatterPlot = false;
    this.displayBoxPlot = false;
    this.displayHeatmap = false;

    if (this.plotTypeLookUp[this.metadataId] === 'integer' || this.plotTypeLookUp[this.metadataId] === 'decimal') {
      if (this.plotTypeLookUp[name] === 'integer, encoded value' || this.plotTypeLookUp[name] === 'string') {
        this.displayBoxPlot = true;
        this.metadata2Id = name;
      }
      else if (this.plotTypeLookUp[name] === 'integer' || this.plotTypeLookUp[name] === 'decimal') {
        this.displayScatterPlot = true;
        this.metadata2Id = name;
      }
    } else if (this.plotTypeLookUp[this.metadataId] === 'integer, encoded value' || this.plotTypeLookUp[this.metadataId] === 'string') {
      if (this.plotTypeLookUp[name] === 'integer, encoded value' || this.plotTypeLookUp[name] === 'string') {
        this.displayHeatmap = true;
        this.metadata2Id = name;
      }
      else if (this.plotTypeLookUp[name] === 'integer' || this.plotTypeLookUp[name] === 'decimal') {
        this.displayBoxPlot = true;
        this.metadata2Id = this.metadataId;
        this.metadataId = name;
      }
    }
  }

}
