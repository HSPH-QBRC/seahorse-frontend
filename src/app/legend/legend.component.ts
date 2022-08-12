import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit {
  // min = 0;
  // max = 10;
  width = 100;
  @Input() customTitle: string;
  @Input() min: any;
  @Input() max: any;
  @Input() colorArr: [{color, value}];

  constructor() { }

  ngOnInit(): void {
    this.createLegend()
  }

  createLegend() {
    //gradient legend
    // var data2 = [{ "color": "royalblue", "value": this.min }, { "color": "lightyellow", "value": ((this.min + this.max) / 2) }, { "color": "crimson", "value": this.max }];
    var data2 = this.colorArr
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

    var correlationLegend = d3.select("#my_dataviz")
      .append("svg")
      .attr("width", widthGradient)
      .attr("height", heightGradient)
      .attr('x', this.width + 10)
      .attr('y', 100);

    var defs = correlationLegend.append("defs");
    var linearGradient = defs
      .append("linearGradient")
      .attr("id", "myGradient");

    linearGradient.selectAll("stop")
      .data(data2)
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
      .text(this.customTitle);
  }
}
