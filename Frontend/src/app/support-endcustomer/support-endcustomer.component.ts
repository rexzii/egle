import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';

@Component({
  selector: 'app-support-endcustomer',
  templateUrl: './support-endcustomer.component.html',
  styleUrl: './support-endcustomer.component.css'
})

export class SupportEndcustomerComponent {
customerForm: FormGroup;
leadData: any[] = [];
productData: any;
products: any[] = []; 
username: any;
company_code: any;

constructor(private route: ActivatedRoute, private Service:ApiserviceService, private router: Router) {}

ngOnInit(): void {
   this.route.params.subscribe(params => {
    this.company_code = params['company_code'];
    console.log('support_id from path:', this.company_code);
  });

  if (this.company_code) {
    this.getProducts(this.company_code);
  }

  this.customerForm = new FormGroup({
    company_name: new FormControl('', Validators.required),
    created_by: new FormControl('', Validators.required),
    Description: new FormControl('', Validators.required),
    products: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/),]),
    mobileno: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/),]),
    image: new FormControl(null), 
    remark: new FormControl(null),
  });

}

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.customerForm.patchValue({
      image: file,
    });
  }
}

getProducts(companyCode: string): void {
  this.Service.getProducts(companyCode).subscribe(
    (data: any) => {
      this.productData = data; 
      console.log('Fetched Products:', this.productData);
    },
    (error) => {
      console.error('Error fetching products:', error);
    }
  );
}

submit() {
  if (this.customerForm.valid) {
    const formData = new FormData();
    const fileInput = this.customerForm.get('image')?.value;
    console.log('Selected file:', fileInput);
    if (fileInput && fileInput instanceof File) {
        formData.append('image', fileInput, fileInput.name);
    } else {
        console.log('No file selected');
    }
    formData.append('company_code', this.company_code);
    formData.append('created_by', this.customerForm.get('created_by')?.value);
    formData.append('products', this.customerForm.get('products')?.value);
    formData.append('Description', this.customerForm.get('Description')?.value);
    formData.append('company_name', this.customerForm.get('company_name')?.value);
    formData.append('email', this.customerForm.get('email')?.value);
    formData.append('mobileno', this.customerForm.get('mobileno')?.value);
    formData.append('remark', this.customerForm.get('remark')?.value);
    console.log('Form data:', formData);
    this.Service.saveTicket(formData).subscribe(
      (res) => {
        console.log(res);
        if (res.success) {
          const ticketId = res.ticket_id;
          alert(`Issue raised successfully. Your Ticket ID is: ${ticketId}`);
        }
        this.customerForm.reset();
      },
      (error) => {
        console.error(error);
        alert('Error submitting the form');
      }
    );
  } else {
    alert('Please fill in all required fields.');
  }
}

onMobileInput(event: any) {
  const input = event.target;
  if (input.value.length > 10) {
    input.value = input.value.slice(0, 10);
  }
}

}
