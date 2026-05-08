import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportEndcustomerComponent } from './support-endcustomer.component';

describe('SupportEndcustomerComponent', () => {
  let component: SupportEndcustomerComponent;
  let fixture: ComponentFixture<SupportEndcustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportEndcustomerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupportEndcustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
