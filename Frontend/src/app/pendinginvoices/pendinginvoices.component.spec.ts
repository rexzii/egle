import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendinginvoicesComponent } from './pendinginvoices.component';

describe('PendinginvoicesComponent', () => {
  let component: PendinginvoicesComponent;
  let fixture: ComponentFixture<PendinginvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendinginvoicesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendinginvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
