import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitingCardScannerComponent } from './visiting-card-scanner.component';

describe('VisitingCardScannerComponent', () => {
  let component: VisitingCardScannerComponent;
  let fixture: ComponentFixture<VisitingCardScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisitingCardScannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisitingCardScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
