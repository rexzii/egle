import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadStatisticsComponent } from './lead-statistics.component';

describe('LeadStatisticsComponent', () => {
  let component: LeadStatisticsComponent;
  let fixture: ComponentFixture<LeadStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeadStatisticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeadStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
