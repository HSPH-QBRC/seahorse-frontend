import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import * as cytoscape from 'cytoscape';
// import fcose from 'cytoscape-fcose';
// import cola from 'cytoscape-cola';
// import coseBilkent from 'cytoscape-cose-bilkent';
// import cise from 'cytoscape-cise';
// import layoutUtilities from 'cytoscape-layout-utilities';
// import klay from 'cytoscape-klay';

// cytoscape.use(fcose);
// cytoscape.use(coseBilkent);
// cytoscape.use(klay);
// cytoscape.use(cise);

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class TestComponent implements OnInit {
  isLoading = true;
  layoutName: string = "fcose";
  nodeSize = {
    small: {
      height: 10,
      width: 10,
      fontSize: 2,
      borderWidth: 1,
      edgeWidth: [1, 2]
    },
    medium: {
      height: 20,
      width: 20,
      fontSize: 4,
      borderWidth: 1,
      edgeWidth: [1, 5]
    },
    large: {
      height: 40,
      width: 40,
      fontSize: 7,
      borderWidth: 2,
      edgeWidth: [3, 8]
    }
  };
  size = "small"
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // this.loadTSVFile();
  }

  // getRandomNumber(num) {
  //   const random = Math.random() * num;
  //   const rounded = Math.floor(random);
  //   const randomNumber = rounded + 1;
  
  //   return randomNumber.toString();
  // }

  // loadTSVFile() {
  //   this.isLoading = true;
  //   this.http.get('/assets/tsv/network.tsv', { responseType: 'text' })
  //     .subscribe(data => {
  //       const dataArray = this.parseTSVToArray(data);
  //       this.formatForCytoscape(dataArray)
  //     });
  // }

  // parseTSVToArray(tsvData: string): any[][] {
  //   const lines = tsvData.split('\n');
  //   const dataArray: any[][] = [];

  //   for (let i = 0; i < lines.length; i++) {
  //     const line = lines[i].split('\t');
  //     dataArray.push(line);
  //   }

  //   return dataArray;
  // }

  // nodesArr = [];
  // edgeArr = [];
  // existingNode = {}
  // maxEdgeWeight = 0
  // minEdgeWeight = 10000

  // formatForCytoscape(arr) {

  //   for (let i = 0; i < arr.length; i++) {
  //     let nodeId = i;
  //     if (!this.existingNode[nodeId]) {
  //       let newNode = {
  //         "data": {
  //           "id": nodeId,
  //           "clusterID": this.getRandomNumber(2),
  //           // "parent": temp
  //         }
  //       }
  //       this.nodesArr.push(newNode);
  //       this.existingNode[nodeId] = 1;
  //     }

  //     for (let j = 0; j < arr[i].length; j++) {
  //       let childId = j;
  //       let currEdgeWeight = arr[i][j];
  //       this.maxEdgeWeight = Math.max(this.maxEdgeWeight, currEdgeWeight);
  //       this.minEdgeWeight = Math.min(this.minEdgeWeight, currEdgeWeight);
  //       let newEdge = {
  //         "data": {
  //           "id": nodeId + "_" + childId,
  //           "source": nodeId,
  //           "target": childId,
  //           // "interaction": node[nodeId].axis === 0 ? "pd" : "dp",
  //           "edge_weight": currEdgeWeight
  //         }
  //       }
  //       this.edgeArr.push(newEdge)

  //     }
  //   }
  //   console.log("nodes: ", this.nodesArr, this.edgeArr)
  //   this.isLoading = false;
  //   this.render()
  // }

  // cy: any;

  // render() {
  //   this.cy = cytoscape({
  //     container: document.getElementById('cy'),
  //     elements: {
  //       // group: 'node[clusterID]',
  //       nodes: this.nodesArr,
  //       edges: this.edgeArr.slice(100, 300),
  //     },
  //     style: [
  //       {
  //         selector: 'node[clusterID="1"]',
  //         // selector: 'node',
  //         style: {
  //           'background-color': "#1DA1F2",
  //           'opacity': 0.95,
  //           'label': 'data(id)',
  //           'shape': 'diamond',
  //           'text-wrap': 'wrap',
  //           'text-max-width': '1000px',
  //           'text-halign': 'center',
  //           'text-valign': 'center',
  //           'border-color': '#000',
  //           'border-opacity': 0.8,
  //           'color': 'white',
  //           'font-weight': 'bold',
  //           'height': this.nodeSize[this.size].height,
  //           'width': this.nodeSize[this.size].width,
  //           'font-size': this.nodeSize[this.size].fontSize,
  //           'border-width': this.nodeSize[this.size].borderWidth,
  //         }
  //       },
  //       {
  //         selector: 'node[clusterID="2"]',
  //         style: {
  //           'background-color': "#D94A4A",
  //           'opacity': 0.95,
  //           'label': 'data(id)',
  //           'shape': 'round-rectangle',
  //           'text-wrap': 'wrap',
  //           'text-max-width': '1000px',
  //           'text-halign': 'center',
  //           'text-valign': 'center',
  //           'border-color': '#000',
  //           'border-opacity': 0.8,
  //           'color': 'white',
  //           'font-weight': 'bold',
  //           'height': this.nodeSize[this.size].height * 0.9,
  //           'width': this.nodeSize[this.size].width * 0.9,
  //           'font-size': this.nodeSize[this.size].fontSize,
  //           'border-width': this.nodeSize[this.size].borderWidth,
  //         }
  //       },
  //       {
  //         selector: 'edge',
  //         style: {
  //           'width': 1,
  //           // 'width': `mapData(edge_weight, ${this.minEdgeWeight}, ${this.maxEdgeWeight}, ${this.nodeSize[this.size].edgeWidth[0]}, ${this.nodeSize[this.size].edgeWidth[1]})`,
  //           'line-color': "#848484",
  //           'line-opacity': 0.5,
  //         },
  //       },
  //     ],
  //     layout:
  //     {
  //       name: this.layoutName,
  //     }
  //   })
    
  // }
}
