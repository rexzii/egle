import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef  } from '@angular/core';
import {NgxCroppedEvent, NgxPhotoEditorService} from "ngx-photo-editor";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-updatecompany',
  templateUrl: './updatecompany.component.html',
  styleUrl: './updatecompany.component.css'
})

export class UpdatecompanyComponent {
[x: string]: any;
updatecompanyForm: FormGroup;
user_id: any;
username: any;
company_code: any;
company_name: any;
path: string;
companyForm: FormGroup;
imgChangeEvt: any = '';
cropImgPreview: any = '';
isFormEmpty: any;
output?: NgxCroppedEvent;
leadData: any[] = []; 
showCompanyDetails: boolean = false;
companyUsers: any[];
showPopup: boolean = false;
user_right: any;
accessDenied: boolean = false;
isModalOpen = false;
formBuilder: any;
activeStage: any;
expireDate: string | null = '';
showModal: boolean = false;
showPassword: boolean = false;
companyLogoUrl: string | null = null; 
logoFileName: string | null = null;   
selectedLogo: File | null = null;
modalData: any = {
  user_id: '',
  username: '',
  password: ''
};
  
constructor(private Service:ApiserviceService,private router: Router, private route: ActivatedRoute,private zone: NgZone, private cdr: ChangeDetectorRef, private photoEditorService: NgxPhotoEditorService, private renderer: Renderer2, private http: HttpClient){
  this.user_right = this.getUserRightFromLocalStorage();
}

ngOnInit(): void {
  this.route.queryParams.subscribe(queryParams => {
    this.username = queryParams['username'];
    this.company_code = queryParams['company_code'];  
    this.company_name = queryParams['company_name'];
    this.user_right = queryParams['user_right'];
    this.user_id = queryParams['user_id'];  
    console.log('Query Params:', queryParams);  
  });

  if (this.company_code) {
    this.fetchImage(this.company_code);
  } else {
    console.error('Company code is not defined.');
  }

  this.updatecompanyForm = new FormGroup({
    company_name: new FormControl('', Validators.required),
    company_email: new FormControl('', [Validators.required, Validators.email]),
    company_mobile_no: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    company_address: new FormControl('', Validators.required),
    payment: new FormControl('', Validators.required),
    total_user: new FormControl('', Validators.required),
    contact_person: new FormControl('', Validators.required),
    whatsapp_count: new FormControl('', Validators.required),
    profile: new FormControl('', Validators.required),
    expire_date: new FormControl('', Validators.required),
    company_logo: new FormControl(''),
  });
  

  this.route.params.subscribe(params => {
    const pathCompanyCode = params['company_code'];  
    if (pathCompanyCode) {
      this.company_code = pathCompanyCode;
    }
    if (this.company_code) {
      this.fetchCompanyData(this.company_code);
    } else {
      console.error('Company code not available in path or query params');
    }
  });
  this.expireDate = localStorage.getItem('expire_date');
}


fetchCompanyData(company_code: string): void {
  this.Service.getcompany(company_code).subscribe(
  (res: any) => {
  console.log('API Response:', res);
  console.log('Response Data:', res.data);
  if (res && res.data && (Array.isArray(res.data) ? res.data.length > 0 : true)) {
  const data = Array.isArray(res.data) ? res.data[0] : res.data;
  console.log('Fetched Data:', data);
  let expireDate = data.expire_date;
  let formattedExpireDate = ''; 
  if (expireDate) {
  const date = new Date(expireDate);  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = date.getFullYear();  
  formattedExpireDate = `${year}-${month}-${day}`;
  console.log('Formatted Expiry Date (yyyy-MM-dd):', formattedExpireDate);
}
          this.updatecompanyForm.patchValue({
            company_name: data.company_name || '',
            company_email: data.company_email || '',
            company_mobile_no: data.company_mobile_no || '',
            company_address: data.company_address || '',
            payment: data.payment || '',
            total_user: data.total_user || '',
            contact_person: data.contact_person || '',
            whatsapp_count: data.whatsapp_count || '',
            profile: data.profile || '',
            expire_date: formattedExpireDate || '', 
           // company_logo: data.company_logo || ''
          });
          this.companyLogoUrl = data.company_logo;
          if (data.company_logo) {
            const logoFileName = data.company_logo.split('/').pop();
          this.logoFileName = logoFileName;
            const logoPath = `https://prathhamcrm.com/Lead-Mnagement/uploads/${data.company_logo}`;
            console.log('Current Company Logo Path:', logoPath);
            this.companyLogoUrl = logoPath;
          }
        } else {
          console.error('No data found or invalid response format');
        }
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }
  
  
  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogo = file;
      this.logoFileName = file.name; 
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.companyLogoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedLogo = null;
      this.logoFileName = null;
      this.companyLogoUrl = null;
    }
  }

