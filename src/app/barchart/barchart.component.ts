import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class BarChartComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    // let numeric = 'SMATSSCR'
    let categorical = 'SMTSD'
    this.getData(categorical);
  }

  barChartData = [];
  categoryArr = [];
  categoryCount = {}
  countArr = [];
  maxCount = 1;
  min = Infinity;
  max = -Infinity;

  getData(categoric) {
    let apiUrl = "http://3.143.251.117:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++${categoric}%0D%0Afrom%0D%0A++annotations%0D%0Awhere%0D%0A++${categoric}+is+not+""`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        for (let i = 0; i < res['rows'].length; i++) {
          let cat = res['rows'][i][1];
          if(!this.categoryArr.includes(cat)){
            this.categoryArr.push(cat);
            this.categoryCount[cat] = 1;
          }else{
            this.categoryCount[cat] += 1;
            this.maxCount = Math.max(this.categoryCount[cat], this.maxCount);
          }
        }

        for(let cat in this.categoryCount){
          let temp = {
            "name": cat,
            "count": this.categoryCount[cat]
          }
          this.countArr.push(temp)
        }
        this.createBoxPlot()
      })
  }
  sumstat = []

  createBoxPlot() {
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 150, left: 100 },
      width = 800 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_barchart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

      // X axis
      var x = d3.scaleBand()
        .range([0, width])
        .domain(this.countArr.map(function (d) { return d.name; }))
        .padding(0.2);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, this.maxCount])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Bars
      svg.selectAll("mybar")
        .data(this.countArr)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.name); })
        .attr("y", function (d) { return y(d.count); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.count); })
        .attr("fill", "#69b3a2")

  }
}
