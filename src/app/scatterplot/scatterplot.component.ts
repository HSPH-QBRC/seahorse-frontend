import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from "rxjs/operators";
declare const matplotlib: any;
import io from 'buffer';

@Component({
  selector: 'app-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class ScatterPlotComponent implements OnInit, OnChanges {
  @Input() metadataId = '';
  @Input() metadata2Id = '';
  @Input() metadataLookUp = {};
  @Input() typeOfLookUp = '';
  @Input() symbolId = '';
  @Input() symbolId2 = '';

  isLoading = false;
  limit = 1000;
  offset = 0;
  lengthOfResult = 0;

  scatterPlotData = [];
  xMin = Infinity;
  xMax = -Infinity;
  yMin = Infinity;
  yMax = -Infinity;

  noData = false;

  imageUrl = "";
  imagePng = "";
  imageBase64 = "";

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    this.offset = 0;
    this.lengthOfResult = 0;
    this.isLoading = true;
    let numerical1 = this.metadataId;
    let numerical2 = this.metadata2Id;
    this.refreshData();
    if (this.typeOfLookUp === 'm2m') {
      this.getDataM2M(numerical1, numerical2)
    } else if (this.typeOfLookUp === 'm2g') {
      this.getDataM2G(numerical1, numerical2)
    } else if (this.typeOfLookUp === 'g2g') {
      this.getDataG2G(numerical1, numerical2)
    }
  }

  getDataM2M(numerical1, numerical2) {
    const headers = new HttpHeaders().set('Accept', 'image/png');
    let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=${numerical1}&category_b=${numerical2}&comparison=${this.typeOfLookUp}`
    this.httpClient.get(queryURL, { responseType: 'text' }).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        this.isLoading = false;
        throw message
      }))
      .subscribe(dataUrl => {
        this.isLoading = false;
        this.imageBase64 = `data:image/png;base64,${dataUrl}`
      });
  }

  getDataM2G(numGene, numMetadata) {
    // console.log("m2g scatter: ", numMetadata, numGene)
    // let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++ANN.SAMPID%2C%0D%0A++ANN.${numMetadata}%2C%0D%0A++EXP.GENE_EXPRESSION%0D%0Afrom%0D%0A++annotations+as+ANN%0D%0A++join+expression+as+EXP+on+ANN.SAMPID+%3D+EXP.SAMPID%0D%0Awhere%0D%0A++"ENSG"+is+"${numGene}"%0D%0Alimit%0D%0A++${this.offset}%2C+${this.limit}`
    // let queryURL = `${apiUrl}${annotationUrl}`;
    let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=${numMetadata}&category_b=${numGene}&comparison=${this.typeOfLookUp}`
    this.httpClient.get(queryURL, { responseType: 'text' }).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        this.isLoading = false;
        throw message
      }))
      .subscribe(dataUrl => {
        this.isLoading = false;
        this.imageBase64 = `data:image/png;base64,${dataUrl}`

      })
  }

  getDataG2G(numerical1, numerical2) {
    // let apiUrl = "//seahorse-api.tm4.org:8001/gtex.json?";
    // let annotationUrl = `sql=select%0D%0A++t1.SAMPID%2C%0D%0A++t1.GENE_EXPRESSION+as+GENE_EXPRESSION_1%2C%0D%0A++t2.GENE_EXPRESSION+as+GENE_EXPRESSION_2%0D%0Afrom%0D%0A++expression+t1%2C%0D%0A++expression+t2%0D%0Awhere%0D%0A++t1.sampid+%3D+t2.sampid%0D%0A++AND+t1.ENSG+%3D+"${numerical1}"%0D%0A++AND+t2.ENSG+%3D+"${numerical2}"`
    // let queryURL = `${apiUrl}${annotationUrl}`;

    // this.httpClient.get(queryURL).pipe(
    //   catchError(error => {
    //     console.log("Error: ", error);
    //     let message = `Error: ${error.error.error}`;
    //     throw message
    //   }))
    //   .subscribe(res => {
    //     console.log("from g2g")
    //     // for (let i = 0; i < res['rows'].length; i++) {
    //     //   if (res['rows'][i][1] < this.xMin) {
    //     //     this.xMin = res['rows'][i][1];
    //     //   }
    //     //   if (res['rows'][i][1] > this.xMax) {
    //     //     this.xMax = res['rows'][i][1];
    //     //   }
    //     //   if (res['rows'][i][2] < this.yMin) {
    //     //     this.yMin = res['rows'][i][2];
    //     //   }
    //     //   if (res['rows'][i][2] > this.yMax) {
    //     //     this.yMax = res['rows'][i][2];
    //     //   }

    //     //   let temp = {
    //     //     'name': res['rows'][i][0],
    //     //     'xValue': res['rows'][i][1],
    //     //     'yValue': res['rows'][i][2]
    //     //   };

    //     //   this.scatterPlotData.push(temp);
    //     // }
    //     this.isLoading = false;
    //     // this.createScatterPlot();
    //   })
    let queryURL = `https://api.seahorse.tm4.org/summary-plot/?category_a=${numerical1}&category_b=${numerical2}&comparison=${this.typeOfLookUp}`
    this.httpClient.get(queryURL, { responseType: 'text' }).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        this.isLoading = false;
        throw message
      }))
      .subscribe(dataUrl => {
        this.isLoading = false;
        this.imageBase64 = `data:image/png;base64,${dataUrl}`

      })
  }

  createScatterPlot() {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 100, left: 100 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const pointTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event, d) => {
        let tipBox = `<div><div class="category">Name:</div> ${d.name}</div>
    <div><div class="category">X Value: </div> ${d.xValue}</div>
    <div><div class="category">Y Value: </div>${d.yValue}</div>`
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
    svg.call(yAxisTip);
    svg.call(xAxisTip);

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
      .attr("r", this.typeOfLookUp != 'g2g' ? 1 : 5)
      .style("fill", "#69b3a2")
      .on('mouseover', function (mouseEvent: any, d) {
        pointTip.show(mouseEvent, d, this);
        pointTip.style('left', mouseEvent.x + 10 + 'px');
      })
      .on('mouseout', pointTip.hide);

    //Y-Axis labels
    if (this.typeOfLookUp === 'm2m' && this.metadataLookUp[this.metadata2Id].vardesc[0].length > 50) {
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
        .text(this.getYAxisLabelNames())
      // .text(this.typeOfLookUp === 'm2m' ? this.metadataLookUp[this.metadata2Id].vardesc[0].slice(0, 50) : this.symbolId === undefined ? this.metadata2Id : this.symbolId);
    }


    //x-axis label
    if (this.typeOfLookUp != 'g2g' && this.metadataLookUp[this.metadataId].vardesc[0].length > 50) {
      svg
        .append('text')
        .classed('label', true)
        .attr("font-weight", "bold")
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
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
        .text(this.getXAxisLabelNames());
    }
  }

  refreshData() {
    this.scatterPlotData = [];
    this.xMin = Infinity
    this.xMax = -Infinity
    this.yMin = Infinity
    this.yMax = -Infinity
  }

  getYAxisLabelNames() {
    switch (this.typeOfLookUp) {
      case 'm2m':
        return this.metadataLookUp[this.metadata2Id].vardesc[0].slice(0, 50)
      case 'm2g':
        return this.symbolId === undefined ? this.metadata2Id : this.symbolId
      case 'g2g':
        return this.symbolId
      default:
        return "N/A"
    }
  }

  getXAxisLabelNames() {
    switch (this.typeOfLookUp) {
      case 'm2m':
        return this.metadataLookUp[this.metadataId].vardesc[0].slice(0, 50)
      case 'm2g':
        return this.metadataLookUp[this.metadataId].vardesc[0].slice(0, 50)
      case 'g2g':
        return this.symbolId2
      default:
        return "N/A"
    }
  }

}
