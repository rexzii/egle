import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditfollowupComponent } from './editfollowup.component';

describe('EditfollowupComponent', () => {
  let component: EditfollowupComponent;
  let fixture: ComponentFixture<EditfollowupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditfollowupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditfollowupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
