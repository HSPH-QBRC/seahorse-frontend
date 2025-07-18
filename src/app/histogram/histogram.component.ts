import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class HistogramComponent implements OnChanges {
  @Input() metadataId: string = '';
  @Input() tissue: string = '';
  @Input() geneId: string = '';
  @Input() comparisonType: string = '';
  @Input() meta: string = '';
  private readonly API_URL = environment.API_URL;

  dataSize = 0;
  isLoading = false;
  histogramData = [];
  min = 0;
  max = -Infinity;
  hideHistogram = false;

  constructor(private httpClient: HttpClient) { }

  ngOnChanges(changes: SimpleChanges): void {
    
    this.min = 0;
    this.max = -Infinity;
    let numeric = this.metadataId;
    let geneNum = this.geneId;
    this.isLoading = true;

    if (this.comparisonType === 'm2m' || this.comparisonType === 'g2m') {
      this.getData(numeric);
    } else if (this.comparisonType === 'g2g' || this.comparisonType === 'm2g') {
      // this.getG2GGeneData(geneNum)
      this.getData(numeric);
    } 
    // else if (this.comparisonType === 'g2m') {
    //   this.getData(numeric);
    // }
  }

  getData(numeric) {
    let annotationUrl = `/metadata2/metadata-summary-plot?category_a=${numeric}&comparison=${this.comparisonType}&meta=${this.meta}&tissue=${this.tissue}`
    let queryURL = `${this.API_URL}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        let numberOfBins = 20;
        this.min = res["data"][0]["x0"];
        this.max = res["data"][numberOfBins - 1]["x1"]
        this.histogramData = res["data"]
        if (this.histogramData.length === 0) {
          this.hideHistogram = true;
        } else {
          this.hideHistogram = false;
          this.createHistogram()
        }
      })
  }

  createHistogram() {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 100, left: 100 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const pointTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event, d) => {
        let tipBox = `<div><div class="category">Interval: ${d.x0} - ${d.x1}</div></div>
    <div><div class="category">Count: </div> ${d.count}</div>`
        return tipBox
      });

    d3.select(`.my_histogram_${this.metadataId}`)
      .selectAll('svg')
      .remove();

    // append the svg object to the body of the page
    var svg = d3.select(`.my_histogram_${this.metadataId}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    svg.call(pointTip);

    // X axis: scale and draw:
    var x = d3.scaleLinear()
      .domain([this.min, this.max])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")

    // set the parameters for the histogram
    var histogram = d3.histogram()
      .value(function (d) { return d; })   // I need to give the vector of value
      .domain([this.min, this.max])  // then the domain of the graphic
      .thresholds(x.ticks(20)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(this.histogramData);
    // Y axis: scale and draw:
    var y = d3.scaleLinear()
      .range([height, 0]);

    //check this value later
    y.domain([0, d3.max(this.histogramData, function (d) {
      return (d.count+1);
    })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
      .call(d3.axisLeft(y));

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
      .data(this.histogramData)
      .enter()
      .append("rect")
      .attr("x", 1)
      .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.count) + ")"; })
      .attr("width", function (d) { return Math.abs(x(d.x1) - x(d.x0) - 1); })
      .attr("height", function (d) { return height - y(d.count); })
      .style("fill", "#69b3a2")
      .on('mouseover', function (mouseEvent: any, d) {
        pointTip.show(mouseEvent, d, this);
        pointTip.style('left', mouseEvent.x + 10 + 'px');
      })
      .on('mouseout', pointTip.hide);

    svg.append('text')
      .classed('label', true)
      .attr('transform', 'rotate(-90)')
      .attr("font-weight", "bold")
      .attr('y', -margin.left + 10)
      .attr('x', -height / 2)
      .attr('dy', '.71em')
      .style('fill', 'rgba(0,0,0,.8)')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Counts');

    svg
      .append('text')
      .classed('label', true)
      .attr("font-weight", "bold")
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('fill', 'rgba(0,0,0,.8)')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(this.comparisonType === 'm2m' ? 'Intervals' : 'Gene Expression');
  }
}
