import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface UserResponse {
  password: string; 
}

@Component({
  selector: 'app-password-modal',
  templateUrl: './password-modal.component.html',
  styleUrls: ['./password-modal.component.css']
})

export class PasswordModalComponent {
@Input() user_id: string;  
@Input() showModal: boolean = true; 
@Output() closeModal = new EventEmitter<void>();  
newPassword: string = '';
currentPassword: string = '';

constructor(private http: HttpClient) { }

ngOnInit() {
  if (this.user_id) {
    this.fetchCurrentPassword(this.user_id); 
  }
}

fetchCurrentPassword(user_id: string) {
  this.http.get<UserResponse>(`https://prathhamcrm.com/nodeapp/useredit/${user_id}`).subscribe(
    (response) => {
      if (response && response.password) {
        this.currentPassword = response.password;
      }
    },
    (error) => {
      console.error('Error fetching current password', error);
    }
  );
}

onSubmit() {
  if (this.newPassword) {
    this.http.put(`https://prathhamcrm.com/nodeapp/update-password/${this.user_id}`, { newPassword: this.newPassword })
    .subscribe(
    (response) => {
      console.log('Password updated successfully', response);
      this.closeModal.emit();  
    },
    (error) => {
      console.error('Error updating password', error);
    });
  }else {
    console.log('Password is required');
  }
}

onClose() {
  this.closeModal.emit(); 
  }
}
