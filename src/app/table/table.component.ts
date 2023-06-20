import { Component, ChangeDetectionStrategy, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class TableComponent implements OnInit {
  @Input() metadataId = '';
  @Input() dataSource = [];
  @Input() metadataListReady = false;
  @Input() metadataLookUp = {};
  @Input() displayedColumns = [];
  @Input() tableSize = 0;
  @Input() limit = 0;
  @Input() currPage = 0;
  @Input() comparisonType = '';
  @Input() geneToSym = {};

  @Output() childGetPageDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() childOnSelectMetadataLink: EventEmitter<any> = new EventEmitter<any>();
  @Output() childDownloadTable: EventEmitter<any> = new EventEmitter<any>();

  dataSourceM2M = []
  displayedColumnsM2M = []
  tableSizeM2M = 0;

  dataSourceG2M = []
  displayedColumnsG2M = []
  tableSizeG2M = 0;

  dataSourceM2MLibrary = []
  tableSizeM2MLibrary = 0;

  dataSourceG2MLibrary = []
  tableSizeG2MLibrary = 0;

  dataSourceM2G = []
  displayedColumnsM2G = []
  tableSizeM2G = 0;

  dataSourceG2G = []
  displayedColumnsG2G = []
  tableSizeG2G = 0;


  constructor() { }

  ngOnInit(): void {
    if (this.comparisonType === 'm2m') {
      this.dataSourceM2M = this.dataSource;
      this.displayedColumnsM2M = this.displayedColumns;
      this.tableSizeM2M = this.tableSize;
    } else if (this.comparisonType === 'g2m') {
      this.dataSourceG2M = this.dataSource;
      this.displayedColumnsG2M = this.displayedColumns;
      this.tableSizeG2M = this.tableSize;
    } else if (this.comparisonType === 'm2mLibrary') {
      this.dataSourceM2MLibrary = this.dataSource;
      this.displayedColumnsM2M = this.displayedColumns;
      this.tableSizeM2MLibrary = this.tableSize;
    } else if (this.comparisonType === 'g2mLibrary') {
      this.dataSourceG2MLibrary = this.dataSource;
      this.displayedColumnsG2M = this.displayedColumns;
      this.tableSizeG2MLibrary = this.tableSize;
    } else if (this.comparisonType === 'm2g') {
      this.dataSourceM2G = this.dataSource;
      this.displayedColumnsM2G = this.displayedColumns;
      this.tableSizeM2G = this.tableSize;
    } else if (this.comparisonType === 'g2g') {
      this.dataSourceG2G = this.dataSource;
      this.displayedColumnsG2G = this.displayedColumns;
      this.tableSizeG2G = this.tableSize;
    }
  }

  onSelectMetadataLink(meta1, meta2, typeOfLookUp) {
    this.childOnSelectMetadataLink.emit([meta1, meta2, typeOfLookUp])
  }

  getPageDetails(details, comparison) {
    this.childGetPageDetails.emit([details, comparison]);
  }

  downloadTable(comparisonType, metaType) {
    this.childDownloadTable.emit([comparisonType, metaType])
  }

}
