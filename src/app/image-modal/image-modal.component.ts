import { AfterViewInit, Component, Inject, OnChanges, OnInit, SimpleChanges, ChangeDetectionStrategy, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as d3 from 'd3';
import { MatDialogRef } from '@angular/material/dialog';
import { BoxPlotComponent } from '../boxplot/boxplot.component'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-image-modal',
    templateUrl: './image-modal.component.html',
    styleUrls: ['./image-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class ImageModalComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: {
        imageUrl,
        plotType: string,
        metadataId: string,
        metadata2Id: string,
        metadataLookUp: {}
    },
    private sanitizer: DomSanitizer
    ) { }
    dataUrl

    ngOnInit(): void {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(this.data.imageUrl);
        const dataUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
        this.dataUrl = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
    }
}