import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";

@Component({
  selector: 'app-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class ScatterPlotComponent implements OnInit, OnChanges {
  @Input() metadataId = '';
  @Input() metadata2Id = '';
  isLoading = false;

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.isLoading = true;
    let numerical1 = this.metadataId;
    let numerical2 = this.metadata2Id
    this.refreshData();
    this.getData(numerical1, numerical2)
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading = true;
    let numerical1 = this.metadataId;
    let numerical2 = this.metadata2Id;
    this.refreshData();
    this.getData(numerical1, numerical2)
  }

  scatterPlotData = [];
  xMin = Infinity
  xMax = -Infinity
  yMin = Infinity
  yMax = -Infinity


  getData(numerical1, numerical2) {
    let apiUrl = "//3.143.251.117:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++${numerical1}%2C%0D%0A++${numerical2}%0D%0Afrom%0D%0A++annotations%0D%0Awhere%0D%0A++${numerical1}+is+not+""%0D%0A++AND+${numerical2}+is+not+""%0D%0A`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        for (let i = 0; i < res['rows'].length; i++) {
          if (res['rows'][i][1] < this.xMin) {
            this.xMin = res['rows'][i][1];
          }
          if (res['rows'][i][1] > this.xMax) {
            this.xMax = res['rows'][i][1];
          }
          if (res['rows'][i][2] < this.yMin) {
            this.yMin = res['rows'][i][2];
          }
          if (res['rows'][i][2] > this.yMax) {
            this.yMax = res['rows'][i][2];
          }

          let temp = {
            'name': res['rows'][i][0],
            'xValue': res['rows'][i][1],
            'yValue': res['rows'][i][2]
          };

          this.scatterPlotData.push(temp);
        }
        this.createScatterPlot()
      })

  }

  createScatterPlot() {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 100, left: 100 },
      width = 600 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

      const pointTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event, d) => {
        let tipBox = `<div><div class="category">Name:</div> ${d.name}</div>
    <div><div class="category">${this.metadataId}: </div> ${d.xValue}</div>
    <div><div class="category">${this.metadata2Id}: </div>${d.yValue}</div>`
        return tipBox
      });

    d3.select("#my_scatterplot")
      .selectAll('svg')
      .remove();

    // append the svg object to the body of the page
    var svg = d3.select("#my_scatterplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    svg.call(pointTip);

    // Add X axis
    var x = d3.scaleLinear()
      .domain([this.xMin, this.xMax])
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");


    // Add Y axis
    var y = d3.scaleLinear()
      .domain([this.yMin, this.yMax])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add dots
    svg.append('g')
      .selectAll("dot")
      .data(this.scatterPlotData)
      .enter()
      .append("circle")
      .attr("cx", function (d) { return x(d.xValue); })
      .attr("cy", function (d) { return y(d.yValue); })
      .attr("r", 1)
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
      .text(this.metadata2Id);

    svg
      .append('text')
      .classed('label', true)
      .attr("font-weight", "bold")
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('fill', 'rgba(0,0,0,.8)')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(this.metadataId);
  }

  refreshData() {
    this.scatterPlotData = [];
    this.xMin = Infinity
    this.xMax = -Infinity
    this.yMin = Infinity
    this.yMax = -Infinity
  }

}
