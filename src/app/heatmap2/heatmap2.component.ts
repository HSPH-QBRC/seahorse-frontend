import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
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

export class Heatmap2Component implements OnChanges {
  @Input() metadataId = '';
  @Input() metadata2Id = '';
  @Input() metadataLookUp = {};
  @Input() typeOfLookUp = 'm2m';
  @Input() size = 'small';
  @Input() tissue = '';
  @Output() svg2Loaded = new EventEmitter();

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
  noData = false;
  showSmallSize = true;

  constructor(private httpClient: HttpClient) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.showSmallSize = this.size === 'small' ? true : false;
    this.noData = false;
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
    // let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++${categorical1}%2C%0D%0A++${categorical2}%0D%0Afrom%0D%0A++annotations%0D%0Awhere%0D%0A++${categorical1}+is+not+%22%22%0D%0A++AND+${categorical2}+is+not+%22%22%0D%0A`
    // let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++${categorical1}%2C%0D%0A++${categorical2}%0D%0Afrom%0D%0A++annotations%0D%0Awhere%0D%0A++${categorical1}+is+not+%22%22%0D%0A++AND+${categorical2}+is+not+%22%22%0D%0A`
    // let queryURL = `${apiUrl}${annotationUrl}`;
    let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=${categorical1}&category_b=${categorical2}&comparison=m2m&tissue=${this.tissue}`
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        this.isLoading = false;
        
        this.countDict = res["count_obj"]
        this.annotationsDict = res["rows"]
        this.heatMapData = res["rows"]
        for (let row of this.heatMapData) {
          let xValue = row["xValue"]
          let yValue = row["yValue"]
          if (!this.xAxisArr.includes(xValue)) {
            this.xAxisArr.push(xValue)
          }
          if (!this.yAxisArr.includes(yValue)) {
            this.yAxisArr.push(yValue)
          }
        }
        for (let index in this.countDict) {
          this.maxCount = Math.max(this.maxCount, this.countDict[index]);
        }

        if (res["rows"] && res["rows"].length > 0) {
          this.createHeatMap()
        } else {
          this.noData = true;
        }

      })
  }



  createHeatMap() {
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 150, bottom: 50, left: 100 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const pointTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event, d) => {
        let temp = d.xValue + "_" + d.yValue;
        let tipBox = `<div><div class="category">Name: </div> ${d.name.length === 0 ? "N/A" : d.name}</div>
    <div><div class="category">X Value: </div> ${d.xValue}</div>
    <div><div class="category">Y Value:  </div>${d.yValue}</div>
    <div><div class="category">Count:  </div>${this.countDict[temp]}</div>`
        return tipBox
      });

    const yAxisTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event) => {
        let tipBox = `<div><div class="category">Y Axis: ${this.metadataLookUp[this.metadata2Id].vardescFull}</div> </div>`
        return tipBox
      });

    const xAxisTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event) => {
        let tipBox = `<div><div class="category">X Axis: ${this.metadataLookUp[this.metadataId].vardescFull}</div> </div>`
        return tipBox
      });

    d3.select('.my_heatmap_' + this.metadataId + '_' + this.metadata2Id + '_' + this.size)
      .selectAll('svg')
      .remove();

    // append the svg object to the body of the page
    var svg = d3.select('.my_heatmap_' + this.metadataId + '_' + this.metadata2Id + '_' + this.size)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 460 600")
      .attr("width", this.showSmallSize ? 300 : width)
      .attr("height", this.showSmallSize ? 230 : height)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    svg.call(pointTip);
    svg.call(yAxisTip);
    svg.call(xAxisTip);

    // Build X scales and axis:
    var x = d3.scaleBand()
      .range([0, width])
      .domain(this.xAxisArr)
      .padding(-0.02)

    let rotateText = (this.xAxisArr[0].length > 5) ? "translate(-20,0)rotate(-65)" : "translate(10,10)rotate(0)";
    let xAxisLabels = (this.xAxisArr.length > 50) ? d3.axisBottom(x).tickFormat((d) => '').tickSize(0) : d3.axisBottom(x)
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisLabels)
      .selectAll("text")
      .style("text-anchor", "end")
      .call(wrap, width / this.xAxisArr.length)
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", rotateText);

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
      .attr("height", y.bandwidth() + 1)
      .style("fill", function (d) {
        let stringConcat = d.xValue + "_" + d.yValue;
        return myColor(countLookUp[stringConcat])
      })
      .on('mouseover', function (mouseEvent: any, d) {
        pointTip.show(mouseEvent, d, this);
        pointTip.style('left', mouseEvent.x + 10 + 'px');
      })
      .on('mouseout', pointTip.hide);


    if (this.metadataLookUp[this.metadata2Id].vardesc[0].length > 50) {
      svg.append('text')
        .classed('label', true)
        .attr('transform', 'rotate(-90)')
        .attr("font-weight", "bold")
        .attr('y', -margin.left + 10)
        .attr('x', -height / 2)
        .attr('dy', '.71em')
        .style('fill', 'rgba(0,0,0,.8)')
        .style('text-anchor', 'middle')
        .style('font-size', '8px')
        .text(this.metadataLookUp[this.metadata2Id].vardesc[0].slice(0, 50) + "...")
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
        .style('font-size', '12px')
        .text(this.metadataLookUp[this.metadata2Id].vardesc[0])

    }

    if (this.metadataLookUp[this.metadataId].vardesc[0].length > 50) {
      svg
        .append('text')
        .classed('label', true)
        .attr("font-weight", "bold")
        .attr('x', width / 2)
        .attr('y', height + margin.bottom + 20)
        .style('fill', 'rgba(0,0,0,.8)')
        .style('text-anchor', 'middle')
        .style('font-size', '8px')
        .text(this.metadataLookUp[this.metadataId].vardesc[0].slice(0, 50) + "...")
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
        .style('font-size', '12px')
        .text(this.metadataLookUp[this.metadataId].vardesc[0].slice(0, 50))

    }



    // //Legend
    var countColorData = [{ "color": "royalblue", "value": 0 }, { "color": "crimson", "value": this.maxCount }];
    var extent = d3.extent(countColorData, d => d.value);

    var paddingGradient = 9;
    var widthGradient = 200;
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

    var countLegend = d3.select('.my_heatmap_' + this.metadataId + '_' + this.metadata2Id + '_' + this.size).select("svg")
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



  onImageClicked(event: Event) {
    const svg = "";
    this.svg2Loaded.emit(svg);
  }
}
