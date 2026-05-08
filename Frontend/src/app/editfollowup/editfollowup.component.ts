import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editfollowup',
  templateUrl: './editfollowup.component.html',
  styleUrl: './editfollowup.component.css'
})

export class EditfollowupComponent {
updatefolowupForm: FormGroup;
lead_id: number;
personname: string;
user_id: any;
username: any;
status_id: any;
fetchedData: any;
company_code: any;
company_name: any;
stageData: any;
user_right: any;
accessDenied: boolean = false;

constructor(private Service: ApiserviceService, private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,) {
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
  this.status_id = params['status_id'];
  });
  this.updatefolowupForm = this.formBuilder.group({
    lead_id: new FormControl(this.lead_id), 
    personname: new FormControl(this.personname), 
    follow_up_time: ['', Validators.required],
    nextfollow_up_by: ['', Validators.required],
    stage: ['', Validators.required],
    reminder_status: ['', Validators.required],
    remark: ['', Validators.required],
  });
  this.route.params.subscribe(params => {
  this.status_id = params['status_id'];
  this.fetchData(this.status_id); 
  });
  this.getstage(this.company_code);
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
  
fetchData(status_id: string) {
  this.Service.getfollowup(status_id).subscribe(
  (res: any) => {
  console.log('Complete response:', res);
  if (res && Array.isArray(res.data) && res.data.length > 0) {
  const data = res.data[0]; 
  console.log('Data:', data);
  this.updatefolowupForm.patchValue({
  lead_id: data.lead_id || null,
  personname: data.personname || null,
  follow_up_time: data.follow_up_time || '',
  nextfollow_up_by: data.nextfollow_up_by || '',
  stage: data.stage || '',
  reminder_status: data.reminder_status || '',
  remark: data.remark || ''
  });
  } else {
  console.error('No data found for the provided ID');
  }
  },
 (error) => {
    console.error('Error fetching data:', error);
  });
}
   
update() {
  console.log('Update function called!');
    for (const controlName in this.updatefolowupForm.controls) {
      if (this.updatefolowupForm.controls.hasOwnProperty(controlName)) {
        const control = this.updatefolowupForm.get(controlName);
        if (control) {
          console.log(`Control '${controlName}' validity: ${control.valid}`);
        } else {
          console.error(`Control '${controlName}' not found or null.`);
        }
      }
    }
    if (this.updatefolowupForm.valid) {
    console.log('Form is valid. Form values:', this.updatefolowupForm.value);
    const formData = this.updatefolowupForm.value;
    this.Service.followupupdate(formData, this.status_id)
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
    } else {
      console.error('Form is not valid. Form errors:', this.updatefolowupForm.errors);
      alert('Form is not valid. Cannot update data.');
    }
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

showAccessDenied() {
  this.accessDenied = true;
  setTimeout(() => this.accessDenied = false, 3000); 
}

private getUserRightFromLocalStorage(): string {
  return localStorage.getItem('user_right') || 'default';
}
}
