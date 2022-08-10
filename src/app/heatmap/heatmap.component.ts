import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class HeatmapComponent implements OnInit {
  xAxisArr = [];
  yAxisArr = [];
  heatMapData = [];
  min = 10000;
  max = 0;
  tooltipOffsetX = 10;
  orderArr = [];
  tissue = "Breast - Mammary Tissue"

  constructor(private httpClient: HttpClient) { }

  tissueList = [
    {
      name: "Kidney - Medulla"
    },
    {
      name: "Fallopian Tube"
    },
    {
      name: "Cervix - Ectocervix"
    },
    {
      name: "Cervix - Endocervix"
    },
    {
      name: "Bladder"
    },
    {
      name: "Kidney - Cortex"
    },
    {
      name: "Brain - Substantia nigra"
    },
    {
      name: "Uterus"
    },
    {
      name: "Brain - Amygdala"
    },
    {
      name: "Vagina"
    },
    {
      name: "Brain - Spinal cord (cervical c-1)"
    },
    {
      name: "Minor Salivary Gland"
    },
    {
      name: "Cells - EBV-transformed lymphocytes"
    },
    {
      name: "Brain - Anterior cingulate cortex (BA24)"
    },
    {
      name: "Ovary"
    },
    {
      name: "Small Intestine - Terminal Ileum"
    },
    {
      name: "Brain - Hippocampus"
    },
    {
      name: "Brain - Hypothalamus"
    },
    {
      name: "Brain - Putamen (basal ganglia)"
    },
    {
      name: "Brain - Frontal Cortex (BA9)"
    },
    {
      name: "Brain - Cerebellar Hemisphere"
    },
    {
      name: "Liver"
    },
    {
      name: "Artery - Coronary"
    },
    {
      name: "Spleen"
    },
    {
      name: "Brain - Cerebellum"
    },
    {
      name: "Prostate"
    },
    {
      name: "Brain - Cortex"
    },
    {
      name: "Adrenal Gland"
    },
    {
      name: "Pituitary"
    },
    {
      name: "Pancreas"
    },
    {
      name: "Stomach"
    },
    {
      name: "Testis"
    },
    {
      name: "Colon - Sigmoid"
    },
    {
      name: "Esophagus - Gastroesophageal Junction"
    },
    {
      name: "Colon - Transverse"
    },
    {
      name: "Heart - Atrial Appendage"
    },
    {
      name: "Heart - Left Ventricle"
    },
    {
      name: "Artery - Aorta"
    },
    {
      name: "Breast - Mammary Tissue"
    },
    {
      name: "Cells - Cultured fibroblasts"
    },
    {
      name: "Esophagus - Muscularis"
    },
    {
      name: "Adipose - Visceral (Omentum)"
    },
    {
      name: "Esophagus - Mucosa"
    },
    {
      name: "Lung"
    },
    {
      name: "Skin - Not Sun Exposed (Suprapubic)"
    },
    {
      name: "Nerve - Tibial"
    },
    {
      name: "Thyroid"
    },
    {
      name: "Artery - Tibial"
    },
    {
      name: "Adipose - Subcutaneous"
    },
    {
      name: "Skin - Sun Exposed (Lower leg)"
    },
    {
      name: "Whole Blood"
    },
    {
      name: "Muscle - Skeletal"
    },
  ]

  ngOnInit(): void {
    // this.getData(20000, 0)
  }

  getData(limit, page) {
    let tissue = this.tissue;
    let apiUrl = "http://3.143.251.117:8001/gtex.json?";
    let filterUrl = `sql=select%0D%0A++*%0D%0Afrom%0D%0A++correlations%0D%0A++join+annotations+on+correlations.Sample1+%3D+annotations.sample_id%0D%0Awhere%0D%0A++"tissue"+%3D+"${tissue}"%0D%0Aorder+by%0D%0A++"Sample1+Order"+asc%0D%0Alimit%0D%0A++${limit}%0D%0Aoffset%0D%0A++${limit * page}`;
    let queryURL = `${apiUrl}${filterUrl}`;

    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`
        this.getData(limit, page)
        throw message
      }))
      .subscribe(res => {
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

        let dataObj = {
          xValue: currX,
          yValue: currY,
          value: correlationValue
        }
        this.heatMapData.push(dataObj);
      }
      if (res["rows"].length === limit) {
        console.log(limit, page)
        this.getData(limit, page + 1)
      } else {
        this.createHeatMap()
      }

    })
  }

  createHeatMap() {
    // set the dimensions and margins of the graph
    var margin = { top: 70, right: 50, bottom: 60, left: 60 },
      width = 1000 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;
    // tool tip for individual points (if displayed)

    const pointTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event, d) => {
        let tipBox = `<div><div class="category">Sample 1:</div> ${d.xValue}</div>
    <div><div class="category">Sample 2</div> ${d.yValue}</div>
    <div><div class="category">Value: </div>${d.value}</div>`
        return tipBox
      });

    d3.select("#my_dataviz")
      .selectAll('svg')
      .remove();

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Labels of row and columns
    let xGroup = this.orderArr;
    let yGroup = this.orderArr;

    svg.call(pointTip);

    // Build X scales and axis:
    var x = d3.scaleBand()
      .range([0, width])
      .domain(xGroup)
      .padding(0.01);

    // svg.append("g")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(d3.axisBottom(x))
    //   .selectAll("text")
    //   .style("text-anchor", "end")
    //   .attr("dx", "-.8em")
    //   .attr("dy", ".15em")
    //   .attr("transform", "rotate(-65)");

    // Build X scales and axis:
    var y = d3.scaleBand()
      .range([0, height])
      .domain(yGroup)
      .padding(0.01);
    // svg.append("g")
    //   .call(d3.axisLeft(y));

    // Build color scale
    var myColor = d3.scaleLinear()
      // @ts-ignore
      .range(["royalblue", "lightyellow", "crimson",])
      .domain([this.min, (this.max + this.min) / 2, this.max])

    //Read the data
    let data = this.heatMapData
    svg.selectAll()
      .data(data, function (d) { return `${d.xValue}:${d.yValue}` })
      .join("rect")
      .attr("x", function (d) {
        return x(d.xValue)
      })
      .attr("y", function (d) { return y(d.yValue) })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        return myColor(d.value)
      })
      .on('mouseover', function (mouseEvent: any, d) {
        pointTip.show(mouseEvent, d, this);
        pointTip.style('left', mouseEvent.x + 10 + 'px');
      })
      .on('mouseout', pointTip.hide);

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
      .on('mouseover', function (mouseEvent: any, d) {
        pointTip.show(mouseEvent, d, this);
        pointTip.style('left', mouseEvent.x + 10 + 'px');
      })
      .on('mouseout', pointTip.hide);

    svg.append('text')
      .classed('label', true)
      .attr('transform', 'rotate(-90)')
      .style('fill', 'rgba(0,0,0,.7)')
      .attr("font-weight", "bold")
      .attr('y', -margin.left + 10)
      .attr('x', -height / 2)
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text('Sample 2');

    svg
      .append('text')
      .classed('label', true)
      .style('fill', 'rgba(0,0,0,.7)')
      .attr("font-weight", "bold")
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('text-anchor', 'end')
      .text('Sample 1');

    //gradient legend
    var data2 = [{ "color": "royalblue", "value": this.min }, { "color": "lightyellow", "value": ((this.min + this.max) / 2) }, { "color": "crimson", "value": this.max }];
    var extent = d3.extent(data2, d => d.value);

    var paddingGradient = 9;
    var widthGradient = 250;
    var innerWidth = widthGradient - (paddingGradient * 2);
    var barHeight = 8;
    var heightGradient = 100;

    var xScale = d3.scaleLinear()
      .range([0, innerWidth - 100])
      .domain(extent);

    var xTicks = data2.filter(f => f.value === this.min || f.value === this.max).map(d => d.value);

    var xAxisGradient = d3.axisBottom(xScale)
      .tickSize(barHeight * 2)
      .tickValues(xTicks);

    var svg2 = d3.select("#my_dataviz")
      .append("svg")
      .attr("width", widthGradient)
      .attr("height", heightGradient)
      .attr('x', width + 10)
      .attr('y', 100);

    var defs = svg2.append("defs");
    var linearGradient = defs
      .append("linearGradient")
      .attr("id", "myGradient");

    linearGradient.selectAll("stop")
      .data(data2)
      .enter().append("stop")
      .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
      .attr("stop-color", d => d.color)

    var g = svg2.append("g")
      .attr("transform", `translate(${paddingGradient + 10}, 30)`)

    g.append("rect")
      .attr("width", innerWidth - 100)
      .attr("height", barHeight)
      .style("fill", "url(#myGradient)");

    svg2.append('text')
      .attr('y', 20)
      .attr('x', 17)
      .style('fill', 'rgba(0,0,0,.7)')
      .style('font-size', '11px')
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("Correlations");

    svg.append('text')
      .classed('label', true)
      .style('font-size', '24px')
      .style('fill', 'rgba(0,0,0,.7)')
      .attr("font-weight", "bold")
      .attr('y', -margin.left + 10)
      .attr('x', width / 2)
      .style('text-anchor', 'middle')
      .text(this.tissue);

    g.append("g")
      .call(xAxisGradient)
      .select(".domain").remove();
  }

  onDropDownChange(value) {
    this.tissue = value;
    console.log("value: ", value)
    this.getData(20000, 0)
  }
}
