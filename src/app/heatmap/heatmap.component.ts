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
  // ageTitle = "Age Range";
  // ageMin = 0;
  // ageMax = 10;
  // ageColorArr = [{ "color": "royalblue", "value": this.ageMin }, { "color": "lightyellow", "value": ((this.ageMin + this.ageMax) / 2) }, { "color": "crimson", "value": this.ageMax }]

  xAxisArr = [];
  yAxisArr = [];
  fullXAxisArr = [];
  heatMapData = [];
  min = 10000;
  max = 0;
  tooltipOffsetX = 10;
  orderArr = [];
  tissue = "";
  annotationsDict = {}

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
    // let categorical1 = "SMATSSCR"
    // let categorical2 = "SME1ANTI"
    //Create annotations look up table too identify metadata for genes
    let apiUrl = "//3.143.251.117:8001/gtex.json?";
    let annotationUrl = `sql=select%0D%0A++sample_id%2C%0D%0A++tissue%2C%0D%0A++sex%2C%0D%0A++age_range%2C%0D%0A++hardy_scale_death%0D%0Afrom%0D%0A++annotations%0D%0Alimit%0D%0A++20000`
    // let annotationUrl = `sql=select%0D%0A++SAMPID%2C%0D%0A++${categorical1}%2C%0D%0A++${categorical2}%0D%0Afrom%0D%0A++annotations%0D%0Awhere%0D%0A++${categorical1}+is+not+%22%22%0D%0A++AND+${categorical2}+is+not+%22%22%0D%0A`
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        for (let i = 0; i < res['rows'].length; i++) {
          let gene = res['rows'][i][0];
          let sex = res['rows'][i][2];
          let age = res['rows'][i][3];
          let hardyScale = res['rows'][i][4];
          let obj = {
            sex,
            age,
            hardyScale
          }
          this.annotationsDict[gene] = obj

        }
        this.createHeatMap()
      })
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
          let sex = res['rows'][i][7];
          let ageRange = res['rows'][i][8];
          let hardyScale = res['rows'][i][9];

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
            value: correlationValue,
            sex,
            ageRange,
            hardyScale
          }
          this.heatMapData.push(dataObj);
        }
        //get the full X Axis that is missing a value from the Y Axis
        this.fullXAxisArr = [...this.xAxisArr];
        for (let i = 0; i < this.yAxisArr.length; i++) {
          if (!this.fullXAxisArr.includes(this.yAxisArr[i])) {
            this.fullXAxisArr.push(this.yAxisArr[i])
          }
        }

        if (res["rows"].length === limit) {
          this.getData(limit, page + 1)
        } else {
          this.createHeatMap()
        }
      })
  }

  createHeatMap() {
    // set the dimensions and margins of the graph
    var margin = { top: 100, right: 200, bottom: 60, left: 60 },
      width = 1300 - margin.left - margin.right,
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

    d3.select("#my_heatmap")
      .selectAll('svg')
      .remove();

    // append the svg object to the body of the page
    var svg = d3.select("#my_heatmap")
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

    //Label for X-Axis
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

    var hardyScaleColor = d3.scaleLinear()
      // @ts-ignore
      .range(["#fff44f", "tomato"])
      .domain([0, 5])

    // var ageColor = d3.scaleBand()
    //   // @ts-ignore
    //   .range(["#e7feff", "Royal Blue"])
    //   .domain(["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90-99"])

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

    let tempAnnotations = this.annotationsDict;
    let spacer = 5
    svg.selectAll()
      .data(this.fullXAxisArr)
      .join("rect")
      .attr("x", function (d) {
        return x(d)
      })
      .attr("y", -height * .025 - spacer)
      .attr("width", x.bandwidth())
      .attr("height", height * .025 - 1)
      .style("fill", function (d) {
        return (tempAnnotations[d].sex === "M") ? "#00AB66" : "darkorchid"
      })

    let ageArr = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90-99"];
    var ageScaleColor = d3.scaleBand()
      // @ts-ignore
      .range([0, 10])
      .domain(ageArr)

    var ageLinearColor = d3.scaleLinear()
      // @ts-ignore
      .range(["#e7feff", "darkcyan"])
      .domain([0, 10])

    svg.selectAll()
      .data(this.fullXAxisArr)
      .join("rect")
      .attr("x", function (d) {
        return x(d)
      })
      .attr("y", -(height * .025) * 2 - spacer)
      .attr("width", x.bandwidth())
      .attr("height", height * .025 - 1)
      .style("fill", function (d) {
        let scaleValue = ageScaleColor(tempAnnotations[d].age)
        return ageLinearColor(scaleValue)
      })

    svg.selectAll()
      .data(this.fullXAxisArr)
      .join("rect")
      .attr("x", function (d) {
        return x(d)
      })
      .attr("y", -(height * .025) * 3 - spacer)
      .attr("width", x.bandwidth())
      .attr("height", height * .025 - 1)
      .style("fill", function (d) {
        return hardyScaleColor(tempAnnotations[d].hardyScale)
      })

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
    var correlationColorData = [{ "color": "royalblue", "value": this.min }, { "color": "lightyellow", "value": ((this.min + this.max) / 2) }, { "color": "crimson", "value": this.max }];
    var extent = d3.extent(correlationColorData, d => d.value);

    var paddingGradient = 9;
    var widthGradient = 250;
    var innerWidth = widthGradient - (paddingGradient * 2);
    var barHeight = 8;
    var heightGradient = 100;

    var xScaleCorr = d3.scaleLinear()
      .range([0, innerWidth - 100])
      .domain(extent);

    // var xTicks = correlationColorData.filter(f => f.value === this.min || f.value === this.max).map(d => d.value);
    let xTicksCorr = [this.min, this.max]

    var xAxisGradient = d3.axisBottom(xScaleCorr)
      .tickSize(barHeight * 2)
      .tickValues(xTicksCorr);

    var correlationLegend = d3.select("svg")
      .append("svg")
      .attr("width", widthGradient)
      .attr("height", heightGradient)
      .attr('x', width + 100)
      .attr('y', 500);

    var defs = correlationLegend.append("defs");
    var linearGradient = defs
      .append("linearGradient")
      .attr("id", "myGradient");

    linearGradient.selectAll("stop")
      .data(correlationColorData)
      .enter().append("stop")
      .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
      .attr("stop-color", d => d.color)

    var g = correlationLegend.append("g")
      .attr("transform", `translate(${paddingGradient + 10}, 30)`)

    g.append("rect")
      .attr("width", innerWidth - 100)
      .attr("height", barHeight)
      .style("fill", "url(#myGradient)");

    correlationLegend.append('text')
      .attr('y', 20)
      .attr('x', 17)
      .style('fill', 'rgba(0,0,0,.7)')
      .style('font-size', '11px')
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("Correlations");

    //next legend
    // AGE gradient legend
    let ageMin = 0
    let ageMax = 99
    var dataAge = [{ "color": "#e7feff", "value": ageMin }, { "color": "darkcyan", "value": ageMax }];
    var extent2 = d3.extent(dataAge, d => d.value);

    var xScale = d3.scaleLinear()
      .range([0, innerWidth - 100])
      .domain(extent2);

    let xTicksAge = [ageMin, ageMax]

    var xAxisGradient2 = d3.axisBottom(xScale)
      .tickSize(barHeight * 2)
      .tickValues(xTicksAge);

    var ageLegend = d3.select("svg")
      .append("svg")
      .attr("width", widthGradient)
      .attr("height", heightGradient)
      .attr('x', width + 100)
      .attr('y', 200);

    var defsAge = ageLegend.append("defs");
    var linearGradient = defsAge
      .append("linearGradient")
      .attr("id", "myGradientAge");

    linearGradient.selectAll("stop")
      .data(dataAge)
      .enter().append("stop")
      .attr("offset", d => ((d.value - extent2[0]) / (extent2[1] - extent2[0]) * 100) + "%")
      .attr("stop-color", d => d.color)

    var gAge = ageLegend.append("g")
      .attr("transform", `translate(${paddingGradient + 10}, 30)`)

    gAge.append("rect")
      .attr("width", innerWidth - 100)
      .attr("height", barHeight)
      .style("fill", "url(#myGradientAge)");

    ageLegend.append('text')
      .attr('y', 20)
      .attr('x', 17)
      .style('fill', 'rgba(0,0,0,.7)')
      .style('font-size', '11px')
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("Age Range");

    //next legend
    // HARDY gradient legend
    // "#fff44f", "tomato"
    let hardyMin = 0
    let hardyMax = 5
    var dataHardy = [{ "color": "yellow", "value": hardyMin }, { "color": "tomato", "value": hardyMax }];
    var extentHardy = d3.extent(dataHardy, d => d.value);

    var xScale = d3.scaleLinear()
      .range([0, innerWidth - 100])
      .domain(extentHardy);

    var xTicks3 = [hardyMin, hardyMax]

    var xAxisGradient3 = d3.axisBottom(xScale)
      .tickSize(barHeight * 2)
      .tickValues(xTicks3);

    var hardyLegend = d3.select("svg")
      .append("svg")
      .attr("width", widthGradient)
      .attr("height", heightGradient)
      .attr('x', width + 100)
      .attr('y', 100);

    var defs3 = hardyLegend.append("defs");
    var linearGradient = defs3
      .append("linearGradient")
      .attr("id", "myGradientHardy");

    linearGradient.selectAll("stop")
      .data(dataHardy)
      .enter().append("stop")
      .attr("offset", d => ((d.value - extentHardy[0]) / (extentHardy[1] - extentHardy[0]) * 100) + "%")
      .attr("stop-color", d => d.color)

    var gHardy = hardyLegend.append("g")
      .attr("transform", `translate(${paddingGradient + 10}, 30)`)

    gHardy.append("rect")
      .attr("width", innerWidth - 100)
      .attr("height", barHeight)
      .style("fill", "url(#myGradientHardy)");

    hardyLegend.append('text')
      .attr('y', 20)
      .attr('x', 17)
      .style('fill', 'rgba(0,0,0,.7)')
      .style('font-size', '11px')
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("Hardy Scale Death");

    g.append("g")
      .call(xAxisGradient)
      .select(".domain")

    gAge.append("g")
      .call(xAxisGradient2)
      .select(".domain")

    gHardy.append("g")
      .call(xAxisGradient3)
      .select(".domain")

    // select the svg area
    var SvgSex = d3.select("svg")
      .append("svg")
      .attr('x', width + 20)
      .attr('y', 215);

    var keys = ["Male", "Female"]

    // Add one dot in the legend for each name.
    SvgSex.selectAll("mydots")
      .data(keys)
      .enter()
      .append("circle")
      .attr("cx", 100)
      .attr("cy", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("r", 7)
      .style("fill", d => {
        return (d === "Male") ? "#00AB66" : "darkorchid"
      })

    // Add one dot in the legend for each name.
    SvgSex.selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
      .attr("x", 120)
      .attr("y", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", "rgba(0,0,0,.7)")
      .text(function (d) { return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")


    // svg.append('text')
    //   .classed('label', true)
    //   .style('font-size', '24px')
    //   .style('fill', 'rgba(0,0,0,.7)')
    //   .attr("font-weight", "bold")
    //   .attr('y', -margin.left + 10)
    //   .attr('x', width / 2)
    //   .style('text-anchor', 'middle')
    //   .text(this.tissue);
  }

  onDropDownChange(value) {
    this.tissue = value;
    this.xAxisArr = [];
    this.yAxisArr = [];
    this.fullXAxisArr = [];
    this.heatMapData = [];
    this.min = 10000;
    this.max = 0;
    this.orderArr = [];
    this.getData(20000, 0)
  }
}
