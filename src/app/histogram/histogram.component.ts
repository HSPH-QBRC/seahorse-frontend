import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class HistogramComponent implements OnChanges {
  @Input() metadataId: string = '';
  @Input() geneId: string = '';
  @Input() comparisonType: string = '';
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

    if (this.comparisonType === 'm2m') {
      this.getData(numeric);
    } else if (this.comparisonType === 'g2g' || this.comparisonType === 'm2g') {
      this.getG2GGeneData(geneNum)
    }
  }

  getData(numeric) {
    // let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++${numeric}%0D%0Afrom%0D%0A++annotations%0D%0Awhere%0D%0A++${numeric}+is+not+%22%22`
    // let queryURL = `${apiUrl}${annotationUrl}`;
    let queryURL = `https://api.seahorse.tm4.org/metadata2/metadata-summary-plot?category_a=${numeric}&comparison=${this.comparisonType}`
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        console.log("histo res: ", res)
        // this.dataSize = res['rows'].length;
        // for (let i = 0; i < res['rows'].length; i++) {
        //   let num = res['rows'][i][1];
        //   this.min = Math.min(num, this.min);
        //   this.max = Math.max(num, this.max);
        //   this.histogramData.push(num);
        // }
        let numberOfBins = 20;
        this.min = res["data"][0]["x0"];
        this.max = res["data"][numberOfBins - 1]["x1"]
        this.histogramData = res["data"]
        if (this.histogramData.length === 0) {
          this.hideHistogram = true
        } else {
          this.createHistogram()
        }

      })
  }

  getG2GGeneData(numeric) {
    // let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++GENE_EXPRESSION%0D%0Afrom%0D%0A++expression%0D%0Awhere%0D%0A++ENSG+is+"${numeric}"`
    // let queryURL = `${apiUrl}${annotationUrl}`;
    let queryURL = `https://api.seahorse.tm4.org/metadata2/metadata-summary-plot?category_a=${numeric}&comparison=${this.comparisonType}`
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        // this.dataSize = res['rows'].length;
        // for (let i = 0; i < res['rows'].length; i++) {
        //   let num = res['rows'][i][1];
        //   this.min = Math.min(num, this.min);
        //   this.max = Math.max(num, this.max);
        //   this.histogramData.push(num);
        // }
        let numberOfBins = 20;
        this.min = res["data"][0]["x0"];
        this.max = res["data"][numberOfBins - 1]["x1"]
        this.histogramData = res["data"]
        if (this.histogramData.length === 0) {
          this.hideHistogram = true
        } else {
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

    d3.select("#my_histogram")
      .selectAll('svg')
      .remove();

    // append the svg object to the body of the page
    var svg = d3.select("#my_histogram")
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
      return d.count;
    })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
      .call(d3.axisLeft(y));

    console.log("bins: ", bins)

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
