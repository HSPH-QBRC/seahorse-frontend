import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import tissuesJson from './tissueList.json';
import { MatDialog } from '@angular/material/dialog';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import * as XLSX from 'xlsx';
import { PathwaysComponent } from '../gsea-dialog/gsea.component'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  @ViewChild('myPhenotype') myPhenotype: ElementRef;
  @ViewChild('myLibrary') myLibrary: ElementRef;
  @ViewChild('myGene') myGene: ElementRef;
  @ViewChild('myTugplot') myRugplot: ElementRef;

  searchValue = '';
  metadataId = 'MHARTHTS';
  metadata2Id = '';
  geneId = '';
  symbolId = '';
  symbolId2 = '';
  excludeListPhenotype = ['SUBJID', 'HGHTU', 'WGHTU'];
  excludeListLibrary = ['SAMPID']
  displayScatterPlot = false;
  displayBoxPlot = false;
  displayHeatmap = false;
  currMetadataType = ''
  metadataLookUp = {};
  isLoading = false;
  typeOfLookUp = 'm2g'
  currPage = 0;
  currPagePathways = 0;
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
  displayedColumnsPathways: string[] = ['pathway', 'rugplot', 'pvalue', 'top_tissues'];
  displayedColumnsG2G: string[] = ['symbol', 'gene', 'correlation', 'entrezid'];
  displayedColumnsM2G: string[] = ['symbol', 'gene', 'test', 'test_statistics', 'pvalue'];
  displayedColumnsM2M: string[] = ['category_b', 'description', 'test', 'test_statistics', 'pvalue'];
  displayedColumnsG2M: string[] = ['category_b', 'description', 'test', 'test_statistics', 'pvalue'];
  tissue = 'Brain - cluster 1';
  tissueList = [];
  selectedTissue = 'Brain - cluster 1';
  autoFillData = [];
  showPhenotype = true;
  showLibraryMetadata = false;
  showGene = false;
  showRugplot = true;
  m2mTableReady = false;
  g2mTableReady = false;
  m2gTableReady = false;
  g2gTableReady = false
  layoutType = "metadata"
  showPhenoList = false;
  showLibraryList = false;
  tableSizeM2MLibrary = 0;
  dataSourceM2MLibrary = [];
  m2mLibraryTableReady = false;
  tableSizeG2MLibrary = 0;
  dataSourceG2MLibrary = [];
  g2mLibraryTableReady = false;
  metadataArr = [];
  phenotypeArr = [];
  libraryMetadataArr = [];
  metadataListReady = false;
  showModal = false;
  temp_img = "";
  geneToSym = {};

  tableSizePathways = 0;
  dataSourcePathways = [];
  pathwaysTableReady = false;
  isLoadingPathways = false;

  constructor(
    private httpClient: HttpClient,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.layoutType = this.metadataId.startsWith("ENSG") ? "gene" : "metadata";
    this.m2mTableReady = false;
    this.g2mTableReady = false;
    this.tissueList = tissuesJson;
    this.searchValue = '';
    this.tableFromSearch = false;
    this.metadataListReady = false;
    this.currPage = 0;
    this.currPagePathways = 0;

    this.getPathwaysComparisonStats();

    this.getListOfMetadata();
    this.getAutoCompleteData();
    this.getListOfGeneToSymbol();
  }

  getPathwaysComparisonStats() {
    this.isLoadingPathways = true;
    this.pathwaysTableReady = false;
    this.dataSourcePathways = [];
    this.tableSizePathways = 0;
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `gsea/?meta=${this.metadataId}&tissue=${this.selectedTissue}&limit=${this.limit}&offset=${this.currPagePathways * this.limit}`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.isLoadingPathways = false;
        this.tableSizePathways = res['count'];
        this.dataSourcePathways = [];
        for (let index in res['result']) {
          let temp = {
            "rugplot": res['result'][index][2],
            "pvalue": res['result'][index][0],
            "pathway": res['result'][index][1],
          }
          this.dataSourcePathways.push(temp);
        }
        this.pathwaysTableReady = true;
      })
  }

  getG2GComparisonStats() {
    this.isLoading = true;
    this.g2gTableReady = false;
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `g2g/statistics?geneA=${this.searchValue === '' ? this.geneId : this.searchValue}&tissue=${this.selectedTissue}&limit=${this.limit}&offset=${this.currPage * this.limit}`
    let queryURL = `${apiUrl}${annotationUrl}`;
    console.log("g2g: ", queryURL)
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        this.tableSizeG2G = res['count'];
        this.dataSourceG2G = [];
        for (let index in res['result']) {
          let temp = {
            "gene": res['result'][index][0],
            "symbol": res['result'][index][1],
            'entrezid': res['result'][index][2],
            'correlation': res['result'][index][3]
          }
          this.dataSourceG2G.push(temp);
        }
        this.g2gTableReady = true;
      })
  }

  getM2GComparisonStats() {
    this.isLoading = true;
    this.m2gTableReady = false;
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `m2g/statistics?category_a=${this.metadataId.split('.')[0]}&tissue=${this.selectedTissue}&limit=${this.limit}&offset=${this.currPage * this.limit}`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.tableSizeM2G = res['count'];
        this.dataSourceM2G = [];
        this.isLoading = false;
        for (let index in res['result']) {
          let temp = {
            "metadata": res['result'][index][0],
            "gene": res['result'][index][1],
            'test': res['result'][index][2],
            'test_statistics': res['result'][index][3],
            'pvalue': res['result'][index][4]
          }
          this.dataSourceM2G.push(temp);
        }
        this.m2gTableReady = true;
      })
  }

  getM2MComparisonStats() {
    this.isLoading = true;
    this.m2mTableReady = false;
    let metaType = "phenotype"
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `m2m/statistics?category_a=${this.metadataId}&meta=${metaType}&tissue=${this.selectedTissue}&limit=${this.limit}&offset=${this.currPage * this.limit}`;
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        this.isLoading = false;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        this.tableSizeM2M = res['count']
        this.dataSourceM2M = [];
        for (let index in res['result']) {
          let temp = {
            "category_b": res['result'][index][1],
            "test": res['result'][index][2],
            'test_statistics': res['result'][index][3],
            'pvalue': res['result'][index][4]
          }
          this.dataSourceM2M.push(temp);
        }
        this.m2mTableReady = true;
      })
  }

  getM2MLibraryComparisonStats() {
    this.isLoading = true;
    this.m2mLibraryTableReady = false;
    let metaType = "library";
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `m2m/statistics?category_a=${this.metadataId}&meta=${metaType}&tissue=${this.selectedTissue}&limit=${this.limit}&offset=${this.currPage * this.limit}`;
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        this.isLoading = false;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        this.tableSizeM2MLibrary = res['count']
        this.dataSourceM2MLibrary = [];

        for (let index in res['result']) {
          let temp = {
            "category_b": res['result'][index][1],
            "test": res['result'][index][2],
            'test_statistics': res['result'][index][3],
            'pvalue': res['result'][index][4]
          }
          this.dataSourceM2MLibrary.push(temp);
        }
        this.m2mLibraryTableReady = true
      })
  }

  getG2MComparisonStats() {
    this.isLoading = true;
    let metaType = "phenotype"
    this.g2mTableReady = false;
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `g2m/statistics?category_a=${this.metadataId}&meta=${metaType}&tissue=${this.selectedTissue}&limit=${this.limit}&offset=${this.currPage * this.limit}`;
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        this.isLoading = false;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        this.tableSizeG2M = res['count']
        this.dataSourceG2M = [];
        for (let index in res['result']) {
          let temp = {
            "category_b": res['result'][index][0],
            "test": res['result'][index][2],
            'test_statistics': res['result'][index][3],
            'pvalue': res['result'][index][4]
          }
          this.dataSourceG2M.push(temp);
        }
        this.g2mTableReady = true;
      })
  }

  getG2MLibraryComparisonStats() {
    this.isLoading = true;
    let metaType = "library";
    this.g2mLibraryTableReady = false;
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `g2m/statistics?category_a=${this.metadataId}&meta=${metaType}&tissue=${this.selectedTissue}&limit=${this.limit}&offset=${this.currPage * this.limit}`;
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        this.isLoading = false;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        this.tableSizeG2MLibrary = res['count']
        this.dataSourceG2MLibrary = [];

        for (let index in res['result']) {
          let temp = {
            "category_b": res['result'][index][0],
            "test": res['result'][index][2],
            'test_statistics': res['result'][index][3],
            'pvalue': res['result'][index][4]
          }
          this.dataSourceG2MLibrary.push(temp);
        }
        this.g2mLibraryTableReady = true
      })
  }

  getListOfMetadata() {
    this.isLoading = true;
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
        this.isLoading = false;
        for (let i in res) {
          let temp = {
            "varname": res[i][0],
            "vardesc": res[i][1].split(":"),
            "vardescFull": res[i][1],
            "type": res[i][3],
            "meta": res[i][2]
          }
          if (res[i][2] === 'phenotype') {
            this.phenotypeArr.push(temp)
          } else {
            this.libraryMetadataArr.push(temp)
          }
          this.metadataArr.push(temp)
          this.metadataLookUp[res[i][0]] = temp
        }

        //Find a better way to handle metadataLookUp not being ready yet. Maybe use an Observerable??
        setTimeout(() => {
          this.metadataListReady = true;
        }, 500)

        if (this.layoutType === "metadata") {
          this.typeOfLookUp = "m2m";
          this.getM2MComparisonStats();
        } else if (this.layoutType === "gene") {
          this.typeOfLookUp = "g2g";
          this.getG2GComparisonStats();
        }
      })
  }

  getListOfGeneToSymbol() {
    let apiUrl = "https://api.seahorse.tm4.org";
    let annotationUrl = `/e2s/summary`
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
          if (this.geneToSym[res[i][0]] === undefined) {
            this.geneToSym[res[i][0]] = res[i][1];
          }
        }
      })
  }

  getAutoCompleteData() {
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
    this.currPage = 0;
    this.currPagePathways = 0;
  }

  getPageDetails(details, comparison) {
    if (comparison === 'pathways') {
      this.currPagePathways = details.pageIndex;
    } else {
      this.currPage = details.pageIndex;
    }

    this.limit = details.pageSize;
    if (comparison === 'm2m') {
      this.getM2MComparisonStats();
    } else if (comparison === 'm2mlib') {
      this.getM2MLibraryComparisonStats()
    } else if (comparison === 'm2g') {
      this.getM2GComparisonStats();
    } else if (comparison === 'g2m') {
      this.getG2MComparisonStats();
    } else if (comparison === 'g2mlib') {
      this.getG2MLibraryComparisonStats();
    } else if (comparison === 'g2g') {
      this.getG2GComparisonStats();
    } else if (comparison === 'pathways') {
      this.getPathwaysComparisonStats();
    }
  }

  geneSearch() {
    d3.select("#my_scatterplot")
      .selectAll('svg')
      .remove();

    d3.select("#my_boxplot")
      .selectAll('svg')
      .remove();

    this.showPhenotype = false;
    this.showLibraryMetadata = false;
    this.showGene = true;

    this.layoutType = "gene"
    this.currPage = 0;

    this.tableFromSearch = true;

    this.geneId = this.searchValue !== '' ? this.searchValue : this.geneId;
    this.typeOfLookUp = "m2g";

    this.getG2GComparisonStats();
  }

  onTissueChange(value) {
    this.selectedTissue = value;
    if (this.showGene) {
      this.showGene = !this.showGene
      this.g2gTableReady = false;
      this.expandSection('gene')
    } else if (this.showPhenotype) {
      this.showPhenotype = !this.showPhenotype
      this.expandSection('phenotype')
    } else if (this.showLibraryMetadata) {
      this.showLibraryMetadata = !this.showLibraryMetadata
      this.expandSection('library')
    }
  }

  onSearch(value) {
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
    this.geneId = this.searchValue;
    this.geneSearch()
  }

  dataSourceReset() {
    this.dataSourceM2M = [];
    this.dataSourceM2MLibrary = [];
    this.dataSourceM2G = [];
    this.dataSourceG2M = [];
    this.dataSourceG2MLibrary = [];
    this.dataSourceG2G = [];
  }

  changeMetadata(name) {
    this.dataSourceReset();
    this.searchValue = '';

    this.layoutType = "metadata"
    this.metadataId = name;
    this.showPhenotype = true;
    this.showLibraryMetadata = false;
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

  openSPDialog(imageUrl: string, plotType: string, tissue: string) {
    this.dialog.open(ImageModalComponent, {
      data: {
        imageUrl: imageUrl,
        plotType: plotType,
        tissue: tissue
      },
    });
  }

  openBPDialog(imageUrl: string, plotType: string, num, cat, typeOfLookUp, tissue) {
    this.dialog.open(ImageModalComponent, {
      data: {
        imageUrl: imageUrl,
        plotType: plotType,
        metadataId: num,
        metadata2Id: cat,
        metadataLookUp: this.metadataLookUp,
        comparisonType: typeOfLookUp,
        size: "large",
        tissue: tissue
      },
    });
  }

  openHMDialog(imageUrl: string, plotType: string, num, cat, typeOfLookUp, tissue) {
    this.dialog.open(ImageModalComponent, {
      data: {
        imageUrl: imageUrl,
        plotType: plotType,
        metadataId: num,
        metadata2Id: cat,
        metadataLookUp: this.metadataLookUp,
        comparisonType: typeOfLookUp,
        size: "large",
        tissue: tissue
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
        size: "large",
        tissue: this.selectedTissue
      },
    });
  }

  onSelectImage(base64, plotType, meta1, meta2, typeOfLookUp, tissue) {
    if (plotType === 'boxplot') {
      this.openBPDialog(this.temp_img, plotType, meta1, meta2, typeOfLookUp, tissue)
    } else if (plotType === 'heatmap') {
      this.openHMDialog(this.temp_img, plotType, meta1, meta2, typeOfLookUp, tissue)
    }
  }

  onSelectScatterplotImage(base64, plotType) {
    this.temp_img = base64;
    this.openSPDialog(this.temp_img, plotType, this.selectedTissue)
  }

  onSelectMetadataLink(meta1, meta2, typeOfLookUp) {
    let plotType = '';
    if (this.checkPlotType(meta1) === 'categoric' && this.checkPlotType(meta2) === 'categoric') {
      plotType = 'heatmap';
      // this.openMLDialog(plotType, meta1, meta2, typeOfLookUp)
      this.openHMDialog(this.temp_img, plotType, meta1, meta2, typeOfLookUp, this.selectedTissue)
    } else if (this.checkPlotType(meta1) === 'numeric' && this.checkPlotType(meta2) === 'numeric') {
      plotType = 'scatterplot';
      if (meta2.startsWith("ENSG")) {
        let temp = meta1;
        meta1 = meta2;
        meta2 = temp;
      }
      this.openMLDialog(plotType, meta1, meta2, typeOfLookUp)
    } else {
      plotType = 'boxplot';
      // this.openMLDialog(plotType, meta1, meta2, typeOfLookUp)
      this.openBPDialog(this.temp_img, plotType, meta1, meta2, typeOfLookUp, this.selectedTissue)
    }
  }

  expandSection(name) {
    this.currPage = 0;
    if (name === 'phenotype') {
      this.showPhenotype = !this.showPhenotype;
      if (this.showPhenotype) {
        this.showLibraryMetadata = false;
        this.showGene = false;
        this.layoutType === 'metadata' ? this.getM2MComparisonStats() : this.getG2MComparisonStats();
      }
      this.myPhenotype.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } else if (name === 'library') {
      this.showLibraryMetadata = !this.showLibraryMetadata;
      if (this.showLibraryMetadata) {
        this.showPhenotype = false;
        this.showGene = false;
        this.layoutType === 'metadata' ? this.getM2MLibraryComparisonStats() : this.getG2MLibraryComparisonStats();
      }
      this.myLibrary.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } else if (name === 'gene') {
      this.showGene = !this.showGene;
      if (this.showGene) {
        this.showPhenotype = false;
        this.showLibraryMetadata = false;
        this.layoutType === 'metadata' ? this.getM2GComparisonStats() : this.getG2GComparisonStats();
      }
      this.myGene.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } else if (name === 'rugplot') {
      this.showRugplot = !this.showRugplot;
      if (this.showRugplot) {
        this.getPathwaysComparisonStats()
      }
      this.myRugplot.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  downloadTable(comparisonType, metaType) {
    let limit = 1000000;
    let offset = 0;
    let annotationUrl = ''
    if (comparisonType === 'm2m') {
      annotationUrl = `m2m/statistics?category_a=${this.metadataId}&meta=${metaType}&tissue=${this.selectedTissue}&limit=${limit}&offset=${offset}`;
    } else if (comparisonType === 'm2mLibrary') {
      annotationUrl = `m2m/statistics?category_a=${this.metadataId}&meta=${metaType}&tissue=${this.selectedTissue}&limit=${limit}&offset=${offset}`;
    } else if (comparisonType === 'm2g') {
      annotationUrl = `m2g/statistics?category_a=${this.metadataId.split('.')[0]}&tissue=${this.selectedTissue}&limit=${limit}&offset=${offset}`;
    } else if (comparisonType === 'g2m') {
      annotationUrl = `g2m/statistics?category_a=${this.metadataId}&meta=${metaType}&tissue=${this.selectedTissue}&limit=${limit}&offset=${offset}`;
    } else if (comparisonType === 'g2mLibrary') {
      annotationUrl = `g2m/statistics?category_a=${this.metadataId}&meta=${metaType}&tissue=${this.selectedTissue}&limit=${limit}&offset=${offset}`;
    } else if (comparisonType === 'g2g') {
      annotationUrl = `g2g/statistics?geneA=${this.searchValue === '' ? this.geneId : this.searchValue}&tissue=${this.selectedTissue}&limit=${limit}&offset=${offset}`;
    } else if (comparisonType === 'pathways') {
      annotationUrl = `gsea-dl-table/?meta=${this.metadataId}&tissue=${this.selectedTissue}&limit=${limit}&offset=${offset}`
    }
    let apiUrl = "https://api.seahorse.tm4.org/";
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        this.isLoading = false;
        throw message
      }))
      .subscribe(res => {
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(res["result"]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, 'output.xlsx');
      })
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url: string = window.URL.createObjectURL(data);
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  }

  openPathwaysDialog(meta, pathway) {
    this.dialog.open(PathwaysComponent, {
      data: {
        meta,
        pathway
      },
    });
  }
}

