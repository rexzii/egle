import { Component, Input  } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ParamMap, Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http'; 
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { MessageEditorComponent } from '../message-editor/message-editor.component';
import { EmailEditorDialogComponent } from '../email-editor-dialog/email-editor-dialog.component';

@Component({
  selector: 'app-viewleaddetails',
  templateUrl: './viewleaddetails.component.html',
  styleUrl: './viewleaddetails.component.css'
})

export class ViewleaddetailsComponent {
@Input() initialMessage: string;
editedMessage: string;
registereditForm: any;
lead_id: string;
leadDetails: any;
fetchedData: any;
selectedSection: string = 'details';
item1: any;
selectedItem: any;
fetchedfollowup: any;
followData: any[] = [];
item: any;
isDetailsActive: any;
isFollowUpsActive: any;
username: any;
user_id: any;
data: any;
company_code: any;
company_name: any;
personname: any;
products: any;
reg_date: any;
user_right: any;
 
constructor(private Service: ApiserviceService, private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private http: HttpClient)
 {}
 
ngOnInit(): void {
  this.route.queryParams.subscribe(queryParams => {
  this.username = queryParams['username'];
  this.user_id = queryParams['user_id'];
  this.company_code = queryParams['company_code'];
  this.company_name = queryParams['company_name'];
  this.user_right = queryParams['user_right'];
});

console.log('ngOnInit called');
this.route.params.subscribe(params => {
this.lead_id = params['lead_id'];
console.log('Lead ID:', this.lead_id);
this.fetchData(this.lead_id);
this.fetchfollowup(this.lead_id);
});
  
this.registereditForm = this.formBuilder.group({
personname: ['', Validators.required],
company_name: ['', Validators.required],
email: ['', Validators.required],
});
}
  
fetchData(lead_id: any) {
console.log('Fetching data for Lead ID:', lead_id);
this.Service.fetchAllData(lead_id).subscribe(
(response: any) => {
console.log('Response:', response);
if (Array.isArray(response.data)) {
this.fetchedData = response.data;
} else {
this.fetchedData = [response.data];
}
},
(error: any) => {
console.error('Error:', error);
}
);
}

fetchfollowup(lead_id: any) {
console.log('Fetching data for Lead ID:', lead_id);
this.Service.fetchfollowup(lead_id).subscribe(
(response: any) => {
console.log('Response:', response);
if (response && response.data) {
if (Array.isArray(response.data)) {
this.followData = response.data.filter((item: null) => item !== null);
} else {
this.followData = [response.data];
}
} else {
  this.followData = [];
}
console.log("followData:", this.followData);
console.log("followData length:", this.followData.length);
},
(error: any) => {
console.error('Error:', error);
this.followData = [];
}
);
}
  
showDetails(): void {
  this.selectedSection = 'details';
}

showFollowUps(): void {
  this.selectedSection = 'followUps';
}

convertTo12HourFormat(time24: string): string {
  if (!time24) {
  return '';
}
  
const [hours, minutes] = time24.split(':');
const suffix = +hours >= 12 ? 'PM' : 'AM';
const convertedHours = +hours % 12 || 12;
return `${convertedHours}:${minutes} ${suffix}`;
}
  
closeContainer() {
  if (this.user_id) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right
    };
    this.router.navigate(['/dashboard', this.user_id], { queryParams });
  } else {
    console.error('User ID is undefined');
  }
}

navigateToEditPage(status_id: any): void {
  this.router.navigate(['/followupedit', status_id], {
    queryParams: { 
      username: this.username,
      user_id: this.user_id,
      company_code: this.company_code,
      company_name: this.company_name, 
      user_right: this.user_right 
    }
  }); 
}

navigateToUpdateLead(leadId: number, personName: string, email: string) {
  this.router.navigate(['/updatelead'], {
    queryParams: {
      lead_id: leadId,
      personname: personName,
      email: email,
      username: this.username,
      user_id: this.user_id , 
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right  
    }
  });   
}

deleteItem(status_id: number) {
  this.Service.deletefollowup(status_id.toString()).subscribe(
    () => {
      console.log('Item deleted successfully');
     alert('Item deleted successfully');
     window.location.reload(); 
    },
    (error) => {
      console.error('Error deleting item:', error);
     alert('Error deleting item');
    }
  );
}

openDeleteConfirmation(statusId: number): void {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.panelClass = 'custom-dialog-container'; 
  dialogConfig.data = 'Are you sure you want to delete?';
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
  dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      this.deleteItem(statusId);
    } else {
    }
  });
}

openSnackBar(message: string) {
  this.snackBar.open(message, 'Close', {
    duration: 3000,
  });
}

sendEmail(email: string, emailContent: string): void {
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    width: '250px',
  
    data: 'Are you sure you want to send the email?'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      this.sendEmailConfirmation(email, emailContent);
    } else {
    }
  });
}

sendEmailConfirmation(email: string, emailContent: string): void {
  const apiUrl = 'https://prathhamcrm.com/nodeapp/send-email';
  const emailData = { email, emailContent };

  this.http.post(apiUrl, emailData).subscribe(
    (res) => {
      console.log('Email sent successfully:', res);
      alert('Email sent successfully.');
    },
    (err) => {
      console.error('Email sent successfully!', err);
      alert('Email sent successfully.');
    }
  );
}

