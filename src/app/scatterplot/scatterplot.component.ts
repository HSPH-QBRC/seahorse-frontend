import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from "rxjs/operators";
declare const matplotlib: any;
import io from 'buffer';

@Component({
  selector: 'app-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class ScatterPlotComponent implements OnInit, OnChanges {
  @Input() metadataId = '';
  @Input() metadata2Id = '';
  @Input() metadataLookUp = {};
  @Input() typeOfLookUp = '';
  @Input() symbolId = '';
  @Input() symbolId2 = '';
  @Input() tissue = '';
  @Output() selectedImageBase64 = new EventEmitter<string>();

  isLoading = false;
  limit = 1000;
  offset = 0;
  lengthOfResult = 0;

  scatterPlotData = [];
  xMin = Infinity;
  xMax = -Infinity;
  yMin = Infinity;
  yMax = -Infinity;

  noData = false;

  imageUrl = "";
  imagePng = "";
  imageBase64 = "";

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    this.offset = 0;
    this.lengthOfResult = 0;
    let numerical1 = this.metadataId;
    let numerical2 = this.metadata2Id;
    this.refreshData();
    if (this.typeOfLookUp === 'm2m') {
      this.getDataM2M(numerical1, numerical2)
    } else if (this.typeOfLookUp === 'm2g') {
      this.getDataM2G(numerical1, numerical2)
    } else if (this.typeOfLookUp === 'g2g') {
      this.getDataG2G(numerical1, numerical2)
    }
  }

  getDataM2M(numerical1, numerical2) {
    this.isLoading = true;
    const headers = new HttpHeaders().set('Accept', 'image/png');
    let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=${numerical1}&category_b=${numerical2}&comparison=${this.typeOfLookUp}&tissue=${this.tissue}`
    this.httpClient.get(queryURL, { responseType: 'text' }).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(dataUrl => {
        this.isLoading = false;
        this.imageBase64 = `data:image/png;base64,${dataUrl}`
      });
  }

  getDataM2G(numGene, numMetadata) {
    this.isLoading = true;
    let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=${numMetadata.split('.')[0]}&category_b=${numGene.split('.')[0]}&comparison=${this.typeOfLookUp}&tissue=${this.tissue}`
    this.httpClient.get(queryURL, { responseType: 'text' }).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(dataUrl => {
        this.isLoading = false;
        this.imageBase64 = `data:image/png;base64,${dataUrl}`

      })
  }

  getDataG2G(numerical1, numerical2) {
    this.isLoading = true;
    let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=${numerical1}&category_b=${numerical2}&comparison=${this.typeOfLookUp}&tissue=${this.tissue}`
    this.httpClient.get(queryURL, { responseType: 'text' }).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(dataUrl => {
        this.isLoading = false;
        this.imageBase64 = `data:image/png;base64,${dataUrl}`

      })
  }

  refreshData() {
    this.scatterPlotData = [];
    this.xMin = Infinity
    this.xMax = -Infinity
    this.yMin = Infinity
    this.yMax = -Infinity
  }

  getYAxisLabelNames() {
    switch (this.typeOfLookUp) {
      case 'm2m':
        return this.metadataLookUp[this.metadata2Id].vardesc[0].slice(0, 50)
      case 'm2g':
        return this.symbolId === undefined ? this.metadata2Id : this.symbolId
      case 'g2g':
        return this.symbolId
      default:
        return "N/A"
    }
  }

  getXAxisLabelNames() {
    switch (this.typeOfLookUp) {
      case 'm2m':
        return this.metadataLookUp[this.metadataId].vardesc[0].slice(0, 50)
      case 'm2g':
        return this.metadataLookUp[this.metadataId].vardesc[0].slice(0, 50)
      case 'g2g':
        return this.symbolId2
      default:
        return "N/A"
    }
  }

  onImageClicked(event: Event) {
    this.selectedImageBase64.emit(this.imageBase64)
  }

}
