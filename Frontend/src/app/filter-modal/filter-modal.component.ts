import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrl: './filter-modal.component.css'
})

export class FilterModalComponent {
leadData: any;
filteredLeadData: any[] = []; 
selectedFilter: string = 'all';  
datePipe: any;
fetchedData: any;
user_id: any;
username: any;
company_code: any;
company_name: any;
renewalData: any;
filteredRenewalData: any[] = []; 
selectedRenewalFilter: string = 'all';  
user_right: any;

constructor(
  private Service:ApiserviceService,private router: Router, private route: ActivatedRoute, public dialogRef: MatDialogRef<FilterModalComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any) {}

ngOnInit() {
  this.route.params.subscribe(params => {
    this.user_id = params['user_id']; 
  });
  this.route.queryParams.subscribe(queryParams => {
  this.username = queryParams['username']; 
  this.company_code = queryParams['company_code'];
  this.company_name = queryParams['company_name'];
  this.user_right = queryParams['user_right'];
  });
  this.getLeadDatabydate(this.company_code);
  this.getRenewalData(this.company_code);
}

getLeadDatabydate(companyCode: string) {
  this.Service.getLeadDatabydate(companyCode).subscribe(
    (data: any) => {
      this.leadData = data.map((lead: any, index: number) => ({
        ...lead,
        serialNumber: index + 1,
        nextfollow_up_by: lead.next_month_follow_up, 
        previousMonthFollowUp: lead.previous_month_follow_up,
        afterNextMonthFollowUp: lead.after_next_month_follow_up
      }));
      console.log('Lead Data:', this.leadData);  
    },
    (error) => {
      console.error('Error fetching lead data:', error);
    }
  );
}

filterData() {
  const currentDate = new Date();
  console.log('Current Date:', currentDate);
  switch (this.selectedFilter) {
    case 'today':
      this.filteredLeadData = this.leadData.filter((lead: { nextfollow_up_by: any; }) => {
        const leadDate = new Date(lead.nextfollow_up_by);
        console.log('Lead Date (today):', leadDate);
        return leadDate.getFullYear() === currentDate.getFullYear() &&
               leadDate.getMonth() === currentDate.getMonth() &&
               leadDate.getDate() === currentDate.getDate();
      });
      break;
      case 'thisMonth':
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        console.log('First Day of Month:', firstDayOfMonth);
        console.log('Last Day of Month:', lastDayOfMonth);
        this.filteredLeadData = this.leadData.filter((lead: { nextfollow_up_by: string | number | Date; }) => {
        const leadDate = new Date(lead.nextfollow_up_by);
        console.log('Lead Date (thisMonth):', leadDate);
        return leadDate >= firstDayOfMonth && leadDate <= lastDayOfMonth; 
        });
        break;  
    case 'all':
      this.filteredLeadData = this.leadData;
      break;
    default:
      this.filteredLeadData = this.leadData;
  }
}

getRenewalData(companyCode: string) {
  this.Service.getRenewalDataFromTable(companyCode).subscribe(
    (data: any) => {
      this.renewalData = data.map((renewal: any, index: number) => ({ ...renewal, serialNumber: index + 1,
        nextfollow_up_by: renewal.next_month_follow_up, 
        previousMonthFollowUp: renewal.previous_month_follow_up,
        afterNextMonthFollowUp: renewal.after_next_month_follow_up
    })); 
      console.log('Renewal Data:', this.renewalData);
    },
    (error) => {
      console.error('Error fetching renewal data:', error);
    }
  );
}

filterRenewalData() {
  const currentDate = new Date();
  switch (this.selectedRenewalFilter) {
    case 'today':
      this.filteredRenewalData = this.renewalData.filter((renewal: { nextfollow_up_by: any; stage: string; }) => {
        const renewalDate = new Date(renewal.nextfollow_up_by);
        return renewalDate.getFullYear() === currentDate.getFullYear() &&
               renewalDate.getMonth() === currentDate.getMonth() &&
               renewalDate.getDate() === currentDate.getDate() &&
               renewal.stage === 'Renewal Follow Up';
      });
      break;
      case 'thisMonth':
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
        this.filteredRenewalData = this.renewalData.filter((renewal: { nextfollow_up_by: any; stage: string; }) => {
          const renewalDate = new Date(renewal.nextfollow_up_by);
          return (
            renewalDate >= firstDayOfMonth &&
            renewalDate <= lastDayOfMonth &&
            renewal.stage === 'Renewal Follow Up'
          );
        });
        break;
    case 'all':
      this.filteredRenewalData = this.renewalData.filter((renewal: { stage: string; }) => renewal.stage === 'Renewal Follow Up');
      break;
    default:
      this.filteredRenewalData = this.renewalData.filter((renewal: { stage: string; }) => renewal.stage === 'Renewal Follow Up');
  }
}

onChang(event: any) {
  this.selectedFilter = event.target.value;
  this.filterData();
}

onRenewalChange(event: any) {
  this.selectedRenewalFilter = event.target.value;
  this.filterRenewalData();
}

onClose(): void {
  this.dialogRef.close();
}

closeDialog(): void {
  this.dialogRef.close();
}
}








 
