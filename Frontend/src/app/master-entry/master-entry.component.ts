import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgZone } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ChangeDetectorRef  } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-master-entry',
  templateUrl: './master-entry.component.html',
  styleUrl: './master-entry.component.css'
})

export class MasterEntryComponent {
user_id: any;
username: any;
company_code: any;
company_name: any;
path: string;
fetchedData: any[] = [];
tableHeaders: any = {};
selectedOption: string = '';
showInput: boolean = false;
inputValue: string = '';
http: any;
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

color: string = '#000000';
quantity: number = 1;
options = [
  { label: 'Business Category', value: 'business_category' },
  { label: 'Products', value: 'products' },
  { label: 'Profile', value: 'profile' },
  { label: 'Reminder', value: 'reminder' },
  { label: 'Source', value: 'source' },
  { label: 'Stage', value: 'stage' }
];

constructor(private zone: NgZone, private Service:ApiserviceService,private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private changeDetectorRef: ChangeDetectorRef, private _http:HttpClient){
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

fetchData(sortBy: string, companyCode: string) {
  this.Service.fetchData(sortBy, companyCode).subscribe(
    data => {
      this.fetchedData = data;
   
      this.tableHeaders = this.getTableHeaders(sortBy);
         this.sortDataByName();
    },
    error => {
      console.error('Error fetching data:', error);
    }
  );
}

sortDataByName() {
  this.fetchedData.sort((a, b) => a[this.tableHeaders.name].localeCompare(b[this.tableHeaders.name]));
}
getTableHeaders(sortBy: string): any {
  switch (sortBy) {
    case 'source':
      return { id: 'id', name: 'source_name' };
    case 'products':
      return { id: 'id', name: 'product_name', quantity: 'quantity' };
    case 'stage':
      return { id: 'id', name: 'stage_name', color: 'color' };
    case 'profile':
      return { id: 'id', name: 'profile_name' };
    case 'business_category':
      return { id: 'id', name: 'category_name' };
    case 'reminder':
      return { id: 'id', name: 'reminder_name' };
    default:
      return {};
  }
}

selectOption(option: string) {
  this.selectedOption = option;
  this.fetchData(option, this.company_code); 
  this.showInput = true; 
}

editItem(item: any) {
  item.isEditing = true;
  item.originalColor = item[this.tableHeaders.color];
}

cancelEdit(item: any) {
  item.isEditing = false;
  item[this.tableHeaders.color] = item.originalColor; 
}

saveItem(item: any) {
  const newColor = item[this.tableHeaders.color];
  const itemId = item[this.tableHeaders.id];

  console.log('Saving color:', newColor, 'for item with ID:', itemId);
  this.Service.updateItemColor(itemId, newColor).subscribe(
    response => {
      console.log('Response from backend:', response);
      item.isEditing = false;
      item.originalColor = newColor;
      this.fetchData(this.selectedOption, this.company_code);
    },
    error => {
      console.error('Error updating color:', error);
      item[this.tableHeaders.color] = item.originalColor;
      item.isEditing = false;
    }
  );
}

deleteItem(id: any) {
  if (!this.selectedOption) {
      console.error('Selected option is null. Cannot delete item.');
      return;
  }
  this.Service.deleteItem(this.selectedOption, id).subscribe(
      response => {
          console.log('Item deleted successfully:', response);
          if (this.selectedOption) {
              this.fetchData(this.selectedOption, this.company_code);
          } else {
              console.error('Selected option is null. Cannot fetch data.');
          }
      },
      error => {
          console.error('Error deleting item:', error);
      }
  );
}

submitData() {
  if (!this.selectedOption || !this.inputValue || !this.company_code) {
    console.error('Please provide selectedOption, inputValue, and company_code.');
    return;
  }

  // Extra validation if stage or products selected
  if (this.selectedOption === 'stage' && !this.color) {
    console.error('Please provide color for stage.');
    return;
  }

  if (this.selectedOption === 'products' && (!this.quantity || this.quantity <= 0)) {
    console.error('Please provide quantity for products.');
    return;
  }

  const data: any = {
    selectedOption: this.selectedOption,
    inputValue: this.inputValue,
    company_code: this.company_code
  };

  if (this.selectedOption === 'stage') {
    data.color = this.color;
  }

  if (this.selectedOption === 'products') {
    data.quantity = this.quantity;
  }

  console.log('Submitting Data:', data);

  this._http.post<any>('https://prathhamcrm.com/nodeapp/insertdata', data).subscribe(
    response => {
      console.log('Data inserted successfully:', response);
      this.inputValue = '';  
      this.color = '#000000'; 
      this.quantity = 1;
      this.fetchData(this.selectedOption, this.company_code);
    },
    error => {
      console.error('Error inserting data:', error);
    }
  );
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




