import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadeditComponent } from './leadedit.component';

describe('LeadeditComponent', () => {
  let component: LeadeditComponent;
  let fixture: ComponentFixture<LeadeditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeadeditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeadeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