openEmailEditor(email: string): void {
  const item = this.fetchedData.find((item: { email: string; }) => item.email === email);
  if (!item) {
    console.error('Item not found for contact number:', email);
    return;
  }
  const initialMessage = `Hello ${item.personname},
  This is the gentle reminder for your requirement regarding registered ${item.products} on our CRM portal dated ${item.reg_date}.
  Kindly, let us know when can we again reach you by replying on this email.
  Best regards,
  We offer other services as:
  - Website Design
  - Website Maintenance 
  - Bulk Whatsapp
  - Digital Marketing 
  - Google PPC Campaign
  - Instagram Marketing
  - Cold Calling Services
  - Logo Designing / Graphic / Catalogue / Brochure Designing
  - CRM Software
  - Mobile Application Development\n
  About Us: We are a Mumbai-based 18+ years old development company with a 20+ professional team. To further know more, visit the following link:\n
    Our Location:
    https://maps.app.goo.gl/ae12TDTbGZ1jwZSa8\n
    Our Video Profile:
    https://youtu.be/YXRGP-dCz1M\n
    Our Reviews:
    https://g.page/r/CX7M8mMzDKqTEB0/review\n
    Our Website:
    https://www.sednainfosystems.com\n
    Yours Sincerely,
    Poonam Mishra
    Sales Team | 9920432160`;

  const dialogRef = this.dialog.open(EmailEditorDialogComponent, {
    width: '600px',
    data: {
      email: email,
      initialMessage: initialMessage
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.sendEmailConfirmation(result.email, result.emailContent);
    }
  });
}

sendMessage(contactno: string) {
  const item = this.fetchedData.find((item: { contactno: string; }) => item.contactno === contactno);
  if (!item) {
    console.error('Item not found for contact number:', contactno);
    return;
  }
  const prefixedContactno = '91' + contactno;
  const message = encodeURIComponent(`
    Hello ${item.personname},\n
    This is a gentle reminder for your requirement regarding ${item.products}registered on our CRM portal dated ${item.reg_date}. 
    Kindly, let us know when can we again reach you by replying to this email.\n
    Best regards,\n
    We offer other services such as:\n
    - Website Design\n
    - Website Maintenance\n
    - Bulk Whatsapp\n
    - Digital Marketing\n
    - Google PPC Campaign\n
    - Instagram Marketing\n
    - Cold Calling Services\n
    - Logo Designing / Graphic / Catalogue / Brochure Designing\n
    - CRM Software\n
    - Mobile Application Development\n
    About Us: We are a Mumbai-based 18+ years old development company with a 20+ professional team. To further know more, visit the following link:\n
    Our Location:
    https://maps.app.goo.gl/ae12TDTbGZ1jwZSa8\n
    Our Video Profile:
    https://youtu.be/YXRGP-dCz1M\n
    Our Reviews:
    https://g.page/r/CX7M8mMzDKqTEB0/review\n
    Our Website:
    https://www.sednainfosystems.com\n
    Yours Sincerely,
    Poonam Mishra
    Sales Team | 9920432160
  `);
  const apiUrl = `https://int.chatway.in/api/send-msg?username=sedna&number=${prefixedContactno}&message=${message}&token=UWtiT0EwcFpjOXZ5SnBiejhzN2lTdz09`;
  // Send HTTP request to the API
  this.http.get(apiUrl).subscribe(
    (response: any) => {
      console.log('WhatsApp message sent:', response);
      if (response && response.status === 'success') {
        alert('Message successfully sent!');
      } else {
        console.error('Message successfully sent!', response);
        alert('Message successfully sent!');
      }
    },
    (error) => {
      console.error('Error sending WhatsApp message:', error);
      alert('Message successfully sent!');
    }
  );
}

openWhatsApp(contactNo: string): void {
  const message = encodeURIComponent('');
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${contactNo}&text=${message}`;
  window.open(whatsappUrl, '_blank');
}

openMessageEditor(contactno: string) {
  const item = this.fetchedData.find((item: { contactno: string }) => item.contactno === contactno);
  
  if (!item) {
    console.error('Item not found for contact number:', contactno);
    return;
  }

  const initialMessage = `
Hello ${item.personname},

This is a gentle reminder for your requirement regarding ${item.products} registered on our CRM portal dated ${item.reg_date}.
Kindly, let us know when can we again reach you by replying to this email.

Best regards,

We offer other services such as:
- Website Design
- Website Maintenance
- Bulk Whatsapp
- Digital Marketing
- Google PPC Campaign
- Instagram Marketing
- Cold Calling Services
- Logo Designing / Graphic / Catalogue / Brochure Designing
- CRM Software
- Mobile Application Development

About Us: We are a Mumbai-based 18+ years old development company with a 20+ professional team. To further know more, visit the following link:
Our Location:
https://maps.app.goo.gl/ae12TDTbGZ1jwZSa8

Our Video Profile:
https://youtu.be/YXRGP-dCz1M

Our Reviews:
https://g.page/r/CX7M8mMzDKqTEB0/review

Our Website:
https://www.sednainfosystems.com

Yours Sincerely,
Poonam Mishra
Sales Team | 9920432160
`;

  const dialogRef = this.dialog.open(MessageEditorComponent, {
    width: '500px',
    data: {
      initialMessage: initialMessage.trim(),
      contactno: item.contactno
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      console.log('Dialog closed with result:', result);
    }
  });
}
}








