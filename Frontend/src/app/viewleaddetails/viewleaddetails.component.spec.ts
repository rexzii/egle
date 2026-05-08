import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewleaddetailsComponent } from './viewleaddetails.component';

describe('ViewleaddetailsComponent', () => {
  let component: ViewleaddetailsComponent;
  let fixture: ComponentFixture<ViewleaddetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewleaddetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewleaddetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


