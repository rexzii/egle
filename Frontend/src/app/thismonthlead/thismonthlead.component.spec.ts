import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThismonthleadComponent } from './thismonthlead.component';

describe('ThismonthleadComponent', () => {
  let component: ThismonthleadComponent;
  let fixture: ComponentFixture<ThismonthleadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThismonthleadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThismonthleadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
