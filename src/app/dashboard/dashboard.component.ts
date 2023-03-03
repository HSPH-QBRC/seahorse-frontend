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
  metadataId = 'SMUBRID';
  metadata2Id = 'ENSG00000180806'
  geneId = '';
  symbolId = '';
  symbolId2 = '';
  displayScatterPlot = false;
  displayBoxPlot = false;
  displayHeatmap = false;
  currMetadataType = ''
  metadataLookUp = {};

  notIncludeList = ["SUBJID", "AGE", "SAMPID", "SMRIN"]
  isLoading = false;
  typeOfLookUp = 'mcc'
  currPage = 0;
  limit = 10;
  tableSizeG2G = 0;
  tableSizeM2M = 0;
  tableSize = 0;
  plotTypeLookUp = {};
  geneType = 'integer';
  tableFromSearch = false;
  searchEnsemblResults = [];

  //For the Comparison table
  dataSourceG2G = [];
  dataSourceM2M = [];
  displayedColumnsG2G: string[] = ['symbol', 'correlation', 'entrezid'];

  tissue = 'Bladder';
  tissueList = [];
  selectedTissue = 'Bladder';
  autoFillData = [];

  // PhenotypeArr = ["Sex", "Age", "Smoking History", "Etc"]
  LibraryMetadataArr = ["RIN Number", "Source"]

  displayedColumnsM2M: string[] = ['category_b', 'test', 'test_statistics', 'pvalue'];

  showPhenotype = true;
  showLibraryMetadata = false;
  showGene = false;

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {

    this.tissueList = tissuesJson;
    this.searchValue = '';
    this.tableFromSearch = false;
    this.isLoading = true;

    this.getAutoCompleteData();


    this.getListOfMetadata();
    // this.getG2GComparisonStats();

    this.getM2MComparisonStats();
  }

  getG2GComparisonStats() {
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
        this.tableSizeG2G = res['count']
        this.dataSourceG2G = [];
        this.isLoading = false;
        for (let index in res['result']) {
          let temp = {
            "gene": res['result'][index][0],
            "symbol": res['result'][index][1],
            'entrezid': res['result'][index][2],
            'correlation': res['result'][index][3]
          }
          this.dataSourceG2G.push(temp);
        }
      })

  }
  // metadataIdForGraph = ""
  // currMetadata = "SMATSSCR"
  getM2MComparisonStats() {
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `m2m/statistics?category_a=${this.metadataId}&limit=${this.limit}&offset=${this.currPage * this.limit}`;
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        this.isLoading = false;
        throw message
      }))
      .subscribe(res => {
        this.tableSizeM2M = res['count']
        this.dataSourceM2M = [];
        this.isLoading = false;
        for (let index in res['result']) {
          let temp = {
            "category_b": res['result'][index][1],
            "test": res['result'][index][2],
            'test_statistics': res['result'][index][3],
            'pvalue': res['result'][index][4]
          }
          this.dataSourceM2M.push(temp);
        }
        // this.metadataIdForGraph = this.metadataId;
      })

  }

  metadataArr = [];

  getListOfMetadata() {
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `metadata/desc`;
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        for (let i in res) {
          let temp = {
            "varname": res[i][0],
            "vardesc": res[i][1].split(":"),
            "vardescFull": res[i][1],
            "type": res[i][2],
            "comment": res[i][3]
          }
          this.metadataArr.push(temp)
          this.metadataLookUp[res[i][0]] = temp
        }
        console.log("cat type: ", this.checkPlotType("SMTSD"))
        console.log("num type: ", this.checkPlotType("ENSG00000207776"))
        // console.log("num type: ", this.checkPlotType("SMCHMPRS"))
      })
  }

  getAutoCompleteData() {
    // let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++distinct+ENSEMBL%2C%0D%0A++SYMBOL%0D%0Afrom%0D%0A++e2s%0D%0Awhere%0D%0A++ENSEMBL+is+not+""%0D%0Aorder+by%0D%0A++SYMBOL`
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `e2s/summary`;

    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.autoFillData = [];
        for (let i in res) {
          let temp = `${res[i][1]} (${res[i][0]})`
          this.autoFillData.push(temp)
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
    this.getG2GComparisonStats();
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
    this.tableSizeG2G = 0;

    this.geneId = this.searchValue !== '' ? this.searchValue : this.geneId;
    // this.getTableSize()
    this.getG2GComparisonStats()

  }

  onDropDownChange(value) {
    this.selectedTissue = value;
    this.geneSearch()
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

  changeMetadata(name) {
    // d3.select("#my_plotArea")
    //   .selectAll('div')
    //   .remove();

    // this.plotTypeLookUp = {};
    this.metadataId = name;
    // // this.getMetadataType(this.metadataId);
    // // this.getComparisonStats();
    this.getM2MComparisonStats();
    window.scrollTo(0, 0);

  }

  checkPlotType(name: string) {
    if (name.startsWith("ENSG")) {
      return "numeric"
    }
    else if (this.metadataLookUp[name]['type'] === 'string' || this.metadataLookUp[name]['type'] === 'integer, encoded value') {
      return "categoric"
    } else {
      return "numeric"
    }
  }
}
