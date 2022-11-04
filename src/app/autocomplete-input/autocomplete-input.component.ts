import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
  selector: 'app-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.scss']
})
export class AutocompleteInputComponent implements OnInit {
  @Input() autoFillData = [];
  @Output() onSearch = new EventEmitter
  searchValue = '';
  myControl = new FormControl('');
  filteredOptions: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(val => val.length >= 1 ? this._filter(val || '') : [])
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.autoFillData.filter(option => option.toLowerCase().startsWith(filterValue));
  }

  getParent() {
    this.onSearch.emit(this.searchValue);
  }
}
