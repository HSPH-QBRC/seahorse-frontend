import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
// import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-metadataCrossComparison',
  templateUrl: './metadataCrossComparison.component.html',
  styleUrls: ['./metadataCrossComparison.component.scss']
})

export class MetadataCrossComparisonComponent implements OnInit {
  metadataId = 'SMTSPAX';
  metadata2Id = '';
  displayScatterPlot = false;
  displayBoxPlot = false;
  displayHeatmap = false;
  currMetadataType = ''


  notIncludeList = ["SUBJID", "AGE", "SEX", "DTHHRDY"]
  metadataArr = []
  isLoading = false;

  //For the Comparison table
  dataSource = [];
  displayedColumns: string[] = ['metadata2', 'test', 'pValue'];

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getListOfMetadata();
    this.getMetadataType(this.metadataId);
    this.getComparisonStats();
    
  }

  getListOfMetadata() {
    let apiUrl = "http://3.143.251.117:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++VARNAME%0D%0Afrom%0D%0A++metadata%0D%0A`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        for (let i = 0; i < res['rows'].length; i++) {
          this.metadataArr.push(res['rows'][i][0])
        }
      })
  }

  getMetadataType(meta) {
    console.log("meta",meta)
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
    this.plotTypeLookUp = {};
    // console.log('current meta: ', name)
    this.metadataId = name;
    this.getMetadataType(this.metadataId);
    this.getComparisonStats();

  }

  getComparisonStats() {
    let apiUrl = "http://3.143.251.117:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++METADATA1%2C%0D%0A++METADATA2%2C%0D%0A++TEST%2C%0D%0A++%5BP-VALUE%5D%0D%0Afrom%0D%0A++m2m%0D%0Awhere%0D%0A++"METADATA1"+%3D+"${this.metadataId}"%0D%0A++AND+"TEST"+is+not+"None"%0D%0A++AND+%5BP-VALUE%5D+is+not+null%0D%0Aorder+by%0D%0A++%5BP-VALUE%5D`
    let annotationUrl = `sql=select%0D%0A++METADATA1%2C%0D%0A++METADATA2%2C%0D%0A++TEST%2C%0D%0A++%5BP-VALUE%5D%0D%0Afrom%0D%0A++m2m%0D%0Awhere%0D%0A++"METADATA1"+%3D+"${this.metadataId}"%0D%0A++AND+"Test"+is+not+"None"%0D%0A++AND+%5BP-VALUE%5D+is+not+"null"%0D%0A++AND+%5BP-VALUE%5D+is+not+"nan"%0D%0Aorder+by%0D%0A++%5BP-VALUE%5D`
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
        console.log("comparison stats res: ", res['rows'])
        for (let i = 0; i < res['rows'].length; i++) {
          let temp = {
            "metadata2": res['rows'][i][1],
            "test": res['rows'][i][2],
            'pValue': res['rows'][i][3]
          }
          this.dataSource.push(temp)
        }
        this.displayComparison()
      })

  }

  plotTypeLookUp = {};

  displayComparison() {
    for (let i = 0; i < this.dataSource.length; i++) {
      let tempMeta2 = this.dataSource[i]['metadata2']
      this.getMetadataType(tempMeta2)
    }

  }

  onSelectMetadata2(name) {
    this.displayScatterPlot = false;
    this.displayBoxPlot = false;
    this.displayHeatmap = false;
    console.log("meta2: ", name, this.plotTypeLookUp)
    if (this.plotTypeLookUp[this.metadataId] === 'integer' || this.plotTypeLookUp[this.metadataId] === 'decimal') {
      if (this.plotTypeLookUp[name] === 'integer, encoded value' || this.plotTypeLookUp[name] === 'string') {
        console.log("num/cat so should use boxplot")
        this.displayBoxPlot = true;
        this.metadata2Id = name;
      }
      else if (this.plotTypeLookUp[name] === 'integer' || this.plotTypeLookUp[name] === 'decimal') {
        console.log("num/num so should use scatter")
        this.displayScatterPlot = true;
        this.metadata2Id = name;
      }
    } else if(this.plotTypeLookUp[this.metadataId] === 'integer, encoded value' || this.plotTypeLookUp[this.metadataId] === 'string'){
      if (this.plotTypeLookUp[name] === 'integer, encoded value' || this.plotTypeLookUp[name] === 'string') {
        console.log("cat/cat so should use heatmap")
        this.displayHeatmap = true;
        this.metadata2Id = name;
      }
      else if (this.plotTypeLookUp[name] === 'integer' || this.plotTypeLookUp[name] === 'decimal') {
        console.log("cat/num so should use boxplot")
        this.displayBoxPlot = true;
        this.metadata2Id = this.metadataId;
        this.metadataId = name;
      }
    }
  }

}
