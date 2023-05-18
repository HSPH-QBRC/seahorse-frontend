import { Component, Inject, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-image-modal',
    templateUrl: './image-modal.component.html',
    styleUrls: ['./image-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class ImageModalComponent {
    @ViewChild('svgContainer') svgContainerRef: ElementRef;

    constructor(@Inject(MAT_DIALOG_DATA) public data: {
        imageUrl,
        plotType: string,
        metadataId: string,
        metadata2Id: string,
        metadataLookUp: {},
        comparisonType: string,
        size: string,
        tissue: string
    }) { }
}