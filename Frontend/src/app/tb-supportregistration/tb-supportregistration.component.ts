import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiserviceService } from '../apiservice.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tb-supportregistration',
  templateUrl: './tb-supportregistration.component.html',
  styleUrl: './tb-supportregistration.component.css'
})

export class TbSupportregistrationComponent {
  supportForm: FormGroup;
  showPassword: boolean = false;
  showPassword1: boolean = false;

constructor(private Service:ApiserviceService,private router: Router, private route: ActivatedRoute, private snackBar: MatSnackBar, private http: HttpClient){}

ngOnInit(): void {
  this.supportForm = new FormGroup({
    contactno: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    crmpassword: new FormControl('', Validators.required)
  });
}

togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
}

togglePasswordVisibility1() {
  this.showPassword1 = !this.showPassword1;
}

onSubmit() {
  if (this.supportForm.invalid) {
    return;
  }
  const formData = this.supportForm.value;
  this.Service.checkContactNumberExists(formData.contactno).subscribe(
    (response: { exists: any; username: any; company_code: any; }) => {
      if (response.exists) {
        const registrationData = {
          ...formData,
          username: response.username,
          company_code: response.company_code
        };
        this.saveSupportRegistration(registrationData);
      } else {
        alert("This contact number is not registered in lead table\n Please Use Rerister number")
      }
    },
    (error: any) => {
      console.error('Error checking contact number:', error);
      alert("An error occurred while verifying the contact number.")
    }
  );
}

// Save form data to tb_supportregistration
saveSupportRegistration(data: any) {
  this.http.post('https://prathhamcrm.com/nodeapp/save-support-registration', data).subscribe(
    (response) => {
      console.log('Error saving support registration:', response);
      alert("Error saving support registration:")
    },
    (error) => {
      console.error('Support registration saved successfully:', error);
      alert("Support registration saved successfully:")
      this.supportForm.reset({});
    }
  );
}
}
