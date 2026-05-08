import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import {NgxCroppedEvent, NgxPhotoEditorService} from "ngx-photo-editor";

@Component({
  selector: 'app-company-register',
  templateUrl: './company-register.component.html',
  styleUrl: './company-register.component.css'
})

export class CompanyRegisterComponent {
companyForm: FormGroup;
imgChangeEvt: any = '';
cropImgPreview: any = '';
isFormEmpty: any;
output?: NgxCroppedEvent;
accessDenied: boolean = false;
user_right: any;

constructor(private Service:ApiserviceService,private router: Router, private route: ActivatedRoute,private photoEditorService: NgxPhotoEditorService){
  this.user_right = this.getUserRightFromLocalStorage();
}

ngOnInit() {
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

onSubmit() {
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

showAccessDenied() {
  this.accessDenied = true;
  setTimeout(() => this.accessDenied = false, 3000); 
}

private getUserRightFromLocalStorage(): string {
  return localStorage.getItem('user_right') || 'default';
}

}

