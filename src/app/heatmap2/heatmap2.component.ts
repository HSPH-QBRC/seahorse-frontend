import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
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

export class Heatmap2Component implements OnInit, OnChanges {
  @Input() metadataId = '';
  @Input() metadata2Id = '';
  xAxisArr = [];
  yAxisArr = [];
  fullXAxisArr = [];
  heatMapData = [];
  min = Infinity;
  max = -Infinity;
  tooltipOffsetX = 10;
  orderArr = [];
  annotationsDict = [];
  countDict = {};
  maxCount = 1;
  isLoading = false;

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {

    this.isLoading = true;
    let categorical1 = this.metadataId;
    let categorical2 = this.metadata2Id;
    this.getData(categorical1, categorical2);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.resetVariables()

    this.isLoading = true;
    let categorical1 = this.metadataId;
    let categorical2 = this.metadata2Id;
    this.getData(categorical1, categorical2);
  }

  resetVariables() {
    this.xAxisArr = [];
    this.yAxisArr = [];
    this.fullXAxisArr = [];
    this.heatMapData = [];
    this.min = Infinity;
    this.max = -Infinity;
    this.orderArr = [];
    this.annotationsDict = [];
    this.countDict = {};
    this.maxCount = 1;
  }

  getData(categorical1, categorical2) {
    //Create annotations look up table too identify metadata for genes
    let apiUrl = "//3.143.251.117:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++${categorical1}%2C%0D%0A++${categorical2}%0D%0Afrom%0D%0A++annotations%0D%0Awhere%0D%0A++${categorical1}+is+not+%22%22%0D%0A++AND+${categorical2}+is+not+%22%22%0D%0A`
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
            this.countDict[tempString] = 1;
          } else {
            this.countDict[tempString] += 1;
            this.maxCount = Math.max(this.maxCount, this.countDict[tempString]);
          }
          this.annotationsDict.push(temp)
        }

        //Used to handle the empty spaces on the heatmap
        for (let i = 0; i < this.xAxisArr.length; i++) {
          for (let j = 0; j < this.yAxisArr.length; j++) {
            let tempString = this.xAxisArr[i] + '_' + this.yAxisArr[j];
            if (this.countDict[tempString] === undefined) {
              this.countDict[tempString] = 0;
              let temp = {
                "name": "",
                "xValue": this.xAxisArr[i],
                "yValue": this.yAxisArr[j]
              }
              this.annotationsDict.push(temp)
            }
          }
        }
        this.heatMapData = this.annotationsDict
        this.createHeatMap()
      })
  }



  createHeatMap() {
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 200, bottom: 100, left: 100 },
      width = 1000 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

    const pointTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event, d) => {
        let temp = d.xValue + "_" + d.yValue;
        let tipBox = `<div><div class="category">Name: </div> ${d.name.length === 0 ? "N/A" : d.name}</div>
    <div><div class="category">${this.metadataId}: </div> ${d.xValue}</div>
    <div><div class="category">${this.metadata2Id}:  </div>${d.yValue}</div>
    <div><div class="category">Count:  </div>${this.countDict[temp]}</div>`
        return tipBox
      });

    d3.select("#my_heatmap2")
      .selectAll('svg')
      .remove();

    // append the svg object to the body of the page
    var svg = d3.select("#my_heatmap2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    svg.call(pointTip);

    // Build X scales and axis:
    var x = d3.scaleBand()
      .range([0, width])
      .domain(this.xAxisArr)
      .padding(-0.02)

    let rotateText = (this.xAxisArr[0].length > 5) ? "translate(0,0)rotate(-65)" : "translate(10,10)rotate(0)";
    let xAxisLabels = (this.xAxisArr.length > 50) ? d3.axisBottom(x).tickFormat((d) => '').tickSize(0) : d3.axisBottom(x)
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisLabels)
      .selectAll("text")
      .style("text-anchor", "middle")
      .call(wrap, width / this.xAxisArr.length)
      // .attr("dx", "-.8em")
      // .attr("dy", ".15em")
      // .attr("transform", rotateText);

    // Build X scales and axis:
    var y = d3.scaleBand()
      .range([height, 0])
      .domain(this.yAxisArr)
    let yAxisLabels = (this.yAxisArr.length > 25) ? d3.axisLeft(y).tickFormat((d) => '').tickSize(0) : d3.axisLeft(y);
    svg.append("g")
      .call(yAxisLabels)


    // Build color scale
    var myColor = d3.scaleLinear()
      // @ts-ignore
      .range(["royalblue", "crimson"])
      .domain([0, this.maxCount])

    let countLookUp = this.countDict

    svg.selectAll()
      .data(this.heatMapData)
      .enter()
      .append("rect")
      .attr("x", function (d) { return x(d.xValue) })
      .attr("y", function (d) { return y(d.yValue) })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        let stringConcat = d.xValue + "_" + d.yValue;
        return myColor(countLookUp[stringConcat])
      })
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

    // //Legend
    var countColorData = [{ "color": "royalblue", "value": 0 }, { "color": "crimson", "value": this.maxCount }];
    var extent = d3.extent(countColorData, d => d.value);

    var paddingGradient = 9;
    var widthGradient = 250;
    var innerWidth = widthGradient - (paddingGradient * 2);
    var barHeight = 8;
    var heightGradient = 100;

    var xScaleCorr = d3.scaleLinear()
      .range([0, innerWidth - 100])
      .domain(extent);

    // var xTicks = countColorData.filter(f => f.value === this.min || f.value === this.max).map(d => d.value);
    let xTicksCorr = [0, this.maxCount]

    var xAxisGradient = d3.axisBottom(xScaleCorr)
      .tickSize(barHeight * 2)
      .tickValues(xTicksCorr);

    var countLegend = d3.select("#my_heatmap2").select("svg")
      .append("svg")
      .attr("width", widthGradient)
      .attr("height", heightGradient)
      .attr('x', width + 100)
      .attr('y', 100);

    var defs = countLegend.append("defs");
    var linearGradient = defs
      .append("linearGradient")
      .attr("id", "myGradient");

    linearGradient.selectAll("stop")
      .data(countColorData)
      .enter().append("stop")
      .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
      .attr("stop-color", d => d.color)

    var g = countLegend.append("g")
      .attr("transform", `translate(${paddingGradient + 10}, 30)`)

    g.append("rect")
      .attr("width", innerWidth - 100)
      .attr("height", barHeight)
      .style("fill", "url(#myGradient)");

    countLegend.append('text')
      .attr('y', 20)
      .attr('x', 17)
      .style('fill', 'rgba(0,0,0,.7)')
      .style('font-size', '11px')
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("Count");

    g.append("g")
      .call(xAxisGradient)
      .select(".domain")

    function wrap(text, width) {
      text.each(function () {
        var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    }
  }
}