  update(): void {
    const formData = new FormData();
    formData.append('company_name', this.updatecompanyForm.value.company_name);
    formData.append('company_email', this.updatecompanyForm.value.company_email);
    formData.append('company_mobile_no', this.updatecompanyForm.value.company_mobile_no);
    formData.append('company_address', this.updatecompanyForm.value.company_address);
    formData.append('payment', this.updatecompanyForm.value.payment);
    formData.append('total_user', this.updatecompanyForm.value.total_user);
    formData.append('contact_person', this.updatecompanyForm.value.contact_person);
    formData.append('whatsapp_count', this.updatecompanyForm.value.whatsapp_count);
    formData.append('profile', this.updatecompanyForm.value.profile);
    formData.append('expire_date', this.updatecompanyForm.value.expire_date);
    if (this.selectedLogo) {
      formData.append('company_logo', this.selectedLogo, this.selectedLogo.name);
    } else if (this.companyLogoUrl) {
      const logoFileName = this.companyLogoUrl.split('/').pop();  
      formData.append('company_logo', logoFileName || '');  
    }
  
    this.http.put(`https://prathhamcrm.com/nodeapp/companyupdate/${this.company_code}`, formData)
      .subscribe(response => {
        console.log('Company updated successfully:', response);
        alert('Company updated!');
      }, error => {
        console.error('Error updating company:', error);
        alert('Error updating company');
      });
  }
  

logout() {
  this.router.navigate(['/login']);
}

dash1() {
  this.route.queryParams.subscribe(queryParams => {
    this.company_code = queryParams['company_code'];  
    console.log('Navigating with company_code from queryParams:', this.company_code);
    if (!this.company_code) {
      console.error('Invalid company_code from queryParams:', this.company_code);
      return;
    }
    const queryParamsToPass = {
      username: this.username,
      company_code: this.company_code, 
      company_name: this.company_name,
      user_right: this.user_right,
    };
    this.router.navigate(['/dashboard', this.user_id], { queryParams: queryParamsToPass });
  });
}

navigateTotrashpage(){
  this.route.queryParams.subscribe(queryParams => {
    this.company_code = queryParams['company_code'];
    console.log('Navigating with company_code from queryParams:', this.company_code);
    if (!this.company_code) {
      console.error('Invalid company_code from queryParams:', this.company_code);
      return;
    }
    const queryParamsToPass = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right,
    };
    this.router.navigate(['/trash_leads', this.user_id], { queryParams: queryParamsToPass });
  });
}

navigateToFaceboookpage(){
  this.route.queryParams.subscribe(queryParams => {
    this.company_code = queryParams['company_code'];
    console.log('Navigating with company_code from queryParams:', this.company_code);
    if (!this.company_code) {
      console.error('Invalid company_code from queryParams:', this.company_code);
      return;
    }
    const queryParamsToPass = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right,
    };
    this.router.navigate(['/facebookleads', this.user_id], { queryParams: queryParamsToPass });
  });
}

  
navigateTouser(){
  this.route.queryParams.subscribe(queryParams => {
    this.company_code = queryParams['company_code'];
    console.log('Navigating with company_code from queryParams:', this.company_code);
    if (!this.company_code) {
      console.error('Invalid company_code from queryParams:', this.company_code);
      return;
    }
    const queryParamsToPass = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right,
    };
    this.router.navigate(['/register', this.user_id], { queryParams: queryParamsToPass });
  });
}

navigateTomanageuser(){
  this.route.queryParams.subscribe(queryParams => {
    this.company_code = queryParams['company_code'];
    console.log('Navigating with company_code from queryParams:', this.company_code);
    if (!this.company_code) {
      console.error('Invalid company_code from queryParams:', this.company_code);
      return;
    }
    const queryParamsToPass = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right,
    };
    this.router.navigate(['/manageruser', this.user_id], { queryParams: queryParamsToPass });
  });

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

navigateToleadEdit(company_code: any): void {
  this.router.navigate(['/companyedit', company_code], {
    queryParams: { 
      username: this.username,
      user_id: this.user_id,
      company_code: this.company_code,
      company_name: this.company_name, 
      user_right: this.user_right 
    }
  }); 
}
  
navigateTomasterentry(){
  this.route.queryParams.subscribe(queryParams => {
    this.company_code = queryParams['company_code'];
    console.log('Navigating with company_code from queryParams:', this.company_code);
    if (!this.company_code) {
      console.error('Invalid company_code from queryParams:', this.company_code);
      return;
    }
    const queryParamsToPass = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right,
    };
    this.router.navigate(['/masters_entry', this.user_id], { queryParams: queryParamsToPass });
  });
}
  
navigateToleadstatastics(){
  this.route.queryParams.subscribe(queryParams => {
    this.company_code = queryParams['company_code'];
    console.log('Navigating with company_code from queryParams:', this.company_code);
    if (!this.company_code) {
      console.error('Invalid company_code from queryParams:', this.company_code);
      return;
    }
    const queryParamsToPass = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right,
    };
    this.router.navigate(['/lead_statastics', this.user_id], { queryParams: queryParamsToPass });
  });
}

navigateReportspage(){
  this.route.queryParams.subscribe(queryParams => {
    this.company_code = queryParams['company_code'];
    console.log('Navigating with company_code from queryParams:', this.company_code);
    if (!this.company_code) {
      console.error('Invalid company_code from queryParams:', this.company_code);
      return;
    }
    const queryParamsToPass = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right,
    };
    this.router.navigate(['/email_reports', this.user_id], { queryParams: queryParamsToPass });
  });
}

navigateToFamilyPage() {
  this.route.queryParams.subscribe(queryParams => {
    this.company_code = queryParams['company_code'];
    console.log('Navigating with company_code from queryParams:', this.company_code);
    if (!this.company_code) {
      console.error('Invalid company_code from queryParams:', this.company_code);
      return;
    }
    const queryParamsToPass = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right,
    };
    this.router.navigate(['/addLead', this.user_id], { queryParams: queryParamsToPass });
  });
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

private getUserRightFromLocalStorage(): string {
  return localStorage.getItem('user_right') || 'default';
}

dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
  ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
  
fileChangeHandler($event: any) {
  const file = $event.target.files[0];
  this.companyForm.patchValue({ company_logo: file });
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
