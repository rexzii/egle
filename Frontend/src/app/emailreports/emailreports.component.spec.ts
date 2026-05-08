import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailreportsComponent } from './emailreports.component';

describe('EmailreportsComponent', () => {
  let component: EmailreportsComponent;
  let fixture: ComponentFixture<EmailreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmailreportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmailreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
