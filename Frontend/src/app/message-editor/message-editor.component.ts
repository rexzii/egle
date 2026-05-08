import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-message-editor',
  templateUrl: './message-editor.component.html',
  styleUrls: ['./message-editor.component.css']
})

export class MessageEditorComponent {
initialMessage: any;
editedMessage: any;
contactno: any;
 
constructor(public dialogRef: MatDialogRef<MessageEditorComponent>,
  @Inject(MAT_DIALOG_DATA) public data: { initialMessage: any, contactno: any },private http: HttpClient) {
  this.initialMessage = this.data.initialMessage;  
  this.contactno = this.data.contactno;  
  this.editedMessage = this.initialMessage;  
}

sendEditedMessage() {
  const prefixedContactno = '91' + this.contactno; 
  const message = encodeURIComponent(this.editedMessage);
  const apiUrl = `https://int.chatway.in/api/send-msg`;
  const params = {
    username: 'sedna',
    number: prefixedContactno,
    message: message,
    token: 'UWtiT0EwcFpjOXZ5SnBiejhzN2lTdz09'
  };
  this.http.post(apiUrl, null, { params }).subscribe(
    (response: any) => {
      console.log('WhatsApp message sent:', response);
      if (response && response.status === 'success') {
        alert('Message successfully sent!');
      } else {
        console.error('Message successfully sent!', response);
        alert('Message successfully sent!');
      }
    },
    (error: any) => {
      console.error('Message successfully sent!', error);
      alert('Message successfully sent!');
    }
  );
}

onCancel(): void {
  this.dialogRef.close();
}

closeDialog(): void {
  this.dialogRef.close();
}
}
