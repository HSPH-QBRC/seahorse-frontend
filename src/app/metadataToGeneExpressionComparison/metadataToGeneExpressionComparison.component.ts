import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
// import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";


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
  currPage = 0;
  limit = 25;
  tableSize = 0;
  plotTypeLookUp = {};
  geneType = 'integer';
  tableFromSearch = false;
  searchEnsemblResults = [];

  //For the Comparison table
  dataSource = [];
  displayedColumns: string[] = ['metadata2', 'test', 'test_statistic', 'pValue'];
  autoFillData = [];
  geneId = 'ENSG00000227232';

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.searchValue = '';
    this.tableFromSearch = false;
    this.isLoading = true;

    this.getAutoCompleteData();

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
    this.searchValue = '';

    d3.select("#my_plotArea")
      .selectAll('div')
      .remove();

    this.tableFromSearch = false;
    this.plotTypeLookUp = {};
    this.metadataId = name;
    this.getMetadataType(this.metadataId);

    this.getTableSize()
    this.getComparisonStats();
    window.scrollTo(0, 0);

  }

  getTableSize() {
    this.tableSize = 0;
    let table = 'm2g'
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    let annotationUrl = `sql=SELECT%0D%0A++COUNT%28*%29%0D%0AFROM%0D%0A++${table}%0D%0AWHERE%0D%0A++"METADATA"+%3D+"${this.metadataId}"%0D%0A++AND+%5BP-VALUE%5D+is+not+"nan"`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.tableSize = res['rows'][0][0];
      })
  }

  getComparisonStats() {
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++METADATA%2C%0D%0A++ENSG%2C%0D%0A++TEST%2C%0D%0A++%5BTEST+STATISTIC%5D%2C%0D%0A++%5BP-VALUE%5D%0D%0Afrom%0D%0A++m2g%0D%0Awhere%0D%0A++"METADATA"+%3D+"${this.metadataId}"%0D%0A++AND+%5BP-VALUE%5D+is+not+"nan"%0D%0Aorder+by%0D%0A++%5BP-VALUE%5D%0D%0Alimit+${this.limit}+offset+${this.currPage * this.limit}`
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
      })

  }

  displayComparison() {
    for (let i = 0; i < this.dataSource.length; i++) {
      let tempMeta2 = this.dataSource[i]['gene'];
      this.getMetadataType(tempMeta2)
    }
  }

  onSelectMetadata2(name) {
    d3.select("#plotArea")
      .selectAll('svg')
      .remove();

    this.displayScatterPlot = false;
    this.displayBoxPlot = false;
    this.displayHeatmap = false;

    let truncatedName = name.split(".")
    if (this.searchValue.length === 0) {
      window.scrollTo(0, 600)
      this.metadata2Id = truncatedName[0];
      if (this.plotTypeLookUp[this.metadataId] === 'integer, encoded value' || this.plotTypeLookUp[this.metadataId] === 'string') {
        this.displayBoxPlot = true;
      }
      else if (this.plotTypeLookUp[this.metadataId] === 'integer' || this.plotTypeLookUp[this.metadataId] === 'decimal') {
        this.displayScatterPlot = true;
      }
    } else {
      window.scrollTo(0, 0)
      this.getGeneNameFromSymbol(this.searchValue)
      this.getMetadataType(name)
      if (this.plotTypeLookUp[name] === 'integer, encoded value' || this.plotTypeLookUp[name] === 'string') {
        this.displayBoxPlot = true;
        this.metadata2Id = this.metadataId
        this.metadataId = name;
      }
      else if (this.plotTypeLookUp[name] === 'integer' || this.plotTypeLookUp[name] === 'decimal') {
        this.displayScatterPlot = true;
        this.metadataId = truncatedName[0];
      }
    }

  }

  getPageDetails(details) {
    this.currPage = details.pageIndex
    this.limit = details.pageSize
    this.getComparisonStats();
    window.scrollTo(0, 500)
  }

  geneSearch() {

    d3.select("#my_scatterplot")
      .selectAll('svg')
      .remove();

    d3.select("#my_boxplot")
      .selectAll('svg')
      .remove();

    this.tableFromSearch = true
    this.tableSize = 0;

    this.getEnsemblId(this.searchValue)
  }

  getEnsemblId(symbol) {
    this.isLoading = true;
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

        this.isLoading = false;
        for (let i = 0; i < res['rows'].length; i++) {
          if (!this.searchEnsemblResults.includes(res['rows'][i][0])) {
            this.searchEnsemblResults.push(res['rows'][i][0])
          }
        }
        this.geneId = this.searchEnsemblResults[0];
        this.getMetadataToGeneComparisonResults();
      })
  }

  getMetadataToGeneComparisonResults() {
    let ensg = this.searchEnsemblResults[0]
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
        this.dataSource = [];
        this.isLoading = false;
        for (let i = 0; i < res['rows'].length; i++) {
          let varDescName = this.metadataLookUp[res['rows'][i][0]]['vardesc'][0]
          let geneName = res['rows'][i][0];
          this.getMetadataType(geneName)

          let temp = {
            "gene": geneName,
            "test": res['rows'][i][2],
            'test_statistic': res['rows'][i][3],
            'pValue': res['rows'][i][4],
            'vardesc': varDescName
          }
          this.dataSource.push(temp)
        }
      })

  }

  getGeneNameFromSymbol(geneName) {
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++ENSEMBL%2C%0D%0A++SYMBOL%0D%0Afrom%0D%0A++e2s%0D%0Awhere%0D%0A++"SYMBOL"+is+"${geneName}"%0D%0Alimit+10`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.metadata2Id = res['rows'][0][0]
      })
  }


  getAutoCompleteData() {
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++distinct+ENSEMBL%2C%0D%0A++SYMBOL%0D%0Afrom%0D%0A++e2s%0D%0Awhere%0D%0A++ENSEMBL+is+not+""%0D%0Aorder+by%0D%0A++SYMBOL`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.autoFillData = [];
        for (let i = 0; i < res['rows'].length; i++) {
          let temp = `${res['rows'][i][1]} (${res['rows'][i][0]})`
          this.autoFillData.push(temp)
        }
      })
  }

  fromChild(value) {
    let startSym = 0;
    let endSym = value.indexOf(" ");
    let newSymbol = value.slice(startSym, endSym)
    this.searchValue = newSymbol;
    this.geneSearch()
  }

}
