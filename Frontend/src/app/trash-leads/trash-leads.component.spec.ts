import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrashLeadsComponent } from './trash-leads.component';

describe('TrashLeadsComponent', () => {
  let component: TrashLeadsComponent;
  let fixture: ComponentFixture<TrashLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrashLeadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrashLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
