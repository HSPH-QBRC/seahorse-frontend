import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import { nest } from 'd3-collection';
import * as d3Collection from 'd3-collection';

@Component({
  selector: 'app-boxplot',
  templateUrl: './boxplot.component.html',
  styleUrls: ['./boxplot.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class BoxPlotComponent implements OnInit, OnChanges {
  @Input() metadataCatId = '';
  @Input() metadataNumId = '';

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    // let numeric = 'SMATSSCR'
    // let categorical = 'SME1ANTI'
    let categorical = this.metadataCatId;
    let numeric = this.metadataNumId;
    console.log("num/cat: ", numeric, categorical)
    this.getData(numeric, categorical);


  }

  ngOnChanges(changes: SimpleChanges): void {
    // let numeric = this.metadataNumId;
    // let categorical = this.metadataCatId;
    // this.getData(numeric, categorical);
  }

  boxPlotData = [];
  min = Infinity;
  max = -Infinity;
  xAxisArr= [];

  getData(numericId, categoricalId) {
    let apiUrl = "http://3.143.251.117:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++${numericId}%2C%0D%0A++${categoricalId}%0D%0Afrom%0D%0A++annotations%0D%0Awhere%0D%0A++${numericId}+is+not+""%0D%0A++AND+${categoricalId}+is+not+""%0D%0A`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        console.log("res: ",res)
        for (let i = 0; i < res['rows'].length; i++) {
          if (res['rows'][i][2] < this.min) {
            this.min = res['rows'][i][2];
          }
          if (res['rows'][i][2] > this.max) {
            this.max = res['rows'][i][2];
          }
          if(!this.xAxisArr.includes(res['rows'][i][1].toString())){
            this.xAxisArr.push(res['rows'][i][1].toString())
          }
          let temp = {
            'name': res['rows'][i][0],
            'key': res['rows'][i][1],
            'value': res['rows'][i][2]
          };

          this.boxPlotData.push(temp);
        }
        console.log("boxplot: ",this.boxPlotData, this.xAxisArr)
        this.createBoxPlot()
      })
  }
  sumstat = []

  createBoxPlot() {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 100 },
      width = 800 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_boxplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
    this.sumstat = d3Collection.nest() // nest function allows to group the calculation per level of a factor
      .key(function (d) { return d.key; })
      .rollup(function (d) {
        let q1 = d3.quantile(d.map(function (g) { return g.value; }).sort(d3.ascending), .25)
        let median = d3.quantile(d.map(function (g) { return g.value; }).sort(d3.ascending), .5)
        let q3 = d3.quantile(d.map(function (g) { return g.value; }).sort(d3.ascending), .75)
        let interQuantileRange = q3 - q1
        let min = q1 - 1.5 * interQuantileRange
        let max = q3 + 1.5 * interQuantileRange
        return ({ q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max })
      })
      .entries(this.boxPlotData)

    // Show the X scale
    var x = d3.scaleBand()
      .range([0, width])
      .domain(this.xAxisArr)
      .paddingInner(1)
      .paddingOuter(.5)
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))

    // Show the Y scale
    var y = d3.scaleLinear()
      .domain([this.min, this.max])
      .range([height, 0])
    svg.append("g").call(d3.axisLeft(y))

    // Show the main vertical line
    svg
      .selectAll("vertLines")
      .data(this.sumstat)
      .enter()
      .append("line")
      .attr("x1", function (d) { return (x(d.key)) })
      .attr("x2", function (d) { return (x(d.key)) })
      .attr("y1", function (d) { return (y(d.value.min)) })
      .attr("y2", function (d) { return (y(d.value.max)) })
      .attr("stroke", "black")
      .style("width", 40)

    // // rectangle for the main box
    var boxWidth = 100
    svg
      .selectAll("boxes")
      .data(this.sumstat)
      .enter()
      .append("rect")
      .attr("x", function (d) { return (x(d.key) - boxWidth / 2) })
      .attr("y", function (d) { return (y(d.value.q3)) })
      .attr("height", function (d) { return (y(d.value.q1) - y(d.value.q3)) })
      .attr("width", boxWidth)
      .attr("stroke", "black")
      .style("fill", "#69b3a2")

    // // Show the median
    svg
      .selectAll("medianLines")
      .data(this.sumstat)
      .enter()
      .append("line")
      .attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
      .attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
      .attr("y1", function (d) { return (y(d.value.median)) })
      .attr("y2", function (d) { return (y(d.value.median)) })
      .attr("stroke", "black")
      .style("width", 80)
  }

  refreshData() {
    this.boxPlotData = [];
    this.min = Infinity;
    this.max = -Infinity;
  }
}
