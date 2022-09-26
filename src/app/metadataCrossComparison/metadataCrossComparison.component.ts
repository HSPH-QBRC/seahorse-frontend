import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
// import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";

// interface heatMapData {
//   group: string;
//   variable: string;
//   value: number;
// }

@Component({
  selector: 'app-metadataCrossComparison',
  templateUrl: './metadataCrossComparison.component.html',
  styleUrls: ['./metadataCrossComparison.component.scss']
})

export class MetadataCrossComparisonComponent implements OnInit {
  phenotype = [
    "Age",
    "Sex",
    "Race",
    "Height",
    "Weight",
    "BMI"
  ]

  tissue = [
    "Brain",
    "Liver",
    "Kidney",
    "Colon-Descending",
    "Colon-Transverse"
  ]

  metadataArr = []

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.getData();
  }
  
  getData() {
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
        console.log("from meta: ", res['rows'])
        for(let i=0; i<res['rows'].length; i++){
          // console.log(res['rows'][i][0])
          this.metadataArr.push(res['rows'][i][0])
        }
      })
  }
  
}
