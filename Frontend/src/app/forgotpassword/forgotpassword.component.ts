import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';  
import { ApiserviceService } from '../apiservice.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css'
})

export class ForgotpasswordComponent {
  forgotpasswordForm: FormGroup; 
  constructor(private Service: ApiserviceService, private formBuilder: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit() { 
    this.forgotpasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  sendEmail() {
    if (this.forgotpasswordForm.get('email')?.hasError('email')) {
      alert('Please enter a valid email address.');
      return;
    }
    if (this.forgotpasswordForm.valid) {
      this.Service.sendEmail(this.forgotpasswordForm.value.email)
        .subscribe(
          (response: any) => {
            console.log('Email sent successfully!', response);
            alert(response.message); 
            this.forgotpasswordForm.reset();
          },
          (error: any) => {
            console.error('Error sending email:', error);
            alert('Your Email ID is not registered. Kindly get in touch with Administrator.');
          }
        );
    } else {
      alert('All fields are required. Please fill in all required fields.');
    }
  }
   
}  