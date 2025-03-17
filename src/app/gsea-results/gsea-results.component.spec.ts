import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GseaResultsComponent } from './gsea-results.component';

describe('GseaResultsComponent', () => {
  let component: GseaResultsComponent;
  let fixture: ComponentFixture<GseaResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GseaResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GseaResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
