import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
// import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
// @ts-ignore
import tissuesJson from './tissueList.json';


@Component({
  selector: 'app-geneExpressionComparison',
  templateUrl: './geneExpressionComparison.component.html',
  styleUrls: ['./geneExpressionComparison.component.scss']
})

export class GeneExpressionComparisonComponent implements OnInit {
  searchValue = '';
  metadataId = 'SMEXNCRT'; //for num
  metadata2Id = '';
  geneId = 'ENSG00000227232';
  symbolId = 'WASH7P'
  displayScatterPlot = false;
  displayBoxPlot = false;
  displayHeatmap = false;
  currMetadataType = ''
  metadataLookUp = {};


  notIncludeList = ["SUBJID", "AGE", "SAMPID"]
  isLoading = false;
  typeOfLookUp = 'g2g'
  currPage = 0;
  limit = 25;
  tableSize = 0;
  plotTypeLookUp = {};
  geneType = 'integer';
  tableFromSearch = false;
  searchEnsemblResults = [];

  //For the Comparison table
  dataSource = [];
  displayedColumns: string[] = ['gene', 'symbol', 'correlation', 'entrezid'];

  tissue = 'Bladder';
  tissueList = [];
  selectedTissue = 'Bladder';
  autoFillData = [];

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.tissueList = tissuesJson;
    this.searchValue = '';
    this.tableFromSearch = false;
    this.isLoading = true;

    this.getAutoCompleteData();

    this.getTableSize();
    this.getComparisonStats();
  }

  getTableSize() {
    this.tableSize = 0;
    let table = 'g2g'
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=SELECT%0D%0A++COUNT%28*%29%0D%0AFROM%0D%0A++${table}%0D%0Awhere%0D%0A++GeneA+is+"${this.searchValue}"%0D%0A++AND+Tissue+is+"${this.selectedTissue}"`
    let annotationUrl = `sql=select%0D%0A++COUNT+%28distinct+g2g.GeneB%29%0D%0Afrom%0D%0A++g2g%0D%0A++join+e2s+on+g2g.GeneB+%3D+e2s.ENSEMBL%0D%0Awhere%0D%0A++g2g.GeneA+is+"${this.searchValue}"%0D%0A++AND+g2g.Tissue+is+"${this.selectedTissue}"`
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
    let annotationUrl = `sql=select%0D%0A++distinct+g2g.GeneB%2C%0D%0A++e2s.SYMBOL%2C%0D%0A++e2s.ENTREZID%2C%0D%0A++g2g.correlation%0D%0Afrom%0D%0A++g2g%0D%0A++join+e2s+on+g2g.GeneB+%3D+e2s.ENSEMBL%0D%0Awhere%0D%0A++g2g.GeneA+is+"${this.searchValue}"%0D%0A++AND+g2g.Tissue+is+"${this.selectedTissue}"%0D%0Aorder+by%0D%0A++g2g.correlation+desc%0D%0Alimit%0D%0A++${this.currPage}%2C+${this.limit}`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        window.scrollTo(0, 500)
        this.dataSource = [];
        this.isLoading = false;
        for (let i = 0; i < res['rows'].length; i++) {
          let temp = {
            "gene": res['rows'][i][0],
            "symbol": res['rows'][i][1],
            'entrezid': res['rows'][i][2],
            'correlation': res['rows'][i][3]
          }
          this.dataSource.push(temp)
        }
      })

  }

  onSelectMetadata2(name) {
    d3.select("#plotArea")
      .selectAll('svg')
      .remove();

    // this.displayScatterPlot = false;

    this.displayScatterPlot = true;
    this.metadataId = name;
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
    this.geneId = this.searchValue;
    this.getTableSize()
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
