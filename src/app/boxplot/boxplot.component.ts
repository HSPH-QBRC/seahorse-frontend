import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-boxplot',
  templateUrl: './boxplot.component.html',
  styleUrls: ['./boxplot.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class BoxPlotComponent implements OnChanges {
  @Input() metadataCatId = '';
  @Input() metadataNumId = '';
  @Input() metadataLookUp = {};
  @Input() typeOfLookUp = 'm2m';
  @Input() symbolId = '';
  @Input() size = 'small';
  @Input() tissue = '';
  @Output() svgReady = new EventEmitter();
  @Output() svgLoaded = new EventEmitter();
  private readonly API_URL = environment.API_URL;

  isLoading = false;
  boxPlotData = [];
  min = Infinity;
  max = -Infinity;
  xAxisArr = [];
  sumstat = [];

  limit = 1000;
  offset = 0;
  lengthOfResult = 0;

  bpSVG

  tempBPData = [];
  noData = false;

  constructor(private httpClient: HttpClient) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.noData = false
    this.offset = 0;
    this.lengthOfResult = 0;
    this.resetVariables()
    this.isLoading = true;
    let numeric = this.metadataCatId;
    let categorical = this.metadataNumId;
    if (this.typeOfLookUp === 'm2m') {
      this.getDataM2M(numeric, categorical);
    } else if (this.typeOfLookUp === 'm2g') {
      this.getDataM2G(this.metadataNumId, this.metadataCatId);
    }
  }

  resetVariables() {
    this.boxPlotData = [];
    this.min = Infinity;
    this.max = -Infinity;
    this.xAxisArr = [];
  }

  getDataM2M(numericId, categoricalId) {
    let queryURL = `${this.API_URL}/summary-plot/?category_a=${numericId}&category_b=${categoricalId}&comparison=m2m&tissue=${this.tissue}`

    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.tempBPData = res["boxplot"]["boxPlotData"];
        this.isLoading = false;
        if (this.tempBPData.length === 0) {
          this.noData = true
        } else {
          for (let i = 0; i < this.tempBPData.length; i++) {
            if (this.tempBPData[i]["value"]["lower_whisker"] < this.min) {
              this.min = this.tempBPData[i]["value"]["lower_whisker"];
            }
            if (this.tempBPData[i]["value"]["upper_whisker"] > this.max) {
              this.max = this.tempBPData[i]["value"]["upper_whisker"];
            }
            if (!this.xAxisArr.includes(this.tempBPData[i]["key"].toString())) {
              this.xAxisArr.push(this.tempBPData[i]["key"].toString())
            }
          }
          this.createBoxPlot()
        }
      })
  }
  
  getDataM2G(numericId, categoricalId) {
    let queryURL = `${this.API_URL}/summary-plot/?category_a=${categoricalId}&category_b=${numericId}&comparison=m2g&tissue=${this.tissue}`
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.tempBPData = res["boxplot"]["boxPlotData"];
        if (this.tempBPData.length === 0) {
          this.noData = true
        } else {
          for (let i = 0; i < this.tempBPData.length; i++) {
            if (this.tempBPData[i]["value"]["lower_whisker"] < this.min) {
              this.min = this.tempBPData[i]["value"]["lower_whisker"];

            }
            if (this.tempBPData[i]["value"]["upper_whisker"] > this.max) {
              this.max = this.tempBPData[i]["value"]["upper_whisker"];
            }
            if (!this.xAxisArr.includes(this.tempBPData[i]["key"].toString())) {
              this.xAxisArr.push(this.tempBPData[i]["key"].toString())
            }
          }
          this.createBoxPlot()
        }
        this.isLoading = false;
      })
  }

  createBoxPlot() {
    if (this.size === "small") {
      var margin = { top: 5, right: 15, bottom: 50, left: 50 },
        width = 300 - margin.left - margin.right,
        height = 230 - margin.top - margin.bottom;
    } else {
      var margin = { top: 10, right: 30, bottom: 100, left: 100 },
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    }

    d3.select(".my_boxplot_" + this.metadataCatId + "_" + this.metadataNumId.split(".")[0] + "_" + this.size)
      .selectAll('svg')
      .remove();

    const pointTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event, d) => {
        let tipBox = `<div><div class="category">Name: </div> ${d.key}</div>
    <div><div class="category">Max: </div> ${d.value.upper_whisker.toFixed(2)}</div>
    <div><div class="category">Q3: </div> ${d.value.q3.toFixed(2)}</div>
    <div><div class="category">Median: </div> ${d.value.median.toFixed(2)}</div>
    <div><div class="category">Q1: </div> ${d.value.q1.toFixed(2)}</div>
    <div><div class="category">Min: </div> ${d.value.lower_whisker.toFixed(2)}</div>`
        return tipBox
      });

    const yAxisTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event) => {
        let tipBox = `<div><div class="category">Y Axis: ${this.metadataLookUp[this.metadataNumId].vardescFull}</div> </div>`
        return tipBox
      });

    const xAxisTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event) => {
        let tipBox = `<div><div class="category">X Axis: ${this.metadataLookUp[this.metadataCatId].vardescFull}</div> </div>`
        return tipBox
      });

    // append the svg object to the body of the page
    var svg = d3.select(".my_boxplot_" + this.metadataCatId + "_" + this.metadataNumId.split(".")[0] + "_" + this.size)
      .append("svg")
      .attr("width", this.size === 'small' ? 300 : width + margin.left + margin.right)
      .attr("height", this.size === 'small' ? 230 : height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    svg.call(pointTip);
    svg.call(yAxisTip);
    svg.call(xAxisTip);

    let tempMin = this.min
    this.sumstat = this.tempBPData

    this.min = tempMin > 0 ? tempMin - (this.max * .03) : (tempMin != 0 ? tempMin * 1.03 : -(this.max / 30));
    this.max = this.max * 1.03

    if (this.sumstat.length > 12) {
      this.sumstat.sort((b, a) => b.value.median - a.value.median)
      let slicedArr = this.sumstat.slice(0, 6).concat(this.sumstat.slice(this.sumstat.length - 6, this.sumstat.length))
      this.sumstat = slicedArr;
      this.xAxisArr = [];
      for (let i = 0; i < this.sumstat.length; i++) {
        this.xAxisArr.push(this.sumstat[i].key)
      }
    }

    // Show the X scale
    var x = d3.scaleBand()
      .range([0, width])
      .domain(this.xAxisArr)
      .paddingInner(1)
      .paddingOuter(.5)
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", this.size === 'small' ? "4px" : "12px") //only for small size
      .call(wrap, width / this.xAxisArr.length)

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
      .attr("y1", function (d) { return (y(d.value.lower_whisker)) })
      .attr("y2", function (d) { return (y(d.value.upper_whisker)) })
      .attr("stroke", "black")
      .style("width", 40)

    // // rectangle for the main box
    var boxWidth = this.size === 'small' ? 10 : 20
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
      .on('mouseover', function (mouseEvent: any, d) {
        pointTip.show(mouseEvent, d, this);
        pointTip.style('left', mouseEvent.x + 10 + 'px');
      })
      .on('mouseout', pointTip.hide);

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

    if (this.typeOfLookUp === 'm2m' && this.metadataLookUp[this.metadataNumId].vardesc[0].length > 50) {
      svg.append('text')
        .classed('label', true)
        .attr('transform', 'rotate(-90)')
        .attr("font-weight", "bold")
        .attr('y', -margin.left + 10)
        .attr('x', -height / 2)
        .attr('dy', '.71em')
        .style('fill', 'rgba(0,0,0,.8)')
        .style('text-anchor', 'middle')
        .style('font-size', this.size === 'small' ? '4px' : '8px')
        .text(this.metadataLookUp[this.metadataNumId].vardesc[0].length > 50 ? this.metadataLookUp[this.metadataNumId].vardesc[0].slice(0, 50) + "..." : this.metadataLookUp[this.metadataNumId].vardesc[0].slice(0, 50))
        .on('mouseover', function (mouseEvent: any) {
          yAxisTip.show(mouseEvent, this);
          yAxisTip.style('left', mouseEvent.x + 10 + 'px');
          d3.select(this).style("cursor", "pointer");
        })
        .on('mouseout', function (mouseEvent: any) {
          d3.select(this).style("cursor", "default");
        })
        .on('mouseout', yAxisTip.hide);
    } else {
      svg.append('text')
        .classed('label', true)
        .attr('transform', 'rotate(-90)')
        .attr("font-weight", "bold")
        .attr('y', -margin.left + 10)
        .attr('x', -height / 2)
        .attr('dy', '.71em')
        .style('fill', 'rgba(0,0,0,.8)')
        .style('text-anchor', 'middle')
        .style('font-size', this.size === 'small' ? '6px' : '12px')
        .text(this.typeOfLookUp === 'm2g' ? this.metadataNumId : (this.metadataLookUp[this.metadataNumId].vardesc[0].length > 30 ? this.metadataLookUp[this.metadataNumId].vardesc[0].slice(0, 30) + "..." : this.metadataLookUp[this.metadataNumId].vardesc[0]))

    }

    if (this.typeOfLookUp === 'm2m' && this.metadataLookUp[this.metadataCatId].vardesc[0].length > 50) {
      svg
        .append('text')
        .classed('label', true)
        .attr("font-weight", "bold")
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .style('fill', 'rgba(0,0,0,.8)')
        .style('text-anchor', 'middle')
        .style('font-size', this.size === 'small' ? '6px' : '12px')
        .text(this.metadataLookUp[this.metadataCatId].vardesc[0].slice(0, 50) + "...")
        .on('mouseover', function (mouseEvent: any) {
          xAxisTip.show(mouseEvent, this);
          xAxisTip.style('left', mouseEvent.x + 10 + 'px');
          d3.select(this).style("cursor", "pointer");
        })
        .on('mouseout', function (mouseEvent: any) {
          d3.select(this).style("cursor", "default");
        })
        .on('mouseout', xAxisTip.hide);
    } else {
      svg
        .append('text')
        .classed('label', true)
        .attr("font-weight", "bold")
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 20)
        .style('fill', 'rgba(0,0,0,.8)')
        .style('text-anchor', 'middle')
        .style('font-size', this.size === 'small' ? '6px' : '12px')
        .text(this.getXAxisLabelNames())
    }

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
    this.bpSVG = svg
  }

  refreshData() {
    this.boxPlotData = [];
    this.min = Infinity;
    this.max = -Infinity;
  }

  getXAxisLabelNames() {
    switch (this.typeOfLookUp) {
      case 'm2m':
        return this.metadataLookUp[this.metadataCatId].vardesc[0]
      case 'm2g':
        return this.metadataCatId
      default:
        return "N/A"
    }
  }

  onImageClicked(event: Event) {
    const svg = ''
    this.svgLoaded.emit(svg);
  }
}
