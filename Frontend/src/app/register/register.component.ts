import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef  } from '@angular/core';
import {NgxCroppedEvent, NgxPhotoEditorService} from "ngx-photo-editor";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
registerForm: FormGroup;
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
expireDate: string | null = '';
userRights: any[] = []; 
loading: boolean = false; 
errorMessage: string = ''; 
selectedUserIds: number[] = [];
showPassword: boolean = false;
showModal: boolean = false;
modalData: any = {
  user_id: '',
  username: '',
  password: ''
};

constructor(private Service:ApiserviceService,private router: Router, private route: ActivatedRoute,private zone: NgZone, private cdr: ChangeDetectorRef, private photoEditorService: NgxPhotoEditorService, private renderer: Renderer2){
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

this.registerForm = new FormGroup({
  company_code: new FormControl(this.company_code),
  username: new FormControl('',Validators.required),
  email:new FormControl('',Validators.required),
  password:new FormControl('',Validators.required),
  active:new FormControl(null),
  user_right:new FormControl('',Validators.required),
  selectedUsers: new FormControl(null),
});

  this.companyForm = new FormGroup({
    company_name: new FormControl('',Validators.required),
    company_logo: new FormControl(null),
    company_email:new FormControl('',Validators.required),
    company_mobile_no:new FormControl('',Validators.required),
    company_address:new FormControl('',Validators.required),
    payment:new FormControl('',Validators.required),
    total_user:new FormControl('',Validators.required),
    contact_person:new FormControl('',Validators.required),
    whatsapp_count:new FormControl('',Validators.required),
    profile:new FormControl('',Validators.required), 
  });

  if (this.company_code) {
    this.fetchImage(this.company_code);
  } else {
    console.error('Company code is not defined.');
  }

  this.getcompanydetails(this.company_code);
  this.expireDate = localStorage.getItem('expire_date');
  this.loading = true;
  this.Service.getUserRights(this.company_code).subscribe(
    (data) => {
      this.loading = false;
      this.userRights = data; 
    },
    (error) => {
      this.loading = false;
      this.errorMessage = 'Error fetching data: ' + error.message; 
    }
  );
}

handleAddUsersButtonClick(): void {
  const registrationFormSection = document.getElementById("registrationFormSection");
  if (registrationFormSection) {
    registrationFormSection.style.display = "block";
    this.hideOtherSections(["companyRegistrationFormSection", "userDetailButtonsDiv"]);
  }
}

handleManageUserButtonClick(): void {
  const userDetailButtonsDiv = document.getElementById("userDetailButtonsDiv");
  if (userDetailButtonsDiv) {
    userDetailButtonsDiv.style.display = "block";
    this.hideOtherSections(["registrationFormSection", "companyRegistrationFormSection"]);
  }
}

hideOtherSections(ids: string[]): Promise<void> {
  return new Promise<void>((resolve) => {
    ids.forEach((id, index) => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = "none";
      }
      if (index === ids.length - 1) {
        resolve();
      }
    });
  });
}

toggleCompanyDetails() {
  this.showCompanyDetails = !this.showCompanyDetails;
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

onSubmit() {
  if (this.registerForm.valid) {
    this.registerForm.patchValue({
      selectedUsers: this.selectedUserIds
    });
    this.Service.registration(this.registerForm.value).subscribe(
      (res) => {
        console.log(res);
        alert('Your Registration was Successful');
        this.registerForm.reset();
      },
      (error) => {
        console.error(error);
        if (error.status === 403 && error.error && error.error.error) {
          alert(error.error.error); 
        } else {
          alert('Error submitting the form'); 
        }
      }
    );
  } else {
    alert('Please fill in all the required fields.');
  }
}

onCheckboxChange(userId: number, event: any): void {
  const loggedInUserId = this.user_id; 
  const data = {
    userIds: [userId], 
    teammateId: loggedInUserId 
  };
  if (event.target.checked) {
    this.updateTeammates(data);
  } else {
    data.teammateId = null; 
    this.updateTeammates(data);
  }
}

updateTeammates(data: any) {
  this.Service.updateTeammates(data).subscribe(
    (res) => {
      console.log('Teammate updated successfully', res);
      alert('Your Team Created');
      this.resetCheckboxes(); 
    },
    (err) => {
      console.error('Error updating teammate', err);
      alert('Error updating your team');
    }
  );
}

resetCheckboxes() {
  this.selectedUserIds = [];  
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach((checkbox: any) => {
    checkbox.checked = false; 
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

Submit() {
  if (this.companyForm.valid) {
    const formData = new FormData();
    const fileInput = this.companyForm.get('company_logo')?.value;
    if (fileInput) {
      formData.append('company_logo', fileInput, fileInput.name);
    }
    formData.append('company_name', this.companyForm.get('company_name')?.value);
    formData.append('company_email', this.companyForm.get('company_email')?.value);
    formData.append('company_mobile_no', this.companyForm.get('company_mobile_no')?.value);
    formData.append('company_address', this.companyForm.get('company_address')?.value);
    formData.append('payment', this.companyForm.get('payment')?.value);
    formData.append('total_user', this.companyForm.get('total_user')?.value);
    formData.append('contact_person', this.companyForm.get('contact_person')?.value);
    formData.append('whatsapp_count', this.companyForm.get('whatsapp_count')?.value);
    formData.append('profile', this.companyForm.get('profile')?.value);
    formData.append('expire_date', this.companyForm.get('expire_date')?.value);
    this.Service.companyregistration(formData).subscribe(
      (res) => {
        console.log(res);
        alert('Your Company registration Successfully On CRM Portal.');
        this.companyForm.reset({});
      },
      (error) => {
        console.error(error); 
        alert('Error submitting the form');
      }
    );
  } else {
    alert('Please Fill In All The Required * Fields.');
  }
}

getcompanydetails(companyCode: string) {
  this.Service.getcompanydetails(companyCode).subscribe(
    (response: any) => {
      if (response && response.data && Array.isArray(response.data)) {
        this.leadData = response.data.map((lead: any, index: number) => ({ ...lead, serialNumber: index + 1 }));
        console.log('Lead Data:', this.leadData);
      } else {
        console.error('Invalid response format:', response);
      }
    },
    (error) => {
      console.error('Error fetching lead data:', error);
    }
  );
}

closePopup(): void {
  this.showPopup = false;
  console.log('closePopup() called. showPopup:', this.showPopup);
}

showCompanyUsers(companyCode: string) {
  this.Service.getUsersByCompanyCode(companyCode).subscribe(
    (users: any[]) => {
      console.log('Users for company', companyCode, ':', users);
      this.companyUsers = users;
      this.showPopup = true; 
      console.log(this.showPopup)
    },
    (error) => {
      console.error('Error fetching users:', error);
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
