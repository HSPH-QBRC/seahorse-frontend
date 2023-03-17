import { Component, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
// @ts-ignore
import tissuesJson from './tissueList.json';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ImageModalComponent } from '../image-modal/image-modal.component';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  searchValue = '';
  metadataId = 'SMUBRID';
  // metadataId = 'SMNTRART';
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
  typeOfLookUp = 'm2g'
  currPage = 0;
  limit = 10;
  tableSizeG2G = 0;
  tableSizeM2M = 0;
  tableSizeG2M = 0;
  tableSizeM2G = 0;
  tableSize = 0;
  plotTypeLookUp = {};
  geneType = 'integer';
  tableFromSearch = false;
  searchEnsemblResults = [];

  //For the Comparison table
  dataSourceG2G = [];
  dataSourceM2M = [];
  dataSourceG2M = [];
  dataSourceM2G = [];
  displayedColumnsG2G: string[] = ['symbol', 'correlation', 'entrezid'];
  displayedColumnsM2G: string[] = ['symbol', 'correlation', 'entrezid'];

  tissue = 'Bladder';
  tissueList = [];
  selectedTissue = 'Bladder';
  autoFillData = [];

  // PhenotypeArr = ["Sex", "Age", "Smoking History", "Etc"]
  LibraryMetadataArr = ["RIN Number", "Source"]

  displayedColumnsM2M: string[] = ['category_b', 'test', 'test_statistics', 'pvalue'];
  displayedColumnsG2M: string[] = ['category_b', 'test', 'test_statistics', 'pvalue'];

  showPhenotype = true;
  showLibraryMetadata = false;
  showGene = false;
  m2mTableReady = false;
  g2mTableReady = false;
  m2gTableReady = false;
  layoutType = "gene"

  constructor(
    private httpClient: HttpClient,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.layoutType = this.metadataId.startsWith("ENSG") ? "gene" : "metadata";
    this.m2mTableReady = false;
    this.tissueList = tissuesJson;
    this.searchValue = '';
    this.tableFromSearch = false;
    this.isLoading = true;
    this.getListOfMetadata();
    this.getAutoCompleteData();
    this.getListOfGeneToSymbol();
    if (this.layoutType === "metadata") {
      this.typeOfLookUp = "m2m"
      this.getM2MComparisonStats();
      this.getM2GComparisonStats();
    } else if (this.layoutType === "gene") {
      this.typeOfLookUp = "g2m"
      this.getG2MComparisonStats();
      this.getG2GComparisonStats();
    }



  }

  getG2GComparisonStats() {
    // let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++distinct+g2g.GeneB%2C%0D%0A++e2s.SYMBOL%2C%0D%0A++e2s.ENTREZID%2C%0D%0A++g2g.correlation%0D%0Afrom%0D%0A++g2g%0D%0A++join+e2s+on+g2g.GeneB+%3D+e2s.ENSEMBL%0D%0Awhere%0D%0A++g2g.GeneA+is+"${this.searchValue === '' ? this.geneId : this.searchValue}"%0D%0A++AND+g2g.Tissue+is+"${this.selectedTissue}"%0D%0Aorder+by%0D%0A++g2g.correlation+desc%0D%0Alimit+${this.limit}+offset+${this.currPage * this.limit}`
    // let queryURL = `${apiUrl}${annotationUrl}`;
    let queryURL = `https://api.seahorse.tm4.org/g2g/statistics?geneA=${this.searchValue === '' ? this.geneId : this.searchValue}&tissue=${this.selectedTissue}&limit=${this.limit}&offset=${this.currPage * this.limit}`
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
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

  getM2GComparisonStats() {
    // let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++distinct+g2g.GeneB%2C%0D%0A++e2s.SYMBOL%2C%0D%0A++e2s.ENTREZID%2C%0D%0A++g2g.correlation%0D%0Afrom%0D%0A++g2g%0D%0A++join+e2s+on+g2g.GeneB+%3D+e2s.ENSEMBL%0D%0Awhere%0D%0A++g2g.GeneA+is+"${this.searchValue === '' ? this.geneId : this.searchValue}"%0D%0A++AND+g2g.Tissue+is+"${this.selectedTissue}"%0D%0Aorder+by%0D%0A++g2g.correlation+desc%0D%0Alimit+${this.limit}+offset+${this.currPage * this.limit}`
    // let queryURL = `${apiUrl}${annotationUrl}`;
    // let queryURL = `https://api.seahorse.tm4.org/g2g/statistics?geneA=${this.searchValue === '' ? this.geneId : this.searchValue}&tissue=${this.selectedTissue}&limit=${this.limit}&offset=${this.currPage * this.limit}`
    let queryURL = `https://api.seahorse.tm4.org/m2g/statistics?category_a=SMNTERRT&limit=10&offset=0`
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.tableSizeM2G = res['count']
        this.dataSourceM2G = [];
        this.isLoading = false;
        for (let index in res['result']) {
          let temp = {
            "metadata": res['result'][index][0],
            "gene": res['result'][index][1],
            'entrezid': res['result'][index][2],
            'correlation': res['result'][index][3]
          }
          this.dataSourceM2G.push(temp);
        }
        this.m2gTableReady = true
      })
  }

  getM2MComparisonStats() {
    this.m2mTableReady = false;
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
        this.m2mTableReady = true
      })

  }

  getG2MComparisonStats() {
    this.g2mTableReady = false;
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `g2m/statistics?category_a=${this.metadataId}&limit=${this.limit}&offset=${this.currPage * this.limit}`;
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        this.isLoading = false;
        throw message
      }))
      .subscribe(res => {
        this.tableSizeG2M = res['count']
        this.dataSourceG2M = [];
        this.isLoading = false;
        for (let index in res['result']) {
          let temp = {
            "category_b": res['result'][index][0],
            "test": res['result'][index][2],
            'test_statistics': res['result'][index][3],
            'pvalue': res['result'][index][4]
          }
          this.dataSourceG2M.push(temp);
        }
        this.g2mTableReady = true
      })

  }

  metadataArr = [];

  getListOfMetadata() {
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `metadata/desc`;
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
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
      })
  }
  geneToSym = {}

  getListOfGeneToSymbol() {
    // let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++distinct+ENSEMBL%2C%0D%0A++SYMBOL%0D%0Afrom%0D%0A++e2s%0D%0Awhere%0D%0A++ENSEMBL+is+not+""`;
    // let queryURL = `${apiUrl}${annotationUrl}`;
    let queryURL = `https://api.seahorse.tm4.org/e2s/summary`
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        for (let i in res) {
          if (this.geneToSym[res[i][0]] === undefined) {
            this.geneToSym[res[i][0]] = res[i][1];
          }
        }
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
        this.isLoading = false;
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
  }

  geneSearch() {
    d3.select("#my_scatterplot")
      .selectAll('svg')
      .remove();

    d3.select("#my_boxplot")
      .selectAll('svg')
      .remove();

    this.showGene = false;
    this.showLibraryMetadata = false;
    this.showPhenotype = true;

    this.layoutType = "gene"

    this.tableFromSearch = true
    this.tableSizeG2G = 0;

    this.geneId = this.searchValue !== '' ? this.searchValue : this.geneId;
    // this.getTableSize()
    this.getG2MComparisonStats();
    this.getG2GComparisonStats()
  }

  onDropDownChange(value) {
    this.selectedTissue = value;
    this.geneSearch()
  }



  fromChild(value) {
    // this.displayScatterPlot = false;
    let startSym = 0;
    let endSym = value.indexOf(" ");
    let newSymbol = value.slice(startSym, endSym)
    this.symbolId = newSymbol;
    let startGene = value.indexOf("(");
    let endGene = value.indexOf(")")
    if (endGene === -1) {
      this.searchValue = value
    } else {
      let newstring = value.slice(startGene + 1, endGene)
      this.searchValue = newstring;
    }


    this.metadataId = this.searchValue;
    this.geneSearch()
  }

  changeMetadata(name) {
    this.layoutType = "metadata"
    this.metadataId = name;
    this.showGene = false;
    this.getM2MComparisonStats();
    window.scrollTo(0, 0);

  }

  checkPlotType(name: string) {
    if (Object.keys(this.metadataLookUp).length !== 0) {
      if (name.startsWith("ENSG")) {
        return "numeric"
      } else if (this.metadataLookUp[name]['type'] === 'string' || this.metadataLookUp[name]['type'] === 'integer, encoded value') {
        return "categoric"
      } else {
        return "numeric"
      }
    }

  }

  showModal = false;
  temp_img = ""

  openSPDialog(imageUrl: string, plotType: string) {

    this.dialog.open(ImageModalComponent, {
      data: {
        imageUrl: imageUrl,
        plotType: plotType
      },
    });
  }

  openBPDialog(imageUrl: string, plotType: string, num, cat, typeOfLookUp) {
    this.dialog.open(ImageModalComponent, {
      data: {
        imageUrl: imageUrl,
        plotType: plotType,
        metadataId: num,
        metadata2Id: cat,
        metadataLookUp: this.metadataLookUp,
        comparisonType: typeOfLookUp,
        size: "large"
      },
    });
  }
  openHMDialog(imageUrl: string, plotType: string, num, cat, typeOfLookUp) {
    this.dialog.open(ImageModalComponent, {
      data: {
        imageUrl: imageUrl,
        plotType: plotType,
        metadataId: num,
        metadata2Id: cat,
        metadataLookUp: this.metadataLookUp,
        comparisonType: typeOfLookUp,
        size: "large"
      },
    });
  }

  openMLDialog(plotType: string, meta1, meta2, typeOfLookUp) {
    this.dialog.open(ImageModalComponent, {
      data: {
        plotType: plotType,
        metadataId: meta1,
        metadata2Id: meta2,
        metadataLookUp: this.metadataLookUp,
        comparisonType: typeOfLookUp,
        size: "large"
      },
    });
  }

  onSelectImage(base64, plotType, meta1, meta2, typeOfLookUp) {
    // this.temp_img = base64
    if (plotType === 'boxplot') {
      this.openBPDialog(this.temp_img, plotType, meta1, meta2, typeOfLookUp)
    } else if (plotType === 'heatmap') {
      this.openHMDialog(this.temp_img, plotType, meta1, meta2, typeOfLookUp)
    }
  }

  onSelectScatterplotImage(base64, plotType) {
    this.temp_img = base64;
    this.openSPDialog(this.temp_img, plotType)
  }

  

  onSelectMetadataLink(meta1, meta2, typeOfLookUp){
    let plotType = '';
    if(this.checkPlotType(meta1) === 'categoric' && this.checkPlotType(meta2) === 'categoric'){
      plotType = 'heatmap';
      this.openMLDialog(plotType, meta1, meta2, typeOfLookUp)
    }else if(this.checkPlotType(meta1) === 'numeric' && this.checkPlotType(meta2) === 'numeric'){
      plotType = 'scatterplot';
      if(meta2.startsWith("ENSG")){
        let temp = meta1;
        meta1 = meta2;
        meta2 = temp;
      }
      this.openMLDialog(plotType, meta1, meta2, typeOfLookUp)
    }else{
      plotType = 'boxplot';
      this.openMLDialog(plotType, meta1, meta2, typeOfLookUp)
    }
  }
}
