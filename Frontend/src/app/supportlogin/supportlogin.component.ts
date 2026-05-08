import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiserviceService } from '../apiservice.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

export interface LoginResponse {
  message: string;
  userData: {
  support_id: string;
    company_data: {
    company_code: string;
    username: string;
  };
};
}

@Component({
  selector: 'app-supportlogin',
  templateUrl: './supportlogin.component.html',
  styleUrl: './supportlogin.component.css'
})

export class SupportloginComponent {
loginForm: FormGroup;
showPassword: boolean = false;
userData: any;

constructor(private Service:ApiserviceService, private router: Router, private route: ActivatedRoute, private snackBar: MatSnackBar, private http: HttpClient){}

ngOnInit(): void {
  this.loginForm = new FormGroup({
    contactno: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });
}

togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
}

login() {
  if (this.loginForm.valid) {
    console.log(this.loginForm.value);
    const contactno = this.loginForm.value.contactno;
    const password = this.loginForm.value.password;

    this.Service.supportlogin(contactno, password).subscribe(
      (res: any) => {
        console.log(res);
        this.loginForm.reset();

        if (res.message === 'Login successful') {
          const support_id = res.userData.support_id;
          const username = res.userData.username;
          const company_code = res.userData.company_data.company_code;

          this.router.navigate(['/supportdashbord', support_id], {
            queryParams: { fromLogin: 'true', username, company_code }
          });
        } else {
          alert(res.message || 'An error occurred. Please try again later.');
        }
      },
      (err) => {
        console.log('Error:', err);

        if (err.status === 401) {
          alert('Invalid username or password');
        }
      }
    );
  }
}

}


