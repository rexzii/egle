import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-email-editor-dialog',
  templateUrl: './email-editor-dialog.component.html',
  styleUrl: './email-editor-dialog.component.css'
})

export class EmailEditorDialogComponent {
emailContent: string;

constructor(
  public dialogRef: MatDialogRef<EmailEditorDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any
) {
  this.emailContent = data.initialMessage || '';  
}

onClose(): void {
  this.dialogRef.close();
}

onCancel(): void {
  this.dialogRef.close();
}

onSendEmail(): void {
  this.dialogRef.close({
    email: this.data.email,
    emailContent: this.emailContent  
  });
}

}
