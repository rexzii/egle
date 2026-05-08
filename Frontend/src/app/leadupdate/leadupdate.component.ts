import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ParamMap, Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-leadupdate',
  templateUrl: './leadupdate.component.html',
  styleUrls: ['./leadupdate.component.css']
})

export class LeadupdateComponent {
updateForm: FormGroup;
lead_id: number;
personname: string;
user_id: any;
username: any;
email: any;
followData: any;
company_name: any;
company_code: any;
stageData: any;
user_right: any;

constructor(private Service: ApiserviceService, private router: Router, private route: ActivatedRoute) {}

ngOnInit() {
  this.route.queryParams.subscribe(params => {
  this.lead_id = params['lead_id'];
  this.personname = params['personname'];
  this.email = params['email'];
  this.route.queryParams.subscribe(queryParams => {
  this.username = queryParams['username'];
  this.user_id = queryParams['user_id'];
  this.company_code = queryParams['company_code'],
  this.company_name = queryParams['company_name'],
  this.user_right = queryParams['user_right'];
  this.fetchfollowup(this.lead_id); 
  });

  this.updateForm = new FormGroup({
    company_code: new FormControl(this.company_code, Validators.required),
    lead_id: new FormControl(this.lead_id), 
    username: new FormControl(this.username, Validators.required),
    personname: new FormControl(this.personname), 
    email: new FormControl(this.email), 
    follow_up_time: new FormControl(this.getCurrentTime()),
    nextfollow_up_by: new FormControl(this.getTodayDate()),
    stage: new FormControl('', [Validators.required]),
    reminder_status: new FormControl('', [Validators.required]),
    remark: new FormControl('', [Validators.required]),
    OtherReason: new FormControl(null)
    });
  });
  this.getstage(this.company_code);
}

getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

onSubmit() {
  if (this.updateForm.valid) {
  this.Service.addleadupdate(this.updateForm.value).subscribe(
  (res) => {
  console.log(res);
  alert('Followup Inserted Successfully');
  this.updateForm.reset({});
  if (this.user_id) {
  const queryParams = {
  username: this.username,
  company_code: this.company_code,
  company_name: this.company_name,
  user_right: this.user_right,
  };
  this.router.navigate(['/dashboard', this.user_id], { queryParams });
  }
  },
  (error) => {
  console.error(error);
  alert('Error submitting the form');
  });
  }
else {
  alert('Please Fill in all the required * fields.');
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

fetchfollowup(lead_id: any) {
  console.log('Fetching data for Lead ID:', lead_id);
  this.Service.fetchfollowuphistry(lead_id).subscribe(
  (response: any) => {
  console.log('Response:', response);
  if (response && Array.isArray(response)) {
    this.followData = response.filter((item: null) => item !== null);
    console.log("Filtered followData:", this.followData);
    } else {
    console.log("Invalid or empty response data.");
    this.followData = [];
    }
    console.log("followData:", this.followData);
    console.log("followData length:", this.followData.length);
    },
    (error: any) => {
    console.error('Error:', error);
    this.followData = [];
    }
  );
}  
}
