import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { FilterModalComponent } from '../filter-modal/filter-modal.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgZone } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-lead-statistics',
  templateUrl: './lead-statistics.component.html',
  styleUrl: './lead-statistics.component.css'
})

export class LeadStatisticsComponent {
user_id : any;
username: any;
selectedSortOption: string;
stagesCount: any[];
selectedStageDetails: any[];
company_code: any;
company_name: any;
path: string;
leadData: any;
currentPage = 1;
itemsPerPage = 10; 
searchKeyword: string = ''; 
isLeadOptionsVisible: boolean = false;
leads: any[] = [];
user_right: any;
accessDenied: boolean = false;
isModalOpen = false;
expireDate: string | null = '';
showModal: boolean = false;
showPassword: boolean = false;
  modalData: any = {
    user_id: '',
    username: '',
    password: ''
  };

constructor(private zone: NgZone, private Service:ApiserviceService,private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private http: HttpClient  ){
  this.user_right = this.getUserRightFromLocalStorage();
}

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

  if (this.company_code) {
    this.fetchImage(this.company_code);
  } else {
    console.error('Company code is not defined.');
  } 
  this.getLeadData(this.company_code);
  this.expireDate = localStorage.getItem('expire_date');
  }
  
getLeadData(companyCode: string) {
  this.Service.getLeadDatabystatistics(companyCode).subscribe(
  (data: any) => {this.leadData = data.map((lead: any, index: number) => ({...lead,
  serialNumber: index + 1,nextfollow_up_by: lead.next_month_follow_up,previousMonthFollowUp: lead.previous_month_follow_up,
  afterNextMonthFollowUp: lead.after_next_month_follow_up}));
  console.log('Lead Data:', this.leadData);
  },(error) => {
  console.error('Error fetching lead data:', error);
  });
}
  
fetchImage(companyCode: string) {
  this.Service.getCompanyLogoUrl(companyCode).subscribe(
  (imageBlob: Blob) => {
  const imageUrl = URL.createObjectURL(imageBlob);
  console.log('Image URL:', imageUrl);
  this.path = imageUrl;
  },
  error => {
    console.error('Error fetching company logo:', error);
  });
}
    
parseTime(timeString: string): string {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
}
    
formatTimeWithAMPM(timeString: string | null): string {
if (!timeString) {
  return ''; 
}

const timeParts = timeString.split(':');
let hours = parseInt(timeParts[0], 10);
const minutes = timeParts[1];
let ampm = 'AM';

  if (hours >= 12) {
    ampm = 'PM';
    if (hours > 12) {
      hours -= 12;
    }
  }
  // Special case: midnight
  if (hours === 0) {
    hours = 12;
  }
  return hours + ':' + minutes + ' ' + ampm;
}

onSortOptionChange(event: any) {
  this.selectedSortOption = event.target.value;
  this.fetchStageCounts(this.company_code);
  this.getLeadData(this.company_code);
}

fetchStageCounts(companyCode: string) {
  let apiUrl: string;
  if (!this.selectedSortOption) {
    return;
  }
  switch (this.selectedSortOption) {
    case 'IN PIPELINE':
      apiUrl = `https://prathhamcrm.com/nodeapp/inpipelinecount?company_code=${companyCode}`;
      break;
    case 'UNDER PROCESS':
      apiUrl = `https://prathhamcrm.com/nodeapp/underprocesscount?company_code=${companyCode}`;
      break;
    case 'RENEWAL':
      apiUrl = `https://prathhamcrm.com/nodeapp/renewalcount?company_code=${companyCode}`;
      break;
    case 'INVALID/CANCAL/GREYLEAD':
      apiUrl = `https://prathhamcrm.com/nodeapp/invalidcount?company_code=${companyCode}`;
      break;
    default:
      return;
  }
  this.http.get<any[]>(apiUrl).subscribe(
      data => {
          this.stagesCount = data;
          this.selectedStageDetails = [];
          if (this.selectedSortOption !== '') {
              this.stagesCount.forEach(stage => {
                  this.showDetails(stage);
              });
          }
      },
      error => {
          console.error('Error fetching stages count:', error);
      }
  );
}

showDetails(stage: any) {
  const apiUrl = 'https://prathhamcrm.com/nodeapp/stageDetails';
  const params = {
    stage: stage.stage,
    company_code: this.company_code 
  };
  this.http.get<any[]>(apiUrl, { params }).subscribe(
    data => {
      console.log('Fetched details:', data);
      this.selectedStageDetails.push(...data);
    },
    error => {
      console.error('Error fetching stage details:', error);
    }
  );
}

