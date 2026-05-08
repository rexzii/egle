import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ChangeDetectorRef  } from '@angular/core';

@Component({
  selector: 'app-supportdashbord',
  templateUrl: './supportdashbord.component.html',
  styleUrl: './supportdashbord.component.css'
})

export class SupportdashbordComponent {
ticketForm: FormGroup;
userData: any;
support_id: any;
username: any;
company_code: any;
ticket_id : any;
leadData: any[] = [];
productData: any;
products: any[] = []; 

constructor(private route: ActivatedRoute, private Service:ApiserviceService, private router: Router, private changeDetectorRef: ChangeDetectorRef) {}

ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.support_id = params['support_id'];
    console.log('support_id from path:', this.support_id);
  });

  this.route.queryParams.subscribe(queryParams => {
    this.username = queryParams['username'];
    this.company_code = queryParams['company_code'];
    console.log('Query Params:', queryParams);
    console.log('Company Code:', this.company_code);
  });

  this.ticketForm = new FormGroup({
    products: new FormControl('', Validators.required),
    Description: new FormControl('', Validators.required),
    company_name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/),]),
    mobileno: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/),]),
    image: new FormControl(null), 
    remark: new FormControl(null),
  });

  this.getallticketdetails();
  this.getProducts(this.company_code); 
}

onMobileInput(event: any) {
  const input = event.target;
  if (input.value.length > 10) {
    input.value = input.value.slice(0, 10);
  }
}

getProducts(companyCode: string): void {
  this.Service.getProducts(companyCode).subscribe(
    (data: any) => {
      this.productData = data; 
      console.log('Lead Data:', this.productData);
    },
    (error) => {
      console.error('Error fetching lead data:', error);
    }
  );
}

onFileSelected(event: any) {
  const file = event.target.files[0];
    if (file) {
      this.ticketForm.patchValue({
      image: file,
    });
  }
}
  
navigateToViewticket(ticket_id : string): void {
  this.router.navigate(['/view-ticket', ticket_id], {
    });
}

formatTime(time: string): string {
  const date = new Date('1970-01-01T' + time + 'Z');
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const isAM = hours < 12;
  hours = hours % 12;
  if (hours === 0) {
    hours = 12; 
  }
  const period = isAM ? 'AM' : 'PM'; 
  return `${hours}:${minutes} ${period}`;
}

submit() {
  if (this.ticketForm.valid) {
    const formData = new FormData();
    const fileInput = this.ticketForm.get('image')?.value;
    console.log('Selected file:', fileInput);
    if (fileInput && fileInput instanceof File) {
        formData.append('image', fileInput, fileInput.name);
    } else {
        console.log('No file selected');
    }
    formData.append('username', this.username);
    formData.append('company_code', this.company_code);
    formData.append('created_by', this.username);
    formData.append('products', this.ticketForm.get('products')?.value);
    formData.append('Description', this.ticketForm.get('Description')?.value);
    formData.append('company_name', this.ticketForm.get('company_name')?.value);
    formData.append('email', this.ticketForm.get('email')?.value);
    formData.append('mobileno', this.ticketForm.get('mobileno')?.value);
    formData.append('remark', this.ticketForm.get('remark')?.value);
    console.log('Form data:', formData);
    this.Service.saveTicket(formData).subscribe(
      (res) => {
        console.log(res);
        if (res.success) {
          const ticketId = res.ticket_id;
          this.getallticketdetails();
          alert(`Issue raised successfully. Your Ticket ID is: ${ticketId}`);
          this.filterByCompanyCode();
        }
        this.ticketForm.reset();
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

filterByCompanyCode(){
  this.leadData = this.leadData.filter(lead => lead.company_code === this.company_code);
}

nevigateenduser(){
  this.router.navigate(['/support_endcustomer', this.company_code])
}

getallticketdetails() {
  this.Service.getAllticketdetails().subscribe(
    (response: any) => {
      if (response && response.data && Array.isArray(response.data)) {
        this.leadData = response.data.map((lead: any, index: number) => ({
        ...lead,
      serialNumber: index + 1,
      active: lead.active === 'yes' ? true : false
      }));
     
      this.filterByCompanyCode();
      console.log('Lead Data:', this.leadData);
      } else {
      console.error('Invalid response format:', response);
    }
  },
  (error) => {
    console.error('Error fetching lead data:', error);
  });
}
  
}