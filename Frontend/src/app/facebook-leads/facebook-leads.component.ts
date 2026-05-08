import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from '../apiservice.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-facebook-leads',
  templateUrl: './facebook-leads.component.html',
  styleUrls: ['./facebook-leads.component.css']
})

export class FacebookLeadsComponent implements OnInit {
  leads: any[] = [];
  adId: string = ''; 
  user_id: any;
  username: any;
  company_code: any;
  company_name: any;
  user_right: any;
  path: string;
  isModalOpen = false;
  showModal: boolean = false;
  modalData: any = {
  user_id: '',
  username: '',
  password: ''
};
showPassword: boolean = false;
expireDate: string | null = '';
  
  constructor(private service: ApiserviceService, private router: Router, private route: ActivatedRoute) { }

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
  

  getLeads(): void {
    if (this.adId.trim()) {
      this.service.getLeadAds(this.adId).subscribe(
        (response) => {
          console.log('Received leads:', response);
          this.leads = response.data;
          if (!this.leads || this.leads.length === 0) {
            alert('No data available for the given Ad ID.');
          }
        },
        (error) => {
          console.error('Error fetching leads:', error);
          alert('Error fetching leads. Please try again.');
        }
      );
    } else {
      console.error('Ad ID cannot be empty');
      alert('Ad ID cannot be empty');
    }
  }
  
  getLeadValue(lead: any, key: string): string {
    const fieldDataItem = lead.field_data.find((item: any) => item.name === key);
    return fieldDataItem ? fieldDataItem.values[0] : '';
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

  fetchImage(companyCode: string) {
    this.service.getCompanyLogoUrl(companyCode).subscribe(
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
    this.service.updatePassword(this.modalData.user_id, this.modalData.password).subscribe(
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
    XLSX.writeFile(wb, 'facebookleads_data.xlsx');
  }
}
