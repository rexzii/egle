import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialogbox',
  templateUrl: './confirmation-dialogbox.component.html',
  styleUrl: './confirmation-dialogbox.component.css'
})

export class ConfirmationDialogboxComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
