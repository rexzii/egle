import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiamartLeadsComponent } from './indiamart-leads.component';

describe('IndiamartLeadsComponent', () => {
  let component: IndiamartLeadsComponent;
  let fixture: ComponentFixture<IndiamartLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndiamartLeadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndiamartLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
