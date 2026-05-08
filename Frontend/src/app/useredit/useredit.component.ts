import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-useredit',
  templateUrl: './useredit.component.html',
  styleUrl: './useredit.component.css'
})

export class UsereditComponent {
updateuserForm: FormGroup;
username: any;
user_id: any;
company_code: any;
company_name: any;
path: string;
user_right: any;
isModalOpen = false;
expireDate: string | null = '';
showModal: boolean = false;
showPassword: boolean = false;
modalData: any = {
  user_id: '',
  username: '',
  password: ''
};

constructor(private cdRef: ChangeDetectorRef, private Service: ApiserviceService, private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,) {}

ngOnInit() {
  this.route.queryParams.subscribe(queryParams => {
  this.username = queryParams['username'];
  this.user_id = queryParams['user_id'];
  this.company_code = queryParams['company_code'];
  this.company_name = queryParams['company_name']; 
  this.user_right = queryParams['user_right'];
  });
 
  this.updateuserForm = this.formBuilder.group({ 
    company_code: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
    active: ['', Validators.required],
    reg_date: ['', Validators.required],
    user_right: ['', Validators.required],
  });

  this.route.params.subscribe(params => {
    this.user_id = params['user_id'];  
    this.fetchData(this.user_id);    
  });

  if (this.company_code) {
    this.fetchImage(this.company_code);
  } else {
    console.error('Company code is not defined.');
  }
  this.expireDate = localStorage.getItem('expire_date');
}
 
logout() {
  this.router.navigate(['/login']);
}

dash1() {
  this.route.queryParams.subscribe(queryParams => {
    this.user_id = queryParams['user_id'];  
    console.log('Navigating with company_code from queryParams:', this.user_id);
    if (!this.user_id) {
      console.error('Invalid company_code from queryParams:', this.user_id);
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
    this.user_id = queryParams['user_id'];  
    console.log('Navigating with company_code from queryParams:', this.user_id);
    if (!this.user_id) {
      console.error('Invalid company_code from queryParams:', this.user_id);
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

navigateTouser(){
  this.route.queryParams.subscribe(queryParams => {
    this.user_id = queryParams['user_id'];  
    console.log('Navigating with company_code from queryParams:', this.user_id);
    if (!this.user_id) {
      console.error('Invalid company_code from queryParams:', this.user_id);
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

navigateTomanageuser(){
  this.route.queryParams.subscribe(queryParams => {
    this.user_id = queryParams['user_id'];  
    console.log('Navigating with company_code from queryParams:', this.user_id);
    if (!this.user_id) {
      console.error('Invalid company_code from queryParams:', this.user_id);
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

navigateTomasterentry(){
  this.route.queryParams.subscribe(queryParams => {
    this.user_id = queryParams['user_id'];  
    console.log('Navigating with company_code from queryParams:', this.user_id);
    if (!this.user_id) {
      console.error('Invalid company_code from queryParams:', this.user_id);
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
  this.user_id = queryParams['user_id'];  
  console.log('Navigating with company_code from queryParams:', this.user_id);
  if (!this.user_id) {
    console.error('Invalid company_code from queryParams:', this.user_id);
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

navigateToFaceboookpage(){
  this.route.queryParams.subscribe(queryParams => {
    this.user_id = queryParams['user_id'];  
    console.log('Navigating with company_code from queryParams:', this.user_id);
    if (!this.user_id) {
      console.error('Invalid company_code from queryParams:', this.user_id);
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


navigateReportspage(){
  this.route.queryParams.subscribe(queryParams => {
    this.user_id = queryParams['user_id'];  
    console.log('Navigating with company_code from queryParams:', this.user_id);
    if (!this.user_id) {
      console.error('Invalid company_code from queryParams:', this.user_id);
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
    this.user_id = queryParams['user_id'];  
    console.log('Navigating with company_code from queryParams:', this.user_id);
    if (!this.user_id) {
      console.error('Invalid company_code from queryParams:', this.user_id);
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

fetchData(user_id: string) {
  this.Service.getuser(user_id).subscribe(
    (res: any) => {
      console.log('Complete response:', res);
      if (res && res.data) {
        const data = res.data;
        if (data) {
          console.log('Data to be patched:', data);
          this.updateuserForm.patchValue({
            company_code: data.company_code || '',
            username: data.username || '',
            email: data.email || '',
            password: data.password || '',
            active: data.active || '',
            reg_date: data.reg_date || '',
            user_right: data.user_right || ''
          });
        } else {
          console.error('Data is null or undefined');
        }
      } else {
        console.error('No data found in response:', res);
      }
    },
    (error) => {
      console.error('Error fetching data:', error);
    }
  );
}

update() {
  const formData = this.updateuserForm.value;
  this.Service.userupdate(formData, this.user_id)  
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

