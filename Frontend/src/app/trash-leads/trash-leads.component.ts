import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgZone } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ChangeDetectorRef  } from '@angular/core';

@Component({
  selector: 'app-trash-leads',
  templateUrl: './trash-leads.component.html',
  styleUrl: './trash-leads.component.css'
})

export class TrashLeadsComponent {
user_id : any;
username: any;
serialNumber: number = 1;
isFilterModalOpen: boolean = false; 
leadData: any[] = [];  
filteredLeadData: any[] = [];  
selectedFilter: string = 'all';  
datePipe: any;
filterLeads: any;
openFilterPopup: any;
lead: any;
notifications: any[] = [];
showPopup: boolean = false;
selectedNotification: any;
trashLeadData: any;
company_code: any;
company_name: any;
path: string;
leads: any[] = [];
isLeadRestored: boolean = false;
user_right: any;
accessDenied: boolean = false;
isModalOpen = false;
expireDate: string | null = '';
showModal: boolean = false;
showPassword: boolean = false;
modalData: any = {
  user_id: '',
  username: '',
  password: ''
};

constructor(private zone: NgZone, private Service:ApiserviceService,private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private changeDetectorRef: ChangeDetectorRef){
  this.user_right = this.getUserRightFromLocalStorage();
}

ngOnInit() {
  this.route.params.subscribe(params => {
  this.user_id = params['user_id']; 
  });
  this.route.queryParams.subscribe(queryParams => {
  this.username = queryParams['username']; 
  this.company_code = queryParams['company_code'];
  this.company_name = queryParams['company_name'];
  this.user_right = queryParams['user_right'];
  });

  if (this.company_code) {
  this.fetchImage(this.company_code);
  } else {
  console.error('Company code is not defined.');
  }
  this.gettrashLeadData(this.company_code); 
  this.expireDate = localStorage.getItem('expire_date');
}

fetchImage(companyCode: string) {
  this.Service.getCompanyLogoUrl(companyCode).subscribe(
  (imageBlob: Blob) => {
  const imageUrl = URL.createObjectURL(imageBlob);
  console.log('Image URL:', imageUrl);
  this.path = imageUrl;
  },
  error => {
  console.error('Error fetching company logo:', error);
  }
  );
}
  
navigateToFamilyPage() {
  if (this.user_id !== undefined) {
  const queryParams = {
  username: this.username,
  company_code: this.company_code,
  company_name: this.company_name,
  user_right: this.user_right
  };
  this.router.navigate(['/addLead', this.user_id], { queryParams });
  } else {
  console.error('user_id is undefined. Unable to navigate.');
}
}
 
gettrashLeadData(companyCode: string) {
  this.Service.gettrashlead(companyCode).subscribe(
  (data: any) => {
  this.leadData = data.map((lead: any, index: number) => ({ ...lead, serialNumber: index + 1 }));
  console.log('Lead Data:', this.leadData);
  },
  (error) => {
  console.error('Error fetching lead data:', error);
  });
}

restoreLead(lead_id: number): void {
  this.Service.restoreLead(lead_id).subscribe(
  () => {
  console.log('Lead restored successfully');
  alert('Lead Restored Successfully');
  this.dash1(); 
  },
  (error) => {
  console.error('Error restoring lead:', error);
  }
);
}

openrestoreConfirmation(lead_id: number): void {
const dialogConfig = new MatDialogConfig();
dialogConfig.panelClass = 'custom-dialog-container'; 
dialogConfig.data = 'Are you sure you want to Restore Lead?';
const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
dialogRef.afterClosed().subscribe(result => {
if (result === true) {
this.restoreLead(lead_id);
} else {
}
});
}

deleteItem(id: number) {
  this.Service.deletetrashlead(id.toString()).subscribe(
  () => {
  console.log('Item deleted successfully');
  alert('Item deleted successfully');
  this.updateLeadDataAfterDeletion(id);
  this.changeDetectorRef.detectChanges();
  },
  (error) => {
  console.error('Error deleting item:', error);
  alert('Error deleting item');
  }
);
}

updateLeadDataAfterDeletion(deletedId: number) {
  const index = this.leadData.findIndex(lead => lead.id === deletedId);
  if (index !== -1) {
  this.leadData.splice(index, 1);
}
}

openDeleteConfirmation(statusId: number): void {
const dialogConfig = new MatDialogConfig();
dialogConfig.panelClass = 'custom-dialog-container'; 
dialogConfig.data = 'Are you sure you want to Permanantally delete?';
const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
dialogRef.afterClosed().subscribe(result => {
if (result === true) {
this.deleteItem(statusId);
} else {
}
});
}
  
navigateToUpdateLead(lead_id: number, personName: string, email: string) {
this.router.navigate(['/updatelead'], {
queryParams: {
lead_id: lead_id,
personname: personName,
email: email,
username: this.username,
user_id: this.user_id  
}
});
}

navigateTouser(){
  if (this.user_id !== undefined) {
  const queryParams = {
  username: this.username,
  company_code: this.company_code,
  company_name: this.company_name,
  user_right: this.user_right
  };
  this.router.navigate(['/register', this.user_id], { queryParams });
  } else {
  console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateTomanageuser(){
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
     user_right: this.user_right
    };
    this.router.navigate(['/manageruser', this.user_id], { queryParams });
  } else {
    console.error('user_id is undefined. Unable to navigate.');
  }
}

navigatevisistingcardpage(){
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right
    };
      this.router.navigate(['/visitingcard-scanner', this.user_id], { queryParams });
  }else {
      console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateTotrashpage(){
  if (this.user_id !== undefined) {
  const queryParams = {
  username: this.username,
  company_code: this.company_code,
  company_name: this.company_name,
  user_right: this.user_right
  };
  this.router.navigate(['/trash_leads', this.user_id], { queryParams });
  } else {
  console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateTomasterentry(){
  if (this.user_id !== undefined) {
  const queryParams = {
  username: this.username,
  company_code: this.company_code,
  company_name: this.company_name,
  user_right: this.user_right
  };
  this.router.navigate(['/masters_entry', this.user_id], { queryParams });
  } else {
  console.error('user_id is undefined. Unable to navigate.');
  }
}
  
navigateToleadstatastics(){
  if (this.user_id !== undefined) {
  const queryParams = {
  username: this.username,
  company_code: this.company_code,
  company_name: this.company_name,
  user_right: this.user_right
  };
  this.router.navigate(['/lead_statastics', this.user_id], { queryParams });
 } else {
  console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateReportspage(){
  if (this.user_id !== undefined) {
  const queryParams = {
  username: this.username,
  company_code: this.company_code,
  company_name: this.company_name,
  user_right: this.user_right
  };
  this.router.navigate(['/email_reports', this.user_id], { queryParams });
  } else {
  console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateToFaceboookpage(){
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
    user_right: this.user_right
    };
    this.router.navigate(['/facebookleads', this.user_id], { queryParams });
  } else {
    console.error('user_id is undefined. Unable to navigate.');
  }
}

  
closePopup(): void {
  this.showPopup = false;
  console.log('closePopup() called. showPopup:', this.showPopup);
}

logout() {
  this.router.navigate(['/login']); 
}

dash1() {
  const queryParams = {
  username: this.username, 
  company_code: this.company_code,
  company_name: this.company_name,
  user_right: this.user_right
  };
  
  this.router.navigate(['/dashboard', this.user_id], { queryParams });
}

dash2() {
  const queryParams = {
    username: this.username, 
    company_code: this.company_code,
    company_name: this.company_name,
    user_right: this.user_right
  };
this.router.navigate(['/dashboard', this.user_id], { queryParams });
}

makePhoneCall(mobileno: string) {
  const cleanmobileno = mobileno.replace(/\D/g, '');
  const telUri = `tel:${cleanmobileno}`;
  window.location.href = telUri;
}

getLeads(adId: string): void {
  this.Service.getLeadAds(adId).subscribe(
  (response) => {
  console.log('Received leads:', response);
  this.leads = response.data;
  },
  (error) => {
  console.error('Error fetching leads:', error);
  }
);
}
  
getLeadValue(lead: any, key: string): string {
  const fieldDataItem = lead.field_data.find((item: any) => item.name === key);
  return fieldDataItem ? fieldDataItem.values[0] : '';
}

showAccessDenied() {
  this.accessDenied = true;
  setTimeout(() => this.accessDenied = false, 3000); 
}

private getUserRightFromLocalStorage(): string {
  return localStorage.getItem('user_right') || 'default';
}

openModal() {
  this.isModalOpen = true;
}

openUserPopup(userId: string, userName: string) {
  this.modalData.user_id = userId;
  this.modalData.username = userName;
  this.modalData.password = ''; 
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
}

submitUserForm() {
  console.log('Form submitted:', this.modalData);
  this.Service.updatePassword(this.modalData.user_id, this.modalData.password).subscribe(
    (response) => {
      console.log('Password update response:', response);
      alert('Password updated successfully');
      this.closeModal();
    },
    (error) => {
      console.error('Error updating password:', error);
      alert('Error updating password');
    }
  );
}

togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}

}
 




