import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd  } from '@angular/router';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
showPopup = false;
selectedPackageName: string = ''; 

@ViewChild(ModalComponent) modalComponent: ModalComponent;  

constructor(private http: HttpClient, private router: Router) {
    this.modalComponent = new ModalComponent();
}

// Function to open the popup modal
openPopup(packageName: string) {
    this.selectedPackageName = packageName; // Set the selected package name
    this.showPopup = true; // Show the popup
  }

  // Function to close the popup modal
  closePopup() {
    this.showPopup = false;
  }


openModal(): void {
    if (this.modalComponent) {
      this.modalComponent.openModal(); 
    }
}

// Handle the company code submission and redirect
handleCompanyCode(companyCode: string): void {
    if (companyCode) {
      window.location.href = `/support_endcustomer/${companyCode}`;  // Redirect with the company code
    }
}  
  
onSubmit(form: NgForm) {
    if (form.invalid) {
        console.error('Form is invalid');
        return;
    }

    const formData = {
        name: form.value.name,
        phone: form.value.phone,
        email: form.value.email,
        selectedPackageName: this.selectedPackageName // Include selected package name
    };

    console.log('Form Data:', formData); 

    this.http.post('https://prathhamcrm.com/nodeapp/send-emailbycontact', formData)
        .subscribe(
            response => {
                console.log('Error sending email', response);
                alert('Email not sent');
            },
            error => {
                console.error('Email sent successfully!', error);
                alert('Email sent successfully!');
            }
        );

    form.reset();
}


login(){
    this.router.navigate(['/login']);  
}

}
