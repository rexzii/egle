import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceModalComponent } from './attendance-modal.component';

describe('AttendanceModalComponent', () => {
  let component: AttendanceModalComponent;
  let fixture: ComponentFixture<AttendanceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttendanceModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttendanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
