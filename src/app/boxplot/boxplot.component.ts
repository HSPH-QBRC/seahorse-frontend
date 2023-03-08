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
  @Input() metadataLookUp = {};
  @Input() typeOfLookUp = 'mcc';
  @Input() symbolId = '';

  isLoading = false;
  boxPlotData = [];
  min = Infinity;
  max = -Infinity;
  xAxisArr = [];
  sumstat = [];

  limit = 1000;
  offset = 0;
  lengthOfResult = 0;

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    this.noData = false
    this.offset = 0;
    this.lengthOfResult = 0;
    this.resetVariables()
    this.isLoading = true;
    let numeric = this.metadataCatId;
    let categorical = this.metadataNumId;
    if (this.typeOfLookUp === 'mcc') {
      this.getDataMCC(numeric, categorical);
    } else if (this.typeOfLookUp === 'm2g') {
      this.getDataM2G(numeric, categorical);
    }

  }

  resetVariables() {
    this.boxPlotData = [];
    this.min = Infinity;
    this.max = -Infinity;
    this.xAxisArr = [];
  }
  tempBPData = [];

  getDataMCC(numericId, categoricalId) {
    console.log("mcc: ", numericId, categoricalId)
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++${numericId}%2C%0D%0A++${categoricalId}%0D%0Afrom%0D%0A++annotations%0D%0Awhere%0D%0A++${numericId}+is+not+""%0D%0A++AND+${categoricalId}+is+not+""%0D%0A`
    // let queryURL = `${apiUrl}${annotationUrl}`;
    // let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=SMTS&category_b=SMEXPEFF&comparison=m2m`
    let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=${numericId}&category_b=${categoricalId}&comparison=m2m`
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        console.log("bp data: ", res["boxplot"])
        this.tempBPData = res["boxplot"]["boxPlotData"]
        this.isLoading = false;
        if (this.tempBPData.length === 0) {
          this.noData = true
        } else {
          for (let i = 0; i < this.tempBPData.length; i++) {
            if (this.tempBPData[i]["value"]["min"] < this.min) {
              this.min = this.tempBPData[i]["value"]["min"];
            }
            if (this.tempBPData[i]["value"]["max"] > this.max) {
              this.max = this.tempBPData[i]["value"]["max"];
            }
            if (!this.xAxisArr.includes(this.tempBPData[i]["key"].toString())) {
              this.xAxisArr.push(this.tempBPData[i]["key"].toString())
            }
            // let temp = {
            //   'name': res['rows'][i][0],
            //   'key': res['rows'][i][1],
            //   'value': res['rows'][i][2]
            // };
            // this.boxPlotData.push(temp);
          }
          this.createBoxPlot()
        }


      })
  }
  noData = false
  getDataM2G(numericId, categoricalId) {
    console.log("m2g: ", numericId, categoricalId)
    let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++ANN.SAMPID%2C%0D%0A++ANN.${categoricalId}%2C%0D%0A++EXP.GENE_EXPRESSION%0D%0Afrom%0D%0A++annotations+as+ANN%0D%0A++join+expression+as+EXP+on+ANN.SAMPID+%3D+EXP.SAMPID%0D%0Awhere%0D%0A++"ENSG"+like+"${numericId}%"%0D%0A++AND+"${categoricalId}"+is+not+""%0D%0A++AND+"GENE_EXPRESSION"+is+not+""%0D%0Alimit%0D%0A++${this.offset}%2C+${this.limit}`
    // let queryURL = `${apiUrl}${annotationUrl}`;
    // let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=SMTS&category_b=ENSG00000180806&comparison=m2g`
    let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=${categoricalId}&category_b=${numericId}&comparison=m2g`
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        console.log("bpdata: ", res["boxplot"])
        this.tempBPData = res["boxplot"]["boxPlotData"];
        if (this.tempBPData.length === 0) {
          this.noData = true
        } else {
          for (let i = 0; i < this.tempBPData.length; i++) {
            if (this.tempBPData[i]["value"]["min"] < this.min) {
              this.min = this.tempBPData[i]["value"]["min"];
            }
            if (this.tempBPData[i]["value"]["max"] > this.max) {
              this.max = this.tempBPData[i]["value"]["max"];
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

  small = true

  createBoxPlot() {
    // set the dimensions and margins of the graph
    // var margin = { top: 10, right: 30, bottom: 100, left: 100 },
    //   width = 800 - margin.left - margin.right,
    //   height = 500 - margin.top - margin.bottom;

    //FOR SMALL SIZE
    if (this.small = true) {
      var margin = { top: 5, right: 15, bottom: 50, left: 50 },
        width = 300 - margin.left - margin.right,
        height = 230 - margin.top - margin.bottom;
    } else {
      var margin = { top: 10, right: 30, bottom: 100, left: 100 },
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    }


    d3.select(".my_boxplot_" + this.metadataCatId)
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
    var svg = d3.select(".my_boxplot_" + this.metadataCatId)
      .append("svg")
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
      .attr("width", 300)
      .attr("height", 230)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    svg.call(pointTip);
    svg.call(yAxisTip);
    svg.call(xAxisTip);

    let tempMin = this.min
    let tempMax = this.max

    // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
    // this.sumstat = d3Collection.nest() // nest function allows to group the calculation per level of a factor
    //   .key(function (d) { return d.key; })
    //   .rollup(function (d) {
    //     let q1 = d3.quantile(d.map(function (g) { return g.value; }).sort(d3.ascending), .25)
    //     let median = d3.quantile(d.map(function (g) { return g.value; }).sort(d3.ascending), .5)
    //     let q3 = d3.quantile(d.map(function (g) { return g.value; }).sort(d3.ascending), .75)
    //     let interQuantileRange = q3 - q1
    //     let min = q1 - 1.5 * interQuantileRange
    //     let max = q3 + 1.5 * interQuantileRange

    //     tempMin = Math.min(min, tempMin)
    //     tempMax = Math.max(max, tempMax)
    //     return ({ q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max })
    //   })
    //   .entries(this.boxPlotData)
    this.sumstat = this.tempBPData

    this.min = tempMin > 0 ? tempMin * .8 : (tempMin != 0 ? tempMin * 1.2 : -(this.max / 4));


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
      .style("font-size", "4px") //only for small size
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
    // var boxWidth = 20
    var boxWidth = 10
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

    if (this.typeOfLookUp === 'mcc' && this.metadataLookUp[this.metadataNumId].vardesc[0].length > 50) {
      svg.append('text')
        .classed('label', true)
        .attr('transform', 'rotate(-90)')
        .attr("font-weight", "bold")
        .attr('y', -margin.left + 10)
        .attr('x', -height / 2)
        .attr('dy', '.71em')
        .style('fill', 'rgba(0,0,0,.8)')
        .style('text-anchor', 'middle')
        // .style('font-size', '8px')
        .style('font-size', '4px')
        // .text(this.metadataNumId)
        .text(this.metadataLookUp[this.metadataNumId].vardesc[0].slice(0, 50) + "...")
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
        // .style('font-size', '12px')
        .style('font-size', '6px')
        // .text(this.metadataNumId)
        .text(this.metadataLookUp[this.metadataNumId].vardesc[0].slice(0, 30) + "...")

    }

    // svg.append('text')
    //   .classed('label', true)
    //   .attr('transform', 'rotate(-90)')
    //   .attr("font-weight", "bold")
    //   .attr('y', -margin.left + 10)
    //   .attr('x', -height / 2)
    //   .attr('dy', '.71em')
    //   .style('fill', 'rgba(0,0,0,.8)')
    //   .style('text-anchor', 'middle')
    //   .style('font-size', '12px')
    //   .text(this.metadataNumId);

    if (this.typeOfLookUp === 'mcc' && this.metadataLookUp[this.metadataCatId].vardesc[0].length > 50) {
      svg
        .append('text')
        .classed('label', true)
        .attr("font-weight", "bold")
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .style('fill', 'rgba(0,0,0,.8)')
        .style('text-anchor', 'middle')
        // .style('font-size', '8px')
        .style('font-size', '4px')
        // .text(this.metadataCatId)
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
        .attr('y', height + margin.bottom - 10)
        .style('fill', 'rgba(0,0,0,.8)')
        .style('text-anchor', 'middle')
        // .style('font-size', '12px')
        .style('font-size', '6px')
        .text(this.getXAxisLabelNames())
      // .text(this.typeOfLookUp === 'mcc' ? this.metadataLookUp[this.metadataCatId].vardesc[0] : this.symbolId === undefined ? this.metadataCatId : this.symbolId);
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
  }

  refreshData() {
    this.boxPlotData = [];
    this.min = Infinity;
    this.max = -Infinity;
  }

  getXAxisLabelNames() {
    switch (this.typeOfLookUp) {
      case 'mcc':
        return this.metadataLookUp[this.metadataCatId].vardesc[0]
      case 'm2g':
        return this.symbolId === undefined ? this.metadataCatId : this.symbolId
      default:
        return "N/A"
    }
  }
}
