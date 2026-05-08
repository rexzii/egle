import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
@ViewChild('notificationDetails') notificationDetailsRef!: ElementRef;
loginForm: FormGroup;
user_id: string;
company_name: string;
showPassword: boolean = false;
notifications: any;
selectedNotification: any;
showPopup: boolean;
leadData: any;
username: string = '';
password: string = '';
  
constructor(private Service:ApiserviceService,private router: Router, private route: ActivatedRoute){}

ngOnInit() {
  this.route.params.subscribe(params => {
    this.user_id = params['user_id'];
  });

  this.loginForm = new FormGroup({
    username:new FormControl('',Validators.required),
    password:new FormControl('',Validators.required) ,
    rememberMe: new FormControl(false)  

  });

   // If "Remember Me" was previously checked, pre-fill the username and password
   const storedUsername = localStorage.getItem('username');
   const storedPassword = localStorage.getItem('password');
   if (storedUsername && storedPassword) {
     this.loginForm.patchValue({
       username: storedUsername,
       password: storedPassword,
       rememberMe: true
     });
   }

   console.log("Token on Dashboard:", localStorage.getItem('token')); 
   console.log("User Data on Dashboard:", localStorage.getItem('userData')); 
}

togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}

Submit() {
  if (this.loginForm.invalid) {
    alert('Please enter username and password');
    return;
  }
  console.log("🚀 Sending login request:", this.loginForm.value);
  const { username, password, rememberMe } = this.loginForm.value;
  // ✅ Remember Me Functionality
  if (rememberMe) {
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
  } else {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
  }
  this.Service.loginData(this.loginForm.value).subscribe(
    (res: any) => {
      console.log('✅ Login Response:', res);
      if (res.message === 'Login successful' && res.token) {  
        console.log("🔹 Saving Token:", res.token);
        this.Service.saveLoginData(res.token, res.userData);
        const { user_id, username, user_right, company_data } = res.userData;
        const { company_code, company_name, expire_date } = company_data;
        // ✅ Save important user info in localStorage
        localStorage.setItem('expire_date', expire_date);
        setTimeout(() => {
          console.log("🔹 Token After Save:", localStorage.getItem('token'));
          console.log("🔹 User Data After Save:", localStorage.getItem('userData'));
         
          if (this.Service.isLoggedIn()) {
            this.router.navigate(['/dashboard', user_id], {
              queryParams: { fromLogin: 'true', username, company_code, company_name, user_right }
            }).then(() => {
              console.log("✅ Navigation successful!");
            }).catch(err => {
              console.error("⛔ Navigation failed:", err);
            });

            // ✅ Fetch Lead Data
            this.getLeadData(company_code, user_right, user_right === 'Data_Entry' ? username : undefined);

            // ✅ Show Notification
            this.showNotificationPopup();
          } else {
            console.error("⛔ Token save nahi hua!");
          }
        }, 1000);
      } else {
        alert(res.message || 'Invalid credentials');
      }
    },
    (err) => {
      console.log('⛔ Login Error:', err);

      if (err.status === 401) {
        alert('Invalid username or password');
      } else if (err.status === 403) {
        switch (err.error.message) {
          case 'Your server has expired, please renew':
            alert('Your server has expired, please renew');
            break;
          case 'Your company is not active':
            alert('Your company is not active');
            break;
          case 'User is not active':
            alert('User is not active');
            break;
          default:
            alert('An error occurred. Please try again later.');
        }
      } else {
        alert('An error occurred. Please try again later.');
      }
    }
  );
}

// Submit() {
//   if (this.loginForm.invalid) {
//     alert('Please enter username and password');
//     return;
//   }

//   const data = this.loginForm.value;
//   console.log("🚀 Sending login request:", data);

//   this.Service.loginData(data).subscribe(
//     (res: any) => {
//       console.log('✅ Login Response:', res);
  
//       if (res.token) {  // ✅ Ensure token exists
//         console.log("🔹 Saving Token:", res.token);
//         this.Service.saveLoginData(res.token, res.userData);
        
//         // **Confirm karein ki LocalStorage me Token Save Ho Raha Hai**
//         setTimeout(() => {
//           console.log("🔹 Token After Save:", localStorage.getItem('token'));
//           console.log("🔹 User Data After Save:", localStorage.getItem('userData'));
  
//           if (this.Service.isLoggedIn()) {
//             this.router.navigate(['/dashboard']).then(() => {
//               console.log("✅ Navigation successful!");
//             }).catch(err => {
//               console.error("⛔ Navigation failed:", err);
//             });
//           } else {
//             console.error("⛔ Token save nahi hua!");
//           }
  
//         }, 1000);
//       } else {
//         console.error("⛔ Token missing in response!", res);
//         alert('Invalid credentials');
//       }
//     },
//     (error) => {
//       console.error('⛔ Login Error:', error);
//       alert('Login failed: ' + (error.error?.message || 'Unknown error'));
//     }
//   );
  
  
// }



getLeadData(companyCode: string, user_right: string, username?: string) {
  this.Service.getLeadData(companyCode, user_right, username).subscribe(
    (data: any) => {
      console.log('Received Lead Data:', JSON.stringify(data)); 
      if (data && data.data) {
        this.leadData = data.data.map((lead: any, index: number) => ({
          ...lead,
          serialNumber: index + 1,
          nextfollow_up_by: lead.next_month_follow_up, 
          previousMonthFollowUp: lead.previous_month_follow_up,
          afterNextMonthFollowUp: lead.after_next_month_follow_up || null 
        }));
        console.log('Processed Lead Data:', this.leadData);
      } else {
        console.error('No data received or data structure is incorrect', data);
      }
    },
    (error: any) => {
      console.error('Error fetching lead data:', error);
    }
  );  
}

showNotificationPopup() {
  this.showPopup = true;
}

}