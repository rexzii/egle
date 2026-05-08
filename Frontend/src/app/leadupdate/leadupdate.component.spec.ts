import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadupdateComponent } from './leadupdate.component';

describe('LeadupdateComponent', () => {
  let component: LeadupdateComponent;
  let fixture: ComponentFixture<LeadupdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeadupdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeadupdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
