import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd  } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';

@Component({
  selector: 'app-visiting-card-scanner',
  templateUrl: './visiting-card-scanner.component.html',
  styleUrls: ['./visiting-card-scanner.component.css']
})

export class VisitingCardScannerComponent {
selectedFile: File | null = null;
extractedData: any = null;
isModalOpen = false;
user_id: any; 
username: any; 
company_code: any;
company_name: any;
user_right: any;
showModal: boolean = false;
showModals: boolean = false;
showPassword: boolean = false;
path:string|null=null;
expireDate: string | null = '';
isLoading: boolean = false;
modalData: any = {
  user_id: '',
  username: '',
  password: ''
};

isFormVisible: boolean = false; 
tempExtractedData: any = null;  

constructor(private fb: FormBuilder, private Service:ApiserviceService, private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

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
  this.expireDate = localStorage.getItem('expire_date');
  if (this.company_code) {
    this.fetchImage(this.company_code);
  } else {
    console.error('Company code is not defined.');
  }
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


onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
  if (this.selectedFile) {
  }
}

onUpload() {
  if (!this.selectedFile) {
    alert("Please select a file first.");
    return;
  }
  this.isLoading = true;
  const formData = new FormData();
  formData.append("image", this.selectedFile);
  this.http.post<any>("https://prathhamcrm.com/nodeapp/upload", formData).subscribe(response => {
    console.log("📩 Upload Response:", response);
    this.extractedData = response.data || { personname: "", companyname: "", contactno: "", email: "", address: "" };
    this.isLoading = false;
  }, error => {
    console.error("❌ Upload Error:", error);
  });
}

onSubmit() {
  const payload = {
    ...this.extractedData, 
    company_code: this.company_code, 
    username: this.username 
  };
  this.http.post<any>('https://prathhamcrm.com/nodeapp/save', payload).subscribe(response => {
    console.log('✅ Save Response:', response);
    alert('Data Saved Successfully!');
    this.extractedData = {
      personname: '',
      contactno: '',
      email: '',
      companyname: '',
      address: ''
    };
  }, error => {
    console.error('❌ Save Error:', error);



  });
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

navigateReportspage(){
if (this.user_id !== undefined) {
  const queryParams = {
    username: this.username,
    company_code: this.company_code,
    company_name: this.company_name,
    user_right: this.user_right
  };
    this.router.navigate(['/email_reports', this.user_id], { queryParams });
}else {
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
  };
  this.router.navigate(['/dashboard', this.user_id], { queryParams });
}

navigateToleadEdit(lead_id: any): void {
  this.router.navigate(['/leadedit', lead_id], {
    queryParams: { 
      username: this.username,
      user_id: this.user_id,
      company_code: this.company_code,
      company_name: this.company_name, 
      user_right: this.user_right 
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

openModal() {
  this.isModalOpen = true;
}

logout() {
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
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


  

  
