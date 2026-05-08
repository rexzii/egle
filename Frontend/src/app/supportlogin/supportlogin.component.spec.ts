import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportloginComponent } from './supportlogin.component';

describe('SupportloginComponent', () => {
  let component: SupportloginComponent;
  let fixture: ComponentFixture<SupportloginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportloginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupportloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
