import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TbSupportregistrationComponent } from './tb-supportregistration.component';

describe('TbSupportregistrationComponent', () => {
  let component: TbSupportregistrationComponent;
  let fixture: ComponentFixture<TbSupportregistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TbSupportregistrationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TbSupportregistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
