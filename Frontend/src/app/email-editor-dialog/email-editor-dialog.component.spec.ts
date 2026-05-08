import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailEditorDialogComponent } from './email-editor-dialog.component';

describe('EmailEditorDialogComponent', () => {
  let component: EmailEditorDialogComponent;
  let fixture: ComponentFixture<EmailEditorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmailEditorDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmailEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
