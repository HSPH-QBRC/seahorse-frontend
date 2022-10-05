import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
// import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";


@Component({
  selector: 'app-geneExpressionComparison',
  templateUrl: './geneExpressionComparison.component.html',
  styleUrls: ['./geneExpressionComparison.component.scss']
})

export class GeneExpressionComparisonComponent implements OnInit {
  constructor(private httpClient: HttpClient) { }
  ngOnInit(): void { }

}
