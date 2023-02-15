import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
// import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
// @ts-ignore
import tissuesJson from './tissueList.json';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  searchValue = '';
  metadataId = 'P2RX1';
  geneId = 'ENSG00000188976';
  symbolId = 'P2RX1';
  symbolId2 = '';
  displayScatterPlot = false;
  displayBoxPlot = false;
  displayHeatmap = false;
  currMetadataType = ''
  metadataLookUp = {};


  notIncludeList = ["SUBJID", "AGE", "SAMPID"]
  isLoading = false;
  typeOfLookUp = 'g2g'
  currPage = 0;
  limit = 10;
  tableSize = 0;
  plotTypeLookUp = {};
  geneType = 'integer';
  tableFromSearch = false;
  searchEnsemblResults = [];

  //For the Comparison table
  dataSource = [];
  displayedColumns: string[] = ['symbol', 'correlation', 'entrezid'];

  tissue = 'Bladder';
  tissueList = [];
  selectedTissue = 'Bladder';
  autoFillData = [];

  PhenotypeArr = ["Sex", "Age", "Smoking History", "Etc"]
  LibraryMetadataArr = ["RIN", "Source"]

  displayedColumns1: string[] = ['metadata2', 'test', 'testStat', 'pVal'];
  testData = [
    { metadata2: "Intronic Rate", test: "ANOVA", testStat: "51.9725741752891", pVal: "0" },
    { metadata2: "Tissue Type, area from which the tissue sample was taken. This is a parent value to SMTSD.", test: "ANOVA", testStat: "101.9725741752891", pVal: "0" },
    { metadata2: "Fragment Length StdDev", test: "ANOVA", testStat: "61.9725741752891", pVal: "0" },
    { metadata2: "Code for BSS collection site", test: "ANOVA", testStat: "81.9725741752891", pVal: "0" },
    { metadata2: "End 2 Sense", test: "ANOVA", testStat: "121.9725741752891", pVal: "0" },
    { metadata2: "Intronic Rate", test: "ANOVA", testStat: "51.9725741752891", pVal: "0" },
    { metadata2: "Tissue Type, area from which the tissue sample was taken. This is a parent value to SMTSD.", test: "ANOVA", testStat: "101.9725741752891", pVal: "0" },
    { metadata2: "Fragment Length StdDev", test: "ANOVA", testStat: "61.9725741752891", pVal: "0" },
    { metadata2: "Code for BSS collection site", test: "ANOVA", testStat: "81.9725741752891", pVal: "0" },
    { metadata2: "End 2 Sense", test: "ANOVA", testStat: "121.9725741752891", pVal: "0" }
  ]

  showPhenotype = false;
  showLibraryMetadata = false;
  showGene = true;

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.tissueList = tissuesJson;
    this.searchValue = '';
    this.tableFromSearch = false;
    this.isLoading = true;

    this.getAutoCompleteData();

    // this.getTableSize();
    this.getComparisonStats();
  }

  // getTableSize() {
    // this.tableSize = 0;
    // let table = 'g2g'
    // let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++COUNT+%28distinct+g2g.GeneB%29%0D%0Afrom%0D%0A++g2g%0D%0A++join+e2s+on+g2g.GeneB+%3D+e2s.ENSEMBL%0D%0Awhere%0D%0A++g2g.GeneA+is+"${this.searchValue === '' ? this.geneId : this.searchValue}"%0D%0A++AND+g2g.Tissue+is+"${this.selectedTissue}"`
    // let queryURL = `${apiUrl}${annotationUrl}`;
    // this.httpClient.get(queryURL).pipe(
    //   catchError(error => {
    //     console.log("Error: ", error);
    //     let message = `Error: ${error.error.error}`;
    //     throw message
    //   }))
    //   .subscribe(res => {
    //     this.tableSize = res['rows'][0][0];
    //   })
  // }

  getComparisonStats() {
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++distinct+g2g.GeneB%2C%0D%0A++e2s.SYMBOL%2C%0D%0A++e2s.ENTREZID%2C%0D%0A++g2g.correlation%0D%0Afrom%0D%0A++g2g%0D%0A++join+e2s+on+g2g.GeneB+%3D+e2s.ENSEMBL%0D%0Awhere%0D%0A++g2g.GeneA+is+"${this.searchValue === '' ? this.geneId : this.searchValue}"%0D%0A++AND+g2g.Tissue+is+"${this.selectedTissue}"%0D%0Aorder+by%0D%0A++g2g.correlation+desc%0D%0Alimit+${this.limit}+offset+${this.currPage * this.limit}`
    // let queryURL = `${apiUrl}${annotationUrl}`;
    let queryURL = `https://api.seahorse.tm4.org/g2g/statistics?geneA=${this.searchValue === '' ? this.geneId : this.searchValue}&tissue=${this.selectedTissue}&limit=${this.limit}&offset=${this.currPage * this.limit}`
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        // window.scrollTo(0, 500)
        this.tableSize = res['count']
        this.dataSource = [];
        this.isLoading = false;
        for (let index in res['result']) {
          let temp = {
            "gene": res['result'][index][0],
            "symbol": res['result'][index][1],
            'entrezid': res['result'][index][2],
            'correlation': res['result'][index][3]
          }
          this.dataSource.push(temp);
        }
      })

  }

  onSelectMetadata2(name, symbol) {
    d3.select("#plotArea")
      .selectAll('svg')
      .remove();

    this.displayScatterPlot = true;
    this.metadataId = name;
    this.symbolId2 = symbol;
  }

  getPageDetails(details) {
    this.currPage = details.pageIndex
    this.limit = details.pageSize
    this.getComparisonStats();
    // window.scrollTo(0, 500)
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

    this.geneId = this.searchValue !== '' ? this.searchValue : this.geneId;
    // this.getTableSize()
    this.getComparisonStats()

  }

  onDropDownChange(value) {
    this.selectedTissue = value;
    this.geneSearch()
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
    this.displayScatterPlot = false;
    let startSym = 0;
    let endSym = value.indexOf(" ");
    let newSymbol = value.slice(startSym, endSym)
    this.symbolId = newSymbol;
    let startGene = value.indexOf("(");
    let endGene = value.indexOf(")")
    let newstring = value.slice(startGene + 1, endGene)
    this.searchValue = newstring;
    this.geneSearch()
  }
}
