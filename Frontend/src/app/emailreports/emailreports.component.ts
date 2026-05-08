import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { NgZone } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import * as XLSX from 'xlsx';

interface Lead {
  lead_id: number;
  personname: string;
  companyname: string;
  products: string;
  stage: string;
  nextfollow_up_by: Date;
  contactno: string;
  stage_color: string;
  selected: boolean;
}

@Pipe({
  name: 'orderBy'
})

export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: string, order: string): any[] {
    if (!array || !field || !order) {
      return array;
    }
    array.sort((a: any, b: any) => {
      const aValue = a[field];
      const bValue = b[field];
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
    return array;
  }
}

@Component({
  selector: 'app-emailreports',
  templateUrl: './emailreports.component.html',
  styleUrl: './emailreports.component.css'
})

export class EmailreportsComponent {
[x: string]: any;
user_id : any;
username: any;
serialNumber: number = 1;
isFilterModalOpen: boolean = false; 
leadData: any[] = [];  
filteredLeadData: any[] = [];  
selectedFilter: string = 'all';  
datePipe: any;
//filterLeads: any;
openFilterPopup: any;
lead: any;
notifications: any[] = [];
showPopup: boolean = false;
selectedNotification: any;
trashLeadData: any;
sortByField: string = '';
sortOrder: string = 'desc';
//leads: any[];
company_code: any;
company_name: any;
path: string;
isLeadOptionsVisible: boolean = false; 
showingLeadsLog: boolean = true;
showingEmailLog: boolean = false;
stageData: any[] = [];
selectedStage: string = '';
leads: any[] = [];
filteredLeads: any[] = [];
selectedTimeframe: string = ''; 
searchText: string = '';  // ✅ Search text store karega
 
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
isCalling: boolean = false;
currentLead: any;
selectedLeads: any[] = [];
originalLeads: any[] = [];

constructor(private zone: NgZone, private Service:ApiserviceService,private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private http: HttpClient){
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
  this.gettrashLeadData(); 
  this.getstage(this.company_code);
  this.getData(this.selectedTimeframe, this.company_code, this.user_right, this.username);
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

  // filterLeads() {
  //   const search = this.searchText.toLowerCase();
  //   this.filteredLeads = this.leads.filter(lead => 
  //     lead.personname.toLowerCase().includes(search) || 
  //     lead.companyname.toLowerCase().includes(search)
  //   );
  // }

  sortBy(field: string) {
    if (this.sortByField === field) {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
    this.sortByField = field;
    this.sortOrder = 'asc';
    }
    this.leadData.sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    if (aValue < bValue) {
      return this.sortOrder === 'asc' ? -1 : 1;
    } else if (aValue > bValue) {
      return this.sortOrder === 'asc' ? 1 : -1;
    } else {
        return 0;
    }
  });
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
    
gettrashLeadData() {
  this.Service.getautomail().subscribe(
  (data: any) => {
  this.leadData = data.map((lead: any, index: number) => ({ ...lead, serialNumber: index + 1 }));
  console.log('Lead Data:', this.leadData);
  },
  (error) => {
  console.error('Error fetching lead data:', error);
  }
  );
}
  
isLeadRestored: boolean = false;
  
restoreLead(leadId: number): void {
  this.Service.restoreLead(leadId).subscribe(
  () => {
  console.log('Lead restored successfully');
  alert('Lead Restored Successfully');
  window.location.reload(); 
  },
  (error) => {
    console.error('Error restoring lead:', error);
  }
  );
}
    
openrestoreConfirmation(leadId: number): void {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.panelClass = 'custom-dialog-container'; 
  dialogConfig.data = 'Are you sure you want to Restore Lead?';
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
  dialogRef.afterClosed().subscribe(result => {
  if (result === true) {
  this.restoreLead(leadId);
  } else {
  }
  });
}
    
deleteItem(id: number) {
  this.Service.deletetrashlead(id.toString()).subscribe(
  () => {
  console.log('Item deleted successfully');
  alert('Item deleted successfully');
  window.location.reload(); 
  },
  (error) => {
  console.error('Error deleting item:', error);
  alert('Error deleting item');
  });
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

openWhatsApp(contactNo: string): void {
  const message = encodeURIComponent('');
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${contactNo}&text=${message}`;
  window.open(whatsappUrl, '_blank');
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
    
navigateToViewLead(lead_id: string): void {
  this.router.navigate(['/view-leaddetails', lead_id], {
  queryParams: { 
  username: this.username,
  user_id: this.user_id,
  company_code: this.company_code,
  company_name: this.company_name,
  user_right: this.user_right
  }
  });
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
  navigateToleadEdit(lead_id: any): void {
  this.router.navigate(['/leadedit', lead_id], {
  queryParams: { 
  username: this.username,
  user_id: this.user_id,
  company_code: this.company_code,
  company_name: this.company_name,  
  }
  }); 
}
      
// getData(timeframe: string, companyCode: string): void {
//   const url = `https://prathhamcrm.com/nodeapp/${timeframe}/${companyCode}`;
//   this.http.get(url).subscribe(
//     (data: any) => {
//       console.log(data);
//       this.leads = this.removeDuplicates(data, 'lead_id');
//       this.filterLeadsByStage();
//     },
//     (error) => {
//       console.error('Error fetching data:', error);
//       this['snackBar'].open('Error fetching data. Please try again later.', 'Close', {
//         duration: 3000,
//       });
//     }
//   );
// }

// getData(timeframe: string, companyCode: string): void {
//   const url = `https://prathhamcrm.com/nodeapp/${timeframe}/${companyCode}`;
//   this.http.get(url).subscribe(
//     (data: any) => {
//       console.log(data);
//       this.leads = this.removeDuplicates(data, 'lead_id');
//       this.originalLeads = [...this.leads]; // 👈 Store data from radio button
//       this.filterLeadsByStage();
//     },
//     (error) => {
//       console.error('Error fetching data:', error);
//       this['snackBar'].open('Error fetching data. Please try again later.', 'Close', {
//         duration: 3000,
//       });
//     }
//   );
// }

getData(timeframe: string, companyCode: string, userRight: string, username: string): void {
  const url = `https://prathhamcrm.com/nodeapp/${timeframe}/${companyCode}?user_right=${userRight}&username=${username}`;
  
  this.http.get(url).subscribe(
    (response: any) => {
      console.log('API Response:', response);  // 👈 Check this in console
      this.leads = this.removeDuplicates(response.data, 'lead_id'); // 👈 use response.data, not response
      this.originalLeads = [...this.leads];
      this.filterLeadsByStage();
    },
    (error) => {
      console.error('Error fetching data:', error);
      this['snackBar'].open('Error fetching data. Please try again later.', 'Close', { duration: 3000 });
    }
  );
}


removeDuplicates(arr: any[], key: string): any[] {
  return arr.filter((value, index, self) => 
    index === self.findIndex((t) => (
      t[key] === value[key]
    ))
  );
}

showLeadsLog() {
  this.showingLeadsLog = true;
  this.showingEmailLog = false;
}

showEmailLog() {
  this.showingLeadsLog = false;
  this.showingEmailLog = true;
}

getstage(companyCode: string): void{
  this.Service.getstage(companyCode).subscribe(
    (data: any) => {
        this.stageData = data; 
        console.log('stage Data:', this.stageData); 
    },
    (error) => {
        console.error('Error fetching source data:', error);
    });
}

onTimeframeChange(timeframe: string): void {
  this.selectedTimeframe = timeframe;
  this.getData(this.selectedTimeframe, this.company_code, this.user_right, this.username); 
}

onStageChange(event: any): void {
  if (event && event.target && event.target.value) {
    this.selectedStage = event.target.value;
    console.log('Selected Stage:', this.selectedStage);
    this.filterLeadsByStage();
  } else {
    console.error('Event or event.target.value is null or undefined');
  }
}
filterLeads(): void {
  const search = this.searchText ? this.searchText.toLowerCase() : '';

  if (!search) {
    this.filteredLeads = [...this.leads]; // Agar search empty ho, sabhi leads dikhao
    return;
  }

  this.filteredLeads = this.leads.filter(lead => 
    lead.personname.toLowerCase().includes(search) || 
    lead.companyname.toLowerCase().includes(search)
  );
}

// filterLeadsByStage(): void {
//   const search = this.searchText.toLowerCase();
//   if (!this.selectedStage || this.selectedStage === '') {
//     this.filteredLeads = [...this.leads]; 
//   } else {
//     this.filteredLeads = this.leads.filter(lead => lead.stage === this.selectedStage);
//   }
// }

filterLeadsByStage(): void {
  const search = this.searchText?.toLowerCase() || '';

  if (!this.selectedStage || this.selectedStage === 'Select Stage') {
    // Stage filter removed → show all original leads
    this.filteredLeads = [...this.originalLeads];
  } else {
    // Stage filter applied
    this.filteredLeads = this.originalLeads.filter(lead =>
      lead.stage === this.selectedStage
    );
  }

  // Optional: Apply search filter after stage filter
  if (search) {
    this.filteredLeads = this.filteredLeads.filter(lead =>
      lead.personname.toLowerCase().includes(search) ||
      lead.companyname.toLowerCase().includes(search)
    );
  }
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

exportToExcel(): void {
  const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.querySelector('.styled-table'));
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, 'leads_data.xlsx');
}

selectAll(event: any) {
  const checked = event.target.checked;
  this.filteredLeads.forEach(lead => lead.selected = checked);
}

startAutoCall() {
  const selectedLeads = this.filteredLeads.filter(lead => lead.selected);
  selectedLeads.forEach(lead => {
    this.makeCall(lead.contactno);
  });
}

makeCall(contactNo: string) {
  const apiUrl = 'https://prathhamcrm.com/nodeapp/make-call'; 
  const params = { contactNo };
    this.http.get(apiUrl, { params }).subscribe(
      response => {
      console.log(`Call initiated for ${contactNo}`, response);
      alert("Voice call send sucessfully")
      },
      error => {
        console.error('Error making call to backend API', error);
        alert("Error Voice call submitted")
      }
    );
  }
  
}



    
  
  
   
  
  
  
  
  

