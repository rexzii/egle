import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalsComponent } from './renewals.component';

describe('RenewalsComponent', () => {
  let component: RenewalsComponent;
  let fixture: ComponentFixture<RenewalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RenewalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RenewalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
