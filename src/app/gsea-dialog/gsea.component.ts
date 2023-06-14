import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
// import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'gsea-component',
  templateUrl: 'gsea.component.html',
  styleUrls: ['./gsea.component.scss'],
})
export class GSEAComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<GSEAComponent>
    // private httpClient: HttpClient,
  ) { }

  ngOnInit(): void {
    console.log("dialog started")
  }

  onSubmit(event){
    console.log(event)
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}