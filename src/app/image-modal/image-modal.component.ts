import { AfterViewInit, Component, Inject, ChangeDetectionStrategy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-image-modal',
    templateUrl: './image-modal.component.html',
    styleUrls: ['./image-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class ImageModalComponent {
    @ViewChild('svgContainer') svgContainerRef: ElementRef;
    // showPlot = true

    constructor(@Inject(MAT_DIALOG_DATA) public data: {
        imageUrl,
        plotType: string,
        metadataId: string,
        metadata2Id: string,
        metadataLookUp: {},
        comparisonType: string,
        size: string
    },
        // private renderer: Renderer2
    ) { }

    // ngAfterViewInit(): void {
    //     if (this.data.plotType !== "scatterplot") {
    //         let svg = this.data.imageUrl
    //         // const serializer = new XMLSerializer();
    //         // const svgString = serializer.serializeToString(this.data.imageUrl);
    //         // const dataUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
    //         // this.dataUrl = this.sanitizer.bypassSecurityTrustUrl(dataUrl);

    //         // Get the HTML element by its reference

    //         const container = this.svgContainerRef.nativeElement;

    //         // Append the SVG element to the HTML element
    //         // this.renderer.appendChild(container, svg);
    //         // this.showPlot = false

    //     }
    // }
}