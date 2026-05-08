import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiserviceService } from '../apiservice.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.css']
})

export class NotificationDetailsComponent implements OnInit {
@Input() notification: any; 
@Output() closePopup = new EventEmitter<void>();
selectedNotification: any; 
notifications: any;
showPopup: boolean;
user_id: any;
username: any;
companyName: any;
company_code: any;
user_right: any;
 
constructor(private service: ApiserviceService, private router: Router, private route: ActivatedRoute,) { }

ngOnInit(): void {
  this.route.params.subscribe(params => {
  this.user_id = params['user_id']; 
  });
  this.route.queryParams.subscribe(queryParams => {
  this.username = queryParams['username']; 
  this.company_code = queryParams['company_code'];
  this.companyName = queryParams['company_name'];
  this.user_right = queryParams['user_right'];
  });

  if (this.company_code) {
  this.fetchNotifications(this.company_code); 
  }
  this.showPopup = true;
  }

fetchNotifications(companyCode: string): void {
  this.service.getNotifications(companyCode).subscribe(
    (data: any) => {
    console.log('Received notifications data:', data);
    this.notifications = data.notifications;
    },
    (error) => {
      console.error('Error fetching notifications:', error);
    }
  );
}

showNotificationDetails(notification: any) {
  console.log('Clicked on notification:', notification);
  this.selectedNotification = notification;
  console.log('Selected notification:', this.selectedNotification);
  this.showPopup = true;
  console.log('Show popup:', this.showPopup);
}
  
convertTo12HourFormat(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const suffix = +hours >= 12 ? 'PM' : 'AM';
  const convertedHours = +hours % 12 || 12;
  return `${convertedHours}:${minutes} ${suffix}`;
}

togglePopup() {
  this.showPopup = !this.showPopup;
}

navigateToUpdateLead(leadId: number, personName: string, email: string) {
  this.router.navigate(['/updatelead'], {
    queryParams: {
      lead_id: leadId,
      personname: personName,
      email: email,
      username: this.username,
      user_id: this.user_id , 
      company_code: this.company_code,
      companyName: this.companyName, 
      user_right: this.user_right 
    }
  });   
}
}