onStageClick(stage: any) {
  this.selectedStageDetails = []; 
  this.showDetails(stage); 
}

    navigateToFamilyPage() {
      if (this.user_id !== undefined) {
        const queryParams = {
          username: this.username,
          company_code: this.company_code,
          company_name: this.company_name,
          user_right: this.user_right
        };
        this.router.navigate(['/addLead', this.user_id], { queryParams });
      } else {
        console.error('user_id is undefined. Unable to navigate.');
  
      }
    }
  
    navigateTotrashpage(){
      if (this.user_id !== undefined) {
        const queryParams = {
          username: this.username,
          company_code: this.company_code,
          company_name: this.company_name,
          user_right: this.user_right
        };
        this.router.navigate(['/trash_leads', this.user_id], { queryParams });
      } else {
        console.error('user_id is undefined. Unable to navigate.');
  
      }
    }

    navigateToFaceboookpage(){
      if (this.user_id !== undefined) {
        const queryParams = {
          username: this.username,
          company_code: this.company_code,
          company_name: this.company_name,
        user_right: this.user_right
        };
        this.router.navigate(['/facebookleads', this.user_id], { queryParams });
      } else {
        console.error('user_id is undefined. Unable to navigate.');
      }
    }

    navigatevisistingcardpage(){
      if (this.user_id !== undefined) {
        const queryParams = {
          username: this.username,
          company_code: this.company_code,
          company_name: this.company_name,
          user_right: this.user_right
        };
          this.router.navigate(['/visitingcard-scanner', this.user_id], { queryParams });
      }else {
          console.error('user_id is undefined. Unable to navigate.');
      }
    }
  
    navigateToleadstatastics(){
      if (this.user_id !== undefined) {
        const queryParams = {
          username: this.username,
          company_code: this.company_code,
          company_name: this.company_name,
          user_right: this.user_right
        };
        this.router.navigate(['/lead_statastics', this.user_id], { queryParams });
      } else {
        console.error('user_id is undefined. Unable to navigate.');
  
      }
    }
  
    navigateReportspage(){
      if (this.user_id !== undefined) {
        const queryParams = {
          username: this.username,
          company_code: this.company_code,
          company_name: this.company_name,
          user_right: this.user_right
        };
        this.router.navigate(['/email_reports', this.user_id], { queryParams });
      } else {
        console.error('user_id is undefined. Unable to navigate.');
  
      }
    }

   navigateToUpdateLead(leadId: number, personName: string, email: string) {
      this.router.navigate(['/updatelead'], {
        queryParams: {
          lead_id: leadId,
          personname: personName,
          email: email,
          username: this.username,
          user_id: this.user_id , 
          user_right: this.user_right
          
        }
      });
       
    }
    navigateTouser(){
      if (this.user_id !== undefined) {
        const queryParams = {
          username: this.username,
          company_code: this.company_code,
          company_name: this.company_name,
         user_right: this.user_right
        };
        this.router.navigate(['/register', this.user_id], { queryParams });
      } else {
        console.error('user_id is undefined. Unable to navigate.');
      }
    }
    navigateTomanageuser(){
      if (this.user_id !== undefined) {
        const queryParams = {
          username: this.username,
          company_code: this.company_code,
          company_name: this.company_name,
         user_right: this.user_right
        };
        this.router.navigate(['/manageruser', this.user_id], { queryParams });
      } else {
        console.error('user_id is undefined. Unable to navigate.');
      }
    }
    navigateTomasterentry(){
      if (this.user_id !== undefined) {
        const queryParams = {
          username: this.username,
          company_code: this.company_code,
          company_name: this.company_name,
          user_right: this.user_right
          };
          this.router.navigate(['/masters_entry', this.user_id], { queryParams });
        } else {
        console.error('user_id is undefined. Unable to navigate.');
      }
    }
    navigateToViewLead(lead_id: string): void {
      this.router.navigate(['/view-leaddetails', lead_id], {
        queryParams: { 
          username: this.username,
          user_id: this.user_id,
          user_right: this.user_right
          
        }
      });
    }
   
    logout() {
      this.router.navigate(['/login']); 
    }
  
    dash1() {
      const queryParams = {
        username: this.username, 
        company_code: this.company_code,
        company_name: this.company_name,
        user_right: this.user_right
      };
      this.router.navigate(['/dashboard', this.user_id], { queryParams });
    }
  
    dash2() {
      const queryParams = {
        username: this.username, 
        company_code: this.company_code,
        company_name: this.company_name,
        user_right: this.user_right
      };
      this.router.navigate(['/dashboard', this.user_id], { queryParams });
      
    }
  
    makePhoneCall(mobileno: string) {
      const cleanmobileno = mobileno.replace(/\D/g, '');
      const telUri = `tel:${cleanmobileno}`;
      window.location.href = telUri;
    }
  
    deleteItem(lead_id: number, username: string) {
      this.Service.deletelead(lead_id.toString(), username).subscribe(
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
    
    openDeleteConfirmation(lead_id: number, username: string): void {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.panelClass = 'custom-dialog-container'; 
      dialogConfig.data = 'Are you sure you want to delete?';
    
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.deleteItem(lead_id, username);
        } else {
        }
      });
    }
  
    showAccessDenied() {
      this.accessDenied = true;
      setTimeout(() => this.accessDenied = false, 3000); 
    }
    
    private getUserRightFromLocalStorage(): string {
      return localStorage.getItem('user_right') || 'default';
    }  
    
    openModal() {
      this.isModalOpen = true;
    }

    // Method to open the popup and set user data
openUserPopup(userId: string, userName: string) {
  this.modalData.user_id = userId;
  this.modalData.username = userName;
  this.modalData.password = ''; // You can set a default password here if needed
  this.showModal = true;
}

// Method to close the modal
closeModal() {
  this.showModal = false;
}

 // Method to handle form submission (you can integrate your API call here)
 submitUserForm() {
  console.log('Form submitted:', this.modalData);

  // Call the backend API to update the password
  this.Service.updatePassword(this.modalData.user_id, this.modalData.password).subscribe(
    (response) => {
      console.log('Password update response:', response);
      // Optionally, show a success message or feedback to the user
      alert('Password updated successfully');
      this.closeModal();
    },
    (error) => {
      console.error('Error updating password:', error);
      // Show an error message if update fails
      alert('Error updating password');
    }
  );
}

togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}

  
  }
  
  
  
