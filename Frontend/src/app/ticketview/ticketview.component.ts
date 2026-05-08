import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ticketview',
  templateUrl: './ticketview.component.html',
  styleUrl: './ticketview.component.css'
})

export class TicketviewComponent {
updatecustomerForm: FormGroup;
ticket_id : string;
ticketData: any;
companyLogoUrl: string | null = null; 
logoFileName: string | null = null;   
selectedLogo: File | null = null;
leadData: any[] = [];

constructor(private route: ActivatedRoute, private Service:ApiserviceService, private http: HttpClient) {}

ngOnInit(): void {
 this.route.params.subscribe(params => {
 this.ticket_id  = params['ticket_id'];
 console.log('Ticket ID:', this.ticket_id );
 });

  this.updatecustomerForm = new FormGroup({
    products: new FormControl('', Validators.required),
    Description: new FormControl('', Validators.required),
    created_date: new FormControl('', Validators.required),
    issuesolved_by: new FormControl('', Validators.required),
    issue_solved: new FormControl('', Validators.required),
    discussed_by: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/),]),
    mobileno: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/),]),
    image: new FormControl(''),
  });

  this.fetchCompanyData(this.ticket_id); 
  this.getallticketissue();
}

onMobileInput(event: any) {
  const input = event.target;
  if (input.value.length > 10) {
    input.value = input.value.slice(0, 10);
  }
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

fetchCompanyData(ticket_id : string): void {
  this.Service.getTicketById(ticket_id).subscribe(
    (res: any) => {
      console.log('Complete response:', res);
      if (res && res.data) { 
        const data = res.data;
        console.log('Data:', data);
        const formattedDate = this.formatDateToDDMMYYYY(data.created_date);
        this.updatecustomerForm.patchValue({
          created_date: formattedDate,
          mobileno: data.mobileno || '',
          email: data.email || '',
          Description: data.Description || '',
          created_by: data.created_by || '',
          products: data.products || ''
        });
          this.companyLogoUrl = data.image;
          if (data.image) {
            const logoFileName = data.image.split('/').pop();
          this.logoFileName = logoFileName;
            const logoPath = `https://prathhamcrm.com/Lead-Mnagement/uploads/${data.image}`;
            console.log('Current Company Logo Path:', logoPath);
            this.companyLogoUrl = logoPath;
          }
        } else {
          console.error('No data found or invalid response format');
        }
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }

formatDateToDDMMYYYY(date: string): string {
  if (!date) return '';
  const parsedDate = new Date(date);
  const day = parsedDate.getDate().toString().padStart(2, '0'); 
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0'); 
  const year = parsedDate.getFullYear();
  return `${day}-${month}-${year}`;
}

onFileSelect(event: any): void {
  const file = event.target.files[0];
    if (file) {
      this.selectedLogo = file;
      this.logoFileName = file.name; 
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.companyLogoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedLogo = null;
      this.logoFileName = null;
      this.companyLogoUrl = null;
  }
}

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.updatecustomerForm.patchValue({
      image: file,
    });
  }
}

submit(): void {
  const formData = {
  ticket_id: this.ticket_id, 
  Description: this.updatecustomerForm.value.Description,
  issue_solved: this.updatecustomerForm.value.issue_solved,
  email: this.updatecustomerForm.value.email 
};
this.http.post(`https://prathhamcrm.com/nodeapp/insert-ticketissue`, formData)
  .subscribe(response => {
  console.log('Ticket Issue inserted successfully:', response);
  alert('Ticket inserted!');
  this.getallticketissue();
  }, error => {
  console.error('Error inserting ticket:', error);
  alert('Error inserting ticket');
  });
}

getallticketissue() {
  this.Service.getAllticketissue().subscribe(
    (response: any) => {
      if (response && response.data && Array.isArray(response.data)) {
        this.leadData = response.data.map((lead: any, index: number) => ({
          ...lead,
          serialNumber: index + 1,
          active: lead.active === 'yes' ? true : false
        }));
        console.log('Lead Data:', this.leadData);
      } else {
        console.error('Invalid response format:', response);
      }
    },
    (error) => {
      console.error('Error fetching lead data:', error);
    }
  );
}

}
