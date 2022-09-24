import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
// import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';

// interface heatMapData {
//   group: string;
//   variable: string;
//   value: number;
// }

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit {
  phenotype = [
    "Age",
    "Sex",
    "Race",
    "Height",
    "Weight",
    "BMI"
  ]

  tissue = [
    "Brain",
    "Liver",
    "Kidney",
    "Colon-Descending",
    "Colon-Transverse"
  ]

  constructor() { }

  ngOnInit(): void {
    
  }
  
  
}
