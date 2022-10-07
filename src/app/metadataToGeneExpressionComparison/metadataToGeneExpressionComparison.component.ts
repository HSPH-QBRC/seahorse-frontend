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
  metadataId = 'SMEXNCRT'; //for num
  // metadataId = 'SMATSSCR' //for cat
  metadata2Id = '';
  displayScatterPlot = false;
  displayBoxPlot = false;
  displayHeatmap = false;
  currMetadataType = ''
  metadataLookUp = {};


  notIncludeList = ["SUBJID", "AGE", "SAMPID"]
  metadataArr = []
  isLoading = false;
  typeOfLookUp = 'm2g'

  //For the Comparison table
  dataSource = [];
  displayedColumns: string[] = ['metadata2', 'test', 'test_statistic', 'pValue'];

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.tableFromSearch = false;
    this.isLoading = true;
    this.getListOfMetadata();
    this.getTableSize();
    this.getMetadataType(this.metadataId);
    this.getComparisonStats();

  }

  getListOfMetadata() {
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++*%0D%0Afrom%0D%0A++metadata%0D%0A`;
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
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
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

    this.tableFromSearch = false;
    this.plotTypeLookUp = {};
    this.metadataId = name;
    this.getMetadataType(this.metadataId);
    this.getComparisonStats();
    window.scrollTo(0, 0);

  }
  // let metadata = "SMEXNCRT"
  currPage = 0;
  limit = 25;
  tableSize = 0;

  getTableSize() {
    let table = 'm2g'
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    let annotationUrl = `sql=SELECT%0D%0A++COUNT%28*%29%0D%0AFROM%0D%0A++${table}`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        console.log("table size: ", res['rows'][0][0])
        this.tableSize = res['rows'][0][0];
      })
  }

  getComparisonStats() {
    console.log("GC ID: ",this.metadataId)
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++METADATA%2C%0D%0A++ENSG%2C%0D%0A++TEST%2C%0D%0A++%5BTEST+STATISTIC%5D%2C%0D%0A++%5BP-VALUE%5D%0D%0Afrom%0D%0A++m2g%0D%0Awhere%0D%0A++"METADATA"+%3D+"${this.metadataId}"%0D%0Aorder+by%0D%0A++%5BP-VALUE%5D%0D%0Alimit%0D%0A++${this.currPage}%2C+${this.limit}`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        // console.log("res m2g: ", res['rows'], this.metadataId)
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
        console.log("datasource: ", this.dataSource)
        // this.displayComparison()
      })

  }

  plotTypeLookUp = {};
  geneType = 'integer'

  displayComparison() {
    for (let i = 0; i < this.dataSource.length; i++) {
      let tempMeta2 = this.dataSource[i]['gene']
      console.log("temp: ", tempMeta2)
      this.getMetadataType(tempMeta2)
    }
    console.log("metadata types: ", this.getMetadataType)
  }

  onSelectMetadata2(name) {
    let test = name.split(".")
    console.log("name: ", name, test)
    window.scrollTo(0, 600)

    d3.select("#plotArea")
      .selectAll('svg')
      .remove();

    this.displayScatterPlot = false;
    this.displayBoxPlot = false;
    this.displayHeatmap = false;




    //this is where we decide which plot to use if have the data for it. for now, will wait to see.
    if (this.plotTypeLookUp[this.metadataId] === 'integer, encoded value' || this.plotTypeLookUp[this.metadataId] === 'string') {
      this.displayBoxPlot = true;
      this.metadata2Id = test[0];
      console.log("meta1 = cat, meta2/gene = num")
    }
    else if (this.plotTypeLookUp[this.metadataId] === 'integer' || this.plotTypeLookUp[this.metadataId] === 'decimal') {
      this.displayScatterPlot = true;
      this.metadata2Id = test[0];
      console.log("meta1 = num, meta2/gene = num")
    }



  }


  getPageDetails(details, el) {
    console.log("next page:", details)
    this.currPage = details.pageIndex
    this.limit = details.pageSize
    this.getComparisonStats();

    window.scrollTo(0, 500)

  }
  tableFromSearch = false;

  geneSearch() {
    this.tableFromSearch = true
    console.log(this.searchValue)
    this.getEnsemblId(this.searchValue)
  }

  searchEnsemblResults = []
  getEnsemblId(symbol) {
    this.searchEnsemblResults = [];
    let datasetteUrl = `sql=select%0D%0A++ENSEMBL%2C%0D%0A++SYMBOL%2C%0D%0A++ENTREZID%0D%0Afrom%0D%0A++e2s%0D%0Awhere%0D%0A++"SYMBOL"+is+"${symbol}"`;
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";

    let queryURL = `${apiUrl}${datasetteUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        for (let i = 0; i < res['rows'].length; i++) {
          if (!this.searchEnsemblResults.includes(res['rows'][i][0])) {
            this.searchEnsemblResults.push(res['rows'][i][0])
          }
        }
        this.getMetadataToGeneComparisonResults();
      })
  }



  getMetadataToGeneComparisonResults() {
    // for (let i = 0; i < this.searchEnsemblResults.length; i++) {
    let ensg = this.searchEnsemblResults[0]
    // console.log("ensg: ", ensg)
    let datasetteUrl = `sql=select%0D%0A++METADATA%2C%0D%0A++ENSG%2C%0D%0A++TEST%2C%0D%0A++%5BTEST+STATISTIC%5D%2C%0D%0A++%5BP-VALUE%5D%0D%0Afrom%0D%0A++m2g%0D%0Awhere%0D%0A++"ENSG"+like+"${ensg}%25"%0D%0Aorder+by%0D%0A++%5BP-VALUE%5D`;
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";

    let queryURL = `${apiUrl}${datasetteUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        // console.log("NEW res m2gCR: ", res['rows'])
        this.dataSource = [];
        this.isLoading = false;
        for (let i = 0; i < res['rows'].length; i++) {
          let temp = {
            "gene": res['rows'][i][0],
            // "symbol": res['rows'][i][1],
            "test": res['rows'][i][2],
            'test_statistic': res['rows'][i][3],
            'pValue': res['rows'][i][4]
          }
          this.dataSource.push(temp)
        }
      })
    // }

  }

}
