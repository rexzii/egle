import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { FilterModalComponent } from '../filter-modal/filter-modal.component';

@Component({
  selector: 'app-renewals',
  templateUrl: './renewals.component.html',
  styleUrl: './renewals.component.css'
})

export class RenewalsComponent {
leadData: any;
filteredLeadData: any[] = []; 
selectedFilter: string = 'all';  
renewalsFilter: string = 'today'; 
user_id: any;
username: any;
company_code: any;
company_name: any;
user_right: any;

constructor(
private Service: ApiserviceService, private router: Router, private route: ActivatedRoute,
public dialogRef: MatDialogRef<FilterModalComponent>,
@Inject(MAT_DIALOG_DATA) public data: any
) {}

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
}

onChange(event: any) {}

onClose(): void {
  this.dialogRef.close();
}

onChang(event: any) {
  this.selectedFilter = event.target.value;
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

closeDialog(): void {
  this.dialogRef.close();
}

hasNoRenewals(): boolean {
  return !(this.leadData && this.leadData.some((lead: { stage: string; }) => lead.stage === 'Order Closed'));
}
}
    




