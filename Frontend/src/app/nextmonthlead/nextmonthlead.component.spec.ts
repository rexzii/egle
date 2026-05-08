import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextmonthleadComponent } from './nextmonthlead.component';

describe('NextmonthleadComponent', () => {
  let component: NextmonthleadComponent;
  let fixture: ComponentFixture<NextmonthleadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NextmonthleadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NextmonthleadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
