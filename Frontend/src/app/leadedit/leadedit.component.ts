import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef  } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-leadedit',
  templateUrl: './leadedit.component.html',
  styleUrl: './leadedit.component.css'
})

export class LeadeditComponent {
  leadForm: FormGroup;
  user_id: any;
  username: any;
  leadData: any;
  productData: any;
  sourceData: any;
  profileData: any;
  stageData: any;
  reminderData: any;
  categoryData:any;
  lead: any;
  activeStage: any;
  selectedClient!: string;
  openFilterPopup: any;
  company_code: any;
  company_name: any;
  path: string;
  designation: any;
  file:any;
  filename: any;
  file_extn: any;
  lead_id: string;
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

    
  constructor(private Service:ApiserviceService,private router: Router, private route: ActivatedRoute,private zone: NgZone, private cdr: ChangeDetectorRef, private http: HttpClient){
    this.user_right = this.getUserRightFromLocalStorage();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      this.username = queryParams['username'];
      this.user_id = queryParams['user_id'];
      this.company_code = queryParams['company_code'];
      this.company_name = queryParams['company_name']; 
      this.user_right = queryParams['user_right'];
      });
      this.route.params.subscribe(params => {
      this.lead_id = params['lead_id'];
      });

      this.expireDate = localStorage.getItem('expire_date'); 
      
    this.leadForm = new FormGroup({
    personname:new FormControl('',Validators.required),
    companyname:new FormControl('',Validators.required),
    email:new FormControl(null),
    contactno:new FormControl('',Validators.required),
    city:new FormControl(null),
    designation:new FormControl('',Validators.required),
    address:new FormControl(null),
    source:new FormControl('',Validators.required),
    products:new FormControl('',Validators.required),
    stage: new FormControl('', [Validators.required]),
    reminder_status: new FormControl('', [Validators.required]),
    company_vertical:new FormControl(null),
    nextfollow_up_by: new FormControl(this.getTodayDate()),
    remark: new FormControl('', [Validators.required]),
    });
  
    if (this.company_code) {
      this.fetchImage(this.company_code);
    } else {
      console.error('Company code is not defined.');
    }
    
    this.getProducts(this.company_code); 
    this.getsource(this.company_code); 
    this.getprofile(this.company_code); 
    this.getstage(this.company_code);
    this.getreminder(this.company_code);
    this.getcategory(this.company_code);
    this.fetchData(this.lead_id); 
    }
    selectFile(event: any){
    this.file = event.target.files[0];
    console.log(this.file);
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

  fetchData(lead_id: string) {
    this.Service.fetchAllData(lead_id).subscribe(
      (res: any) => {
        console.log('Complete response:', res);
        if (res && res.data) { 
          const data = res.data;
          console.log('Data:', data);
          this.leadForm.patchValue({
            personname: data.personname || '',
            companyname: data.companyname || '',
            email: data.email || '',
            contactno: data.contactno || '',
            city: data.city || '',
            designation: data.designation || '',
            address: data.address || '',
            source: data.source || '',
            products: data.products || '',
            stage: data.stage || '',
            reminder_status: data.reminder_status || '',
            company_vertical: data.company_vertical || '',
            nextfollow_up_by: data.nextfollow_up_by || '',
            remark: data.remark || ''
          });
        } else {
          console.error('No data found or invalid response structure:', res);
        }
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }
  
  update() {
    const formData = this.leadForm.value;
      this.Service.leadupdate(formData, this.lead_id)
      .subscribe(
      (res: any) => {
      console.log('API Response:', res);
      if (res && res.message === 'Data Updated') {
      console.log('Data updated successfully');
      alert('Update data successfully..');
      } else {
      console.error('Unexpected API response:', res);
      alert('Error updating data. Unexpected response.');
      }
      },
      (error: any) => {
        console.error('API Error:', error);
        alert('Error updating data.');
        }
      );
    } 
  
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  getProducts(companyCode: string): void {
    this.Service.getProducts(companyCode).subscribe(
      (data: any) => {
        this.productData = data; 
        console.log('Lead Data:', this.productData);
      },
      (error) => {
        console.error('Error fetching lead data:', error);
      }
    );
  }
  
    getsource(companyCode: string): void {
    this.Service.getsource(companyCode).subscribe(
        (data: any) => {
            this.sourceData = data;
            console.log('Source Data:', this.sourceData); 
        },
        (error) => {
            console.error('Error fetching source data:', error);
        });
    }
    
    getprofile(companyCode: string): void{
      this.Service.getprofile(companyCode).subscribe(
        (data: any) => {
            this.profileData = data; 
            console.log('profile Data:', this.profileData);
        },
        (error) => {
            console.error('Error fetching source data:', error);
        });
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
  
    getreminder(companyCode: string): void{
      this.Service.getreminder(companyCode).subscribe(
        (data: any) => {
            this.reminderData = data; 
            console.log('reminder Data:', this.reminderData); 
        },
        (error) => {
            console.error('Error fetching source data:', error);
        });
    }
  
    getcategory(companyCode:string): void{
      this.Service.getbusiness(companyCode).subscribe(
        (data: any) => {
            this.categoryData = data; 
            console.log('category Data:', this.categoryData); 
        },
        (error) => {
            console.error('Error fetching source data:', error);
        });
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
  

