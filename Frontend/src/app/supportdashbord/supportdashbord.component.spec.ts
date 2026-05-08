import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportdashbordComponent } from './supportdashbord.component';

describe('SupportdashbordComponent', () => {
  let component: SupportdashbordComponent;
  let fixture: ComponentFixture<SupportdashbordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportdashbordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupportdashbordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
