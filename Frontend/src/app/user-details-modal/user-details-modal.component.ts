import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiserviceService } from '../apiservice.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
selector: 'app-user-details-modal',
templateUrl: './user-details-modal.component.html',
styleUrl: './user-details-modal.component.css'
})

export class UserDetailsModalComponent {
@Input() companyUsers: any;
@Output() closePopup = new EventEmitter<void>();
showPopup: boolean;
username: any;
user_id: any;
company_code: any;
company_name: any;
user_right: any;
userLogs: any[];
showLogs: boolean;
 
constructor(private Service: ApiserviceService, private router: Router, private route: ActivatedRoute, public dialog: MatDialog) { }

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
}

closeModal() {
  this.showPopup = false; 
}

showCompanyUsers(companyCode: string) {
  this.Service.getUsersByCompanyCode(companyCode).subscribe(
  (users: any[]) => {
  console.log('Users for company', companyCode, ':', users);
  this.companyUsers = users;
  this.showPopup = true; 
  },
  (error) => {
  console.error('Error fetching users:', error);
  }
);
}

togglePopup() {
  this.showPopup = !this.showPopup;
  }

navigateToEditPage(user_id:any){
  this.router.navigate(['/useredit', user_id], {
    queryParams: { 
      username: this.username,
      user_id: this.user_id,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right  
    }
  }); 
}

deleteItem(user_id: number) {
  this.Service.userdelete(user_id.toString()).subscribe(
    () => {
      console.log('Item deleted successfully');
     alert('Item deleted successfully');
     window.location.reload(); 
    },
    (error) => {
      console.error('Error deleting item:', error);
     alert('Error deleting item');
    }
  );
}

openDeleteConfirmation(statusId: number): void {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.panelClass = 'custom-dialog-container'; 
  dialogConfig.data = 'Are you sure you want to delete?';
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
  dialogRef.afterClosed().subscribe((result: boolean) => {
    if (result === true) {
      this.deleteItem(statusId);
    } else {
    }
  });
}

viewUserLog(user_id: string): void {
  this.Service.getUserLogs(user_id).subscribe((logs: any[]) => {
    this.userLogs = logs;
    this.showLogs = true;
  });
}

closeLogs() {
  this.showLogs = false;
}

}
