import { Component, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd  } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AttendanceRecord } from '../attendance-record.model'; 

@Component({
  selector: 'app-attendance-modal',
  templateUrl: './attendance-modal.component.html',
  styleUrls: ['./attendance-modal.component.css']
})

export class AttendanceModalComponent {
isModalOpen = false;
username: string; 
company_code: string; 
@Output() close = new EventEmitter<void>();
user_id: any;
company_name: any;
user_right: any;
attendanceRecords: AttendanceRecord[] = []; 
filteredRecords: AttendanceRecord[] = []; 
fromDate: string;
toDate: string;
currentPage = 1;
itemsPerPage = 5; 
searchKeyword: string = ''; 
isThisWeekSelected: boolean = false;
isThisMonthSelected: boolean = false; 

constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient){
  this.filteredRecords = this.attendanceRecords; 
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
  this.getAttendanceData();
}

getAttendanceData() {
  this.http.get<AttendanceRecord[]>(`https://prathhamcrm.com/nodeapp/getattendance?username=${this.username}&company_code=${this.company_code}`)
    .subscribe({
     next: (data) => {
    this.attendanceRecords = data.map(record => ({
    ...record,
    date: new Date(record.date), 
    time: typeof record.time === 'string' ? this.convertToDate(record.time) : record.time, 
    stop_time: typeof record.stop_time === 'string' ? this.convertToDate(record.stop_time) : record.stop_time 
    }));
    this.filteredRecords = this.attendanceRecords; 
  },
  error: (error) => {
  console.error('Error fetching attendance data:', error);
  alert('Failed to fetch attendance data');
  }
  });
}
  
setThisWeek() {
  this.isThisWeekSelected = true;
  this.isThisMonthSelected = false;

  const currentDate = new Date();
  const dayOfWeek = currentDate.getDay();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - dayOfWeek); // Start of the week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);
  
  this.fromDate = startOfWeek.toISOString().split('T')[0]; // Format date to yyyy-mm-dd
  this.toDate = endOfWeek.toISOString().split('T')[0]; // Format date to yyyy-mm-dd

  this.filterAttendance(); // Apply the filter immediately
}

setThisMonth() {
  this.isThisWeekSelected = false;
  this.isThisMonthSelected = true;

  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of the month
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Last day of the month
  endOfMonth.setHours(23, 59, 59, 999);

  this.fromDate = startOfMonth.toISOString().split('T')[0]; // Format date to yyyy-mm-dd
  this.toDate = endOfMonth.toISOString().split('T')[0]; // Format date to yyyy-mm-dd

  this.filterAttendance(); // Apply the filter immediately
}

filterAttendance() {
  if (this.fromDate && this.toDate) {
    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    this.filteredRecords = this.attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= from && recordDate <= to;
    });
  } else {
    this.filteredRecords = this.attendanceRecords; 
  }
}
  
closeModal() {
  this.close.emit();
}

startAttendance() {
  navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          .then(response => response.json())
          .then(locationData => {
              let locationName = 'Unknown location';
              if (locationData && locationData.address) {
                  const { road, suburb, city, county, state, postcode } = locationData.address;
                  locationName = [road, suburb, city, county, state, postcode].filter(Boolean).join(', ');
              }
              const data = {
                  username: this.username,
                  company_code: this.company_code,
                  location: locationName,
                  coordinates: `${latitude}, ${longitude}`,
                  date: currentDate,
                  time: currentTime
              };
              console.log('Data being sent:', data); 
              return fetch(`https://prathhamcrm.com/nodeapp/attendance-check?username=${this.username}&company_code=${this.company_code}`)
                  .then(response => response.json())
                  .then(checkData => {
                      if (checkData.attendanceExists) {
                          throw new Error('Attendance already recorded for today, but you can continue working.');
                      }
                      return fetch('https://prathhamcrm.com/nodeapp/attendance', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data)
                      });
                  });
          })
          .then(response => {
              console.log('Response:', response);
              if (!response.ok) {
                  return response.json().then(errData => {
                      console.error('Error data:', errData);
                      throw new Error(errData.error || 'Network response was not ok');
                  });
              }
              return response.json();
          })
          .then(data => {
              alert(data.message);
              this.closeModal();
          })
          .catch(error => {
              console.error('Error:', error);
              alert(error.message);
          });
  });
}

stopAttendance() {
  const confirmLogout = confirm("Are you sure you want to log out for the day?");
  if (!confirmLogout) {
      return;
  }
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  const data = {
      username: this.username,
      company_code: this.company_code,
      stop: true,
      date: currentDate,
      time: currentTime
  };
  console.log('Data being sent:', data); 
  fetch('https://prathhamcrm.com/nodeapp/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
  })
  .then(response => {
      if (!response.ok) {
          console.error('Response error:', response.status, response.statusText);
          return response.json().then(errorData => {
              console.error('Error data:', errorData);
              throw new Error(errorData.error || 'Network response was not ok');
          });
      }
      return response.json(); 
  })
  .then(data => {
      console.log('Response data:', data); 
      alert(data.message);
      this.closeModal();
  })
  .catch(error => {
      console.error('Error:', error); 
      alert('Error occurred: ' + error.message); 
  });
}

convertToDate(timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return date;
}

onEntriesChange(event: any) {
  const value = event?.target?.value;
    if (value !== null && value !== undefined) {
      this.itemsPerPage = parseInt(value, 10);
    }
  }
  
onPageChange(pageNumber: number) {
  this.currentPage = pageNumber;
}
  
getCurrentPageRecords(): AttendanceRecord[] {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  return this.filteredRecords.slice(startIndex, startIndex + this.itemsPerPage);
}

    
totalPages() {
  return Array(Math.ceil(this.attendanceRecords.length / this.itemsPerPage)).fill(0).map((x, i) => i + 1);
}
  
onPrevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}
  
onNextPage() {
  if (this.currentPage < this.totalPages().length) {
  this.currentPage++;
  }
}

}  