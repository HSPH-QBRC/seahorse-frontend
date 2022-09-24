import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";

@Component({
  selector: 'app-heatmap2',
  templateUrl: './heatmap2.component.html',
  styleUrls: ['./heatmap2.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class Heatmap2Component implements OnInit {
  xAxisArr = [];
  yAxisArr = [];
  fullXAxisArr = [];
  heatMapData = [];
  min = 10000;
  max = 0;
  tooltipOffsetX = 10;
  orderArr = [];
  tissue = "";
  annotationsDict = [];
  countDict = {};

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    let categorical1 = "SMTS"
    let categorical2 = "SMATSSCR"
    //Create annotations look up table too identify metadata for genes
    let apiUrl = "http://3.143.251.117:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++sample_id%2C%0D%0A++tissue%2C%0D%0A++sex%2C%0D%0A++age_range%2C%0D%0A++hardy_scale_death%0D%0Afrom%0D%0A++annotations%0D%0Alimit%0D%0A++20000`
    let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++${categorical1}%2C%0D%0A++${categorical2}%0D%0Afrom%0D%0A++annotations%0D%0Awhere%0D%0A++${categorical1}+is+not+%22%22%0D%0A++AND+${categorical2}+is+not+%22%22%0D%0A`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        for (let i = 0; i < res['rows'].length; i++) {
          let name = res['rows'][i][0];
          let xValue = res['rows'][i][1];
          let yValue = res['rows'][i][2];
          let temp = {
            name,
            xValue,
            yValue
          }
          if (!this.xAxisArr.includes(xValue)) {
            this.xAxisArr.push(xValue)
          }
          if (!this.yAxisArr.includes(yValue)) {
            this.yAxisArr.push(yValue)
          }

          //add counter dictionary
          let tempString = xValue + '_' + yValue;
          if (this.countDict[tempString] === undefined) {
            this.countDict[tempString] = 0;
          } else {
            this.countDict[tempString] += 1;
          }

          this.annotationsDict.push(temp)
        }
        this.heatMapData = this.annotationsDict
        this.createHeatMap()
      })
  }



  createHeatMap() {
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 100, left: 100 },
      width = 800 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_heatmap2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Labels of row and columns
    // var myGroups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    // var myVars = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"]

    // Build X scales and axis:
    var x = d3.scaleBand()
      .range([0, width])
      .domain(this.xAxisArr)
      .padding(0.01);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    // Build X scales and axis:
    var y = d3.scaleBand()
      .range([height, 0])
      .domain(this.yAxisArr)
      .padding(0.01);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Build color scale
    var myColor = d3.scaleLinear()
      // @ts-ignore
      .range(["blue", "red"])
      .domain([1, 100])

    //Read the data

    let test = this.countDict

    svg.selectAll()
      .data(this.heatMapData)
      .enter()
      .append("rect")
      .attr("x", function (d) { return x(d.xValue) })
      .attr("y", function (d) { return y(d.yValue) })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        let tempString = d.xValue + "_" + d.yValue;
        return myColor(test[tempString])
      })



  }
}
