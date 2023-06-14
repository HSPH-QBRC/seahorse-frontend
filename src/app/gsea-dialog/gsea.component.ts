import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'gsea-component',
  templateUrl: 'gsea.component.html',
  styleUrls: ['./gsea.component.scss'],
})
export class GSEAComponent implements OnInit {
  isLoading = false;
  dataSource = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    meta: string,
    pathway: string
  },
    public dialogRef: MatDialogRef<GSEAComponent>,
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    this.getTissueList()
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getTissueList() {
    this.isLoading = true;
    let apiUrl = "https://api.seahorse.tm4.org/";
    let annotationUrl = `gsea-tissue/?meta=${this.data.meta}&pathway=${this.data.pathway}`;
    let queryURL = `${apiUrl}${annotationUrl}`;
    this.httpClient.get(queryURL).pipe(
      catchError(error => {
        this.isLoading = false;
        console.log("Error: ", error);
        let message = `Error: ${error.error.error}`;
        throw message
      }))
      .subscribe(res => {
        console.log("gsea dialog: ", res)
        this.isLoading = false;
        this.dataSource = [];
        for (let index in res) {
          // console.log("res index: ",res[index])
          this.dataSource.push(res[index][0]);
        }
        console.log("dialog ds: ", this.dataSource)
      })
  }
}