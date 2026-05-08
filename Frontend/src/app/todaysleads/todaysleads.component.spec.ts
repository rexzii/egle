import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysleadsComponent } from './todaysleads.component';

describe('TodaysleadsComponent', () => {
  let component: TodaysleadsComponent;
  let fixture: ComponentFixture<TodaysleadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TodaysleadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodaysleadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
