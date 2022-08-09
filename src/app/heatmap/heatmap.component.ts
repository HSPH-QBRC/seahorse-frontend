import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import * as d3 from 'd3';
// import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss']
})

export class HeatmapComponent implements OnInit {
  xAxisArr = [];
  yAxisArr = [];
  heatMapData = [];
  min = 10000;
  max = 0;
  tooltipOffsetX = 10;
  orderArr = [];

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.getData(1000, 0)
  }

  getData(limit, page) {
    let tissue = "Pituitary";
    let corrFront = "http://3.143.251.117:8001/gtex.json?";
    let test = `sql=select%0D%0A++*%0D%0Afrom%0D%0A++correlations%0D%0A++join+annotations+on+correlations.Sample1+%3D+annotations.sample_id%0D%0Awhere%0D%0A++"tissue"+%3D+"${tissue}"%0D%0Aorder+by%0D%0A++"Sample1+Order"+asc%0D%0Alimit%0D%0A++${limit}`;
    let test2 = `sql=select%0D%0A++*%0D%0Afrom%0D%0A++correlations%0D%0A++join+annotations+on+correlations.Sample1+%3D+annotations.sample_id%0D%0Awhere%0D%0A++"tissue"+%3D+"${tissue}"%0D%0Aorder+by%0D%0A++"Sample1+Order"+asc%0D%0Alimit%0D%0A++${limit}%0D%0Aoffset%0D%0A++${limit * page}`

    // let annotations = 'http://3.143.251.117:8001/gtex.json?sql=select+*+from+correlations'
    let queryURL = `${corrFront}${test2}`;
    this.httpClient.get(queryURL).subscribe(res => {
      for (let i = 0; i < res['rows'].length; i++) {
        let currX = res['rows'][i][0]
        let currY = res['rows'][i][1]
        let correlationValue = res['rows'][i][4];

        if (correlationValue < this.min) {
          this.min = correlationValue;
        }
        if (correlationValue > this.max) {
          this.max = correlationValue;
        }
        if (!this.xAxisArr.includes(currX)) {
          this.xAxisArr.push(currX)
        }
        if (!this.yAxisArr.includes(currY)) {
          this.yAxisArr.push(currY)
        }

        let currOrder = res['rows'][i][2]
        let currOrderY = res['rows'][i][3]
        this.orderArr[currOrder] = currX;
        this.orderArr[currOrderY] = currY;

        let temp = {
          xValue: currX,
          yValue: currY,
          value: correlationValue
        }
        this.heatMapData.push(temp);


      }
      if (res["rows"].length === limit && page <= 50) {
        console.log(res["rows"].length, page)
        this.getData(limit, page + 1)
      } else {
        console.log("got to create the heatmap: ", res["rows"].length, page)
        this.createHeatMap()
      }

    })
  }

  createHeatMap() {
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 200, left: 200 },
      width = 1000 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;
    // tool tip for individual points (if displayed)

    // const pointTip = d3Tip()
    //   .attr('class', 'd3-tip')
    //   .offset([-10, 0])
    //   .html((event, d) => {
    //     // let xAxisDescription = this.isGene ? 'Gene' : 'Transcription Factor';
    //     let tipBox = `<div><div class="category">Sample 1:</div> ${d.xValue}</div>
    // <div><div class="category">Sample 2</div> ${d.yValue}</div>
    // <div><div class="category">Value: </div>${d.value}</div>`
    //     return tipBox
    //   });

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Labels of row and columns
    // let myGroups = this.xAxisArr
    // let myVars = this.xAxisArr
    let xGroup = this.orderArr
    let yGroup = this.orderArr

    // Build X scales and axis:
    var x = d3.scaleBand()
      .range([0, width])
      .domain(xGroup)
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
      .domain(yGroup)
      .padding(0.01);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Build color scale
    var myColor = d3.scaleLinear()
      // @ts-ignore
      .range(["royalblue", "crimson",])
      .domain([this.min, this.max])

    //Read the data
    // d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv").then(data => {
    // console.log(data)
    let data = this.heatMapData
    // svg.selectAll()
    //   .data(data, d => { return d.xValue + ':' + d.yValue; })
    //   .enter()
    //   .append("rect")
    //   .attr("x", d => {
    //     return x(d.xValue)
    //   })
    //   .attr("y", d => { return y(d.yValue) })
    //   .attr("width", x.bandwidth())
    //   .attr("height", y.bandwidth())
    //   .style("fill", (d) => { return myColor(parseInt(d.value)) })
    // })

    svg.selectAll()
      .data(data, function (d) { return `${d.xValue}:${d.yValue}` })
      .join("rect")
      .attr("x", function (d) { return x(d.xValue) })
      .attr("y", function (d) { return y(d.yValue) })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        return myColor(d.value)
      })
    // .on('mouseover', function (mouseEvent: any, d) {
    //   pointTip.show(mouseEvent, d, this);
    //   pointTip.style('left', mouseEvent.x  + 'px');
    // })
    // .on('mouseout', pointTip.hide);

    //used too fill in the missing ones on top or bottom half
    svg.selectAll()
      .data(data, function (d) { return `${d.yValue}:${d.xValue}` })
      .join("rect")
      .attr("x", function (d) { return x(d.yValue) })
      .attr("y", function (d) { return y(d.xValue) })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        return myColor(d.value)
      })

    svg.append('text')
      .classed('label', true)
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -height / 2)
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text('Sample 2');

    svg
      .append('text')
      .classed('label', true)
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('text-anchor', 'end')
      .text('Sample 1');


  }
}
