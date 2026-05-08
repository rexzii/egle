import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd  } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { FilterModalComponent } from '../filter-modal/filter-modal.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgZone } from '@angular/core';
import { TodaysleadsComponent } from '../todaysleads/todaysleads.component';
import { ThismonthleadComponent } from '../thismonthlead/thismonthlead.component';
import { NextmonthleadComponent } from '../nextmonthlead/nextmonthlead.component';
import { PendinginvoicesComponent } from '../pendinginvoices/pendinginvoices.component';
import { RenewalsComponent } from '../renewals/renewals.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef  } from '@angular/core';
import Chart, { Tooltip } from 'chart.js/auto';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { catchError, throwError } from 'rxjs';

interface Lead {
  id: number;
  clientName: string;
  contact: string;
  stage: string;
  date: string;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent { 
user_id: any;
username: any;
company_name: any;
serialNumber: number = 1;
isFilterModalOpen: boolean = false; 
leadData: any[] = [];  
leadData1: any[] = []; 
itemData: any[] = [];  
selectedFilter: string = 'all';  
datePipe: any;
filterLeads: any;
openFilterPopup: any;
lead: any;
leads: any;
notifications: any[] = [];
showPopup: boolean = false;
showPopup1: boolean = false;
selectedNotification: any;
currentPage = 1;
itemsPerPage = 10; 
searchKeyword: string = ''; 
//company_name: any;
companyLogoUrl: string;
company_code: any;
companyCode: string = "";
companyLogoName: string;
path:string|null=null;
imageUrl:string|null=null;
chart: any;
selectedMonth: string;
leadCount: number | undefined;
lastMonthsLeadCount: number = 10;
leadDatas: any[] = []; 
user_right: any;
todayLeadsCount: number = 0;
thisMonthLeadsCount: number = 0;
nextMonthLeadsCount: number = 0;
renewalsCount: number = 0;
pendingInvoiceCount: number = 0;
accessDenied: boolean = false;
isModalOpen = false;
expireDate: string | null = '';
showModal: boolean = false;
showModals: boolean = false;
showPassword: boolean = false;
modalData: any = {
  user_id: '',
  username: '',
  password: ''
};
stage: string;
selectedStage: string = '';
stageDetails: any[] = [];
  leadDetails: any;
  userId: any;
admissions: any[] = [];
loading = false;

constructor(private zone: NgZone, private Service:ApiserviceService,private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private http: HttpClient, private changeDetectorRef: ChangeDetectorRef ){
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();
this.selectedMonth = `${currentMonth.toString().padStart(2, '0')}-${currentYear}`;
this.getLeadCount(this.selectedMonth, this.company_code);
this.user_right = this.getUserRightFromLocalStorage();
}

onChangeMonth(event: any) {
  this.selectedMonth = event.target.value;
  this.getLeadCount(this.selectedMonth, this.company_code);
}

getLeadCount(selectedMonth: string, companyCode: string) {
  if (!selectedMonth) return; 
  this.Service.getLeadCount(selectedMonth, companyCode).subscribe((response: any) => {
  console.log('Response:', response); 
  if (typeof response === 'number') {
    this.leadCount = response;
  } else if (typeof response === 'object' && response !== null && 'leadCount' in response) {
    this.leadCount = response.leadCount;
  } else {
    console.error('Unexpected response format:', response);
    this.leadCount = undefined;
  }
  });
}

calculatePercentageDifference(currentCount: number): number {
  return ((currentCount - this.lastMonthsLeadCount) / this.lastMonthsLeadCount) * 100
}

openLeadDetails() {
  // Call a service method to fetch the detailed information about the lead count
  this.Service.getLeadDetails(this.selectedMonth, this.company_code).subscribe((response: any) => {
    if (response && response.leads) {
      this.leadDetails = response.leads; // This will be the array of leads with their details
      this.showPopup1 = true; // Show the popup
    } else {
      console.error('Error: No lead details found');
    }
  });
}

closePopup1(): void {
  this.showPopup1 = false;
}



ngOnInit() {

  this.loadAdmissions();
  // const token = localStorage.getItem('token');
  // const userId = localStorage.getItem('user_id');

  // if (!token) {
  //   console.log("⛔ No token found, redirecting to login...");
  //   this.router.navigate(['/login']);
  //   return;
  // }

  // this.route.paramMap.subscribe(params => {
  //   let currentUserId = params.get('user_id');
  //   if (!currentUserId && userId) {
  //     this.router.navigate([`/dashboard/${userId}`]);  
  //   }
  // });

  
  
      this.route.params.subscribe(params => {
       this.user_id = params['user_id'];
       console.log('user_id from path:', this.user_id);
      });

    this.route.queryParams.subscribe(queryParams => {
       this.username = queryParams['username'];
       this.company_code = queryParams['company_code'];
       this.company_name = queryParams['company_name'];
       this.user_right = queryParams['user_right'];
       console.log('Query Params on Dashboard:', queryParams);
       console.log('Company Code:', this.company_code);
       console.log('Query Params on Dashboard:', queryParams);
   console.log('Company Name:', this.company_name);
     });

   if (this.company_code) {
     this.fetchImage(this.company_code);
   } else {
     console.error('Company code is not defined.');
   }
  
   this.route.queryParams.subscribe(params => {
     if (params['fromLogin'] === 'true') {
       this.showPopup = true;
     }
   });

  
  
  this.getLeadData(this.company_code, this.user_right, this.username); 
   this.getLeadDatabydate(this.company_code); 
   this.getLeadData1(this.company_code); 
   this.getLeadCount(this.selectedMonth, this.company_code);
   generatePieChart(this.company_code);
   if (this.company_code) {
     this.fetchNotifications(this.company_code);
   }
   this.expireDate = localStorage.getItem('expire_date');

async function generateExcelFile() {
  try {
    const response = await fetch('https://prathhamcrm.com/nodeapp/leads'); 
    const leadData = await response.json();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(leadData);
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_data.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating Excel file:', error);
  }
}

async function generatePieChart(companyCode: string) {
  try {
    const response = await fetch(`https://prathhamcrm.com/nodeapp/leads?company_code=${companyCode}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    console.log('API Response:', responseData); 
    if (responseData.message === 'Data not found' || responseData.data.length === 0) {
      console.log('No data found for company code:', companyCode);
      return;
    }
    const leadData = responseData.data;
    const canvas = document.getElementById('leadPieChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element with ID "leadPieChart" not found.');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for canvas.');
      return;
    }
    canvas.width = 330;
    canvas.height = 250;
    // canvas.labels.width = 700;
    const labels = leadData.map((entry: { source: any; }) => entry.source);
    const data = leadData.map((entry: { count: any; }) => entry.count);
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  const dataset = context.dataset;
                  const total = dataset.data.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
                  const currentValue = dataset.data[context.dataIndex];
                  const percentage = Math.round((currentValue / total) * 100);
                  label += `: ${percentage}%`;
                }
                return label;
              }
            }
          }
        }
      }
    });
    const downloadExcelButton = document.getElementById('downloadExcelButton');
    if (downloadExcelButton) {
      downloadExcelButton.addEventListener('click', generateExcelFile);
    } else {
      console.error('Button element with ID "downloadExcelButton" not found.');
    }

  } catch (error) {
    console.error('Error fetching or parsing data:', error);
  }
}
} 


getLeadData(companyCode: string, user_right: string, username?: string) {
 console.log('Sending request with:', this.company_code, this.user_right, this.username);
  this.Service.getLeadData(companyCode, user_right, username).subscribe(
    (data: any) => {
      console.log('Received Lead Data:', JSON.stringify(data)); // Debugging

      if (data && data.data) {
        // Process and filter the data
        this.itemData = data.data.map((item: any, index: number) => {
          const leadDate = new Date(item.next_month_follow_up);
          const currentDate = new Date();

          // Check if the date is in the correct range
          if (
            leadDate.getFullYear() === currentDate.getFullYear() &&
            leadDate >= new Date(currentDate.getFullYear(), currentDate.getMonth() - 1) && // One month before
            leadDate <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 2) // Two months after
          ) {
            return {
              ...item,
              serialNumber: index + 1,
              nextfollow_up_by: item.next_month_follow_up,
              previousMonthFollowUp: item.previous_month_follow_up,
              afterNextMonthFollowUp: item.after_next_month_follow_up || null
            };
          }
          return null;
        }).filter((lead1: null) => lead1 !== null); // Remove null entries

        console.log('Processed and Filtered Lead Data:', this.itemData); // Debugging

      } else {
        console.error('No data received or data structure is incorrect', data);
      }
    },
    (error: any) => {
      console.error('Error fetching lead data:', error);
    }
  );
}


showNotificationPopup() {
  this.showPopup = true;
}

 getLeadData1(companyCode: string): void {
   this.Service.getAllLead(companyCode).subscribe(
       (data: any) => {
           this.leadData1 = data;
           this.updatePendingDiv(data, 'Invoice Pending', 'pending');
           this.updatePendingDiv(data, 'Verbal Discussion', 'verbalCount');
           this.updatePendingDiv(data, 'Quotation Followup', 'QuotationCount');
           this.updatePendingDiv(data, 'Order Received', 'ReceivedCount');
           this.updatePendingDiv(data, 'Order Closed', 'ClosedCount');
           this.prepareChartData();
       },
       (error) => {
           console.error('Error fetching lead data:', error);
       }
   );
 }

 updatePendingDiv(data: any, stage: string, elementId: string): void {
   const element = document.getElementById(elementId);
   if (element) {
       const count = this.calculateStageCount(data, stage);
       element.innerText = count.toString();
   } else {
       console.error(`Element with ID '${elementId}' not found`);
   }
 }

calculateStageCount(data: any, stage: string): number {
  return data.filter((lead: any) => lead.stage === stage).length;
}

openDetails(stage: string): void {
  console.log("Clicked on:", stage);  
  this.selectedStage = stage;
  this.stageDetails = this.getStageDetails(stage);
  this.showModals = true;
  console.log(this.showModals);
}

getStageDetails(stage: string): any[] {
  return this.leadData1.filter((lead: any) => lead.stage === stage);
}

closeModal1(): void {
  this.showModals = false;
}

prepareChartData(): void {
  const leadsCountData: number[] = Array(12).fill(0);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  this.leadData1.forEach(lead => {
    const leadMonth = new Date(lead.nextfollow_up_by).getMonth(); 
    const leadYear = new Date(lead.nextfollow_up_by).getFullYear(); 
    if (leadYear === currentYear) {
      leadsCountData[leadMonth]++; 
    }
  });
  const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const canvas: any = document.getElementById('leadsChart');
  const ctx = canvas.getContext('2d');
  this.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months, 
      datasets: [{
        label: `Leads Count for ${currentYear}`,
        data: leadsCountData, 
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

calculateLeadsCountByMonth(leadData1: any[]): { [key: string]: number[] } {
  const leadsCountByYearAndMonth: { [key: string]: number[] } = {};
  const currentMonth = new Date().getMonth();
  leadData1.forEach(lead => {
    const followUpDate = new Date(lead.nextfollow_up_by);
    const monthIndex = followUpDate.getMonth();
    const year = followUpDate.getFullYear();
    if (monthIndex === currentMonth) {
      const yearMonthKey = `${year}-${currentMonth + 1}`; 
      if (!leadsCountByYearAndMonth[yearMonthKey]) {
        leadsCountByYearAndMonth[yearMonthKey] = Array(12).fill(0); 
      }
      leadsCountByYearAndMonth[yearMonthKey][currentMonth]++;
    }
  });
  return leadsCountByYearAndMonth;
}

downloadExcelFile(): void {
  const leadsCountData = this.calculateLeadsCountByMonth(this.leadData1);
  const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const leadDataForExcel = months.map((month, index) => ({
    'Month': month,
    'Lead Count': leadsCountData[index]
  }));
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(leadDataForExcel);
  const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const excelBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  FileSaver.saveAs(excelBlob, 'leadsData.xlsx');
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
    }
  );
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

getCurrentPageData() {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const keyword = this.searchKeyword.toLowerCase();

  // Use admissions in the dashboard table so new admissions appear immediately.
  if (this.admissions && this.admissions.length > 0) {
    const filteredAdmissions = this.admissions.filter((item: any) => {
      const studentId = (item.student_id ?? '').toString().toLowerCase();
      const name = (item.name ?? '').toString().toLowerCase();
      return studentId.includes(keyword) || name.includes(keyword);
    });

    return filteredAdmissions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  const filteredData = this.itemData.filter(item =>
    (item.personname || '').toLowerCase().includes(keyword)
  );
  const currentDate = new Date();
  const filteredAndPaginatedData = filteredData.filter(item => {
    const nextFollowUpDate = new Date(item.nextfollow_up_by);
    return (
      nextFollowUpDate.getFullYear() === currentDate.getFullYear() &&
      nextFollowUpDate >= new Date(currentDate.getFullYear(), currentDate.getMonth() - 1) &&
      nextFollowUpDate <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 2)
    );
  });
  return filteredAndPaginatedData.slice(startIndex, startIndex + this.itemsPerPage);
}
  
totalPages() {
  const admissionsCount = this.admissions?.length || 0;
  const rowsCount = admissionsCount > 0 ? admissionsCount : this.leadData.length;
  return Array(Math.ceil(rowsCount / this.itemsPerPage)).fill(0).map((x, i) => i + 1);
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

navigateToFamilyPage() {
  if (this.user_id) {
    const queryParams = {
      username: this.username || '',
      company_code: this.company_code || '',
      company_name: this.company_name || '',
      user_right: this.user_right || ''
    };

    console.log("🚀 Navigating to Add Lead Page:", `/new-admission/${this.user_id}`, queryParams);

    //this.router.navigate([`/addLead`, this.user_id], { queryParams });
this.router.navigate([`/new-admission`, this.user_id], { queryParams });
  } else {
    console.error('❌ user_id is undefined. Unable to navigate.');
    this.router.navigate(['/login']);  // Agar user_id nahi mili toh login pe bhejo
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

showAccessDenied() {
  this.accessDenied = true;
  setTimeout(() => this.accessDenied = false, 3000); 
}

private getUserRightFromLocalStorage(): string {
  return localStorage.getItem('user_right') || 'default';
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

navigateTomanageuser() {
  if (this.user_id !== undefined && this.user_id !== null) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right
    };
    this.router.navigate(['/manageruser', this.user_id], { queryParams });
  } else {
    console.error('user_id is undefined or null. Unable to navigate.');
    this.router.navigate(['/login']);  // Redirect to login if user_id is not available
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
  }else {
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

 getLeadDatabydate(companyCode: string) {
    this.Service.getLeadDatabydate(companyCode).subscribe(
     (data: any) => {
       console.log('Lead Data:', data); 
       this.leadData = data.map((lead: any, index: number) => ({
         ...lead,
         serialNumber: index + 1,
         nextfollow_up_by: lead.next_month_follow_up,
         previousMonthFollowUp: lead.previous_month_follow_up,
         afterNextMonthFollowUp: lead.after_next_month_follow_up
      }));
      this.updateCounts();
     },
     (error) => {
       console.error('Error fetching lead data:', error);
     }
    );
 }

updateCounts() {
  this.todayLeadsCount = this.getTodayLeadsCount();
  this.thisMonthLeadsCount = this.getThisMonthLeadsCount();
  this.nextMonthLeadsCount = this.getNextMonthLeadsCount();
  this.renewalsCount = this.getRenewalsCount();
  this.pendingInvoiceCount = this.pendinginvoiceCount();
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
      company_name: this.company_name, 
      user_right: this.user_right 
    }
  });   
}

navigateToViewLead(lead_id: string): void {
  this.router.navigate(['/view-leaddetails', lead_id], {
    queryParams: { 
      username: this.username,
      user_id: this.user_id,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right
    }
  });
}
  
openFilterModal(): void {
  const dialogRef = this.dialog.open(FilterModalComponent, {
    width: '90%',  
    maxWidth: '900px',
    panelClass: 'custom-dialog'
  });
  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed with result:', result);
  });
}

openFilterModal1(): void {
  const dialogRef = this.dialog.open(TodaysleadsComponent, {
    width: '70%',  
    maxWidth: '900px',
    panelClass: 'custom-dialog'
  });
  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed with result:', result);
  });
}
  

openFilterModal2(): void { 
  const dialogRef = this.dialog.open(ThismonthleadComponent, {
    width: '70%',  
    maxWidth: '900px',
    panelClass: 'custom-dialog'
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed with result:', result);
  });
}



openFilterModal3(): void {
  const dialogRef = this.dialog.open(NextmonthleadComponent, {
    width: '70%',  
    maxWidth: '900px',
    panelClass: 'custom-dialog'
  });
  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed with result:', result);
  });
}

openFilterModal4(): void {
  const dialogRef = this.dialog.open(PendinginvoicesComponent, {
    width: '70%',  
    maxWidth: '900px',
    panelClass: 'custom-dialog'
  });
  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed with result:', result);
  });
}

openFilterModal5(): void {
  const dialogRef = this.dialog.open(RenewalsComponent, {
    width: '70%',  
    maxWidth: '900px',
    panelClass: 'custom-dialog'
  });
  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed with result:', result);
  });
}
  
getTodayLeadsCount(): number {
  const today = new Date();
  const todayString = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  const todayLeads = this.leadData.filter(lead => {
  const leadDate = new Date(lead.nextfollow_up_by);
  const leadDateString = `${leadDate.getMonth() + 1}/${leadDate.getDate()}/${leadDate.getFullYear()}`;
  return leadDateString === todayString;
  });
    return todayLeads.length;
}

getThisMonthLeadsCount(): number {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const thisMonthLeads = this.leadData.filter(lead => {
  const leadDate = new Date(lead.nextfollow_up_by);
  return leadDate >= startOfMonth && leadDate <= endOfMonth;
  });
  return thisMonthLeads.length;
}
  
getNextMonthLeadsCount(): number {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextMonthLeads = this.leadData.filter(lead => {
  const leadDate = new Date(lead.nextfollow_up_by);
  return leadDate >= nextMonth && leadDate < new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1);
  });
  return nextMonthLeads.length;
}
  
getRenewalsCount(): number {
  return this.leadData.filter(lead => lead.stage === 'Order Closed').length;
}

pendinginvoiceCount(): number {
  console.log(this.leadData);
  return this.leadData.filter(lead => 
    ['First Invoice Pending', 'Second Invoice Pending', 'Third Invoice Pending'].includes(lead.stage)
  ).length;
}

 
fetchNotifications(companyCode: string): void {
  this.Service.getNotifications(companyCode).subscribe(
    (data: any) => {
      console.log('Received notifications data:', data);
      this.notifications = data.notifications;
      if (this.notifications.length > 0) {
        this.selectedNotification = this.notifications[0]; 
        this.showPopup = true;
      }
    },
    (error) => {
      console.error('Error fetching notifications:', error);
    }
  );
}

closePopup(): void {
  this.showPopup = false;
  console.log('closePopup() called. showPopup:', this.showPopup);
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

 logout() {
   localStorage.removeItem('token');
   this.router.navigate(['/login']);
 }

// logout() {
//   localStorage.removeItem('isLoggedIn');  
//   localStorage.removeItem('username');
//   localStorage.removeItem('password');

//   // Redirect to the login page or any other page
//   this.router.navigate(['/']);
// }



dash1() {
  const queryParams = {
    username: this.username, 
  };
  this.router.navigate(['/dashboard', this.user_id], { queryParams });
}

dash2() {
  const queryParams = {
    username: this.username,  
  };
  this.router.navigate(['/dashboard', this.user_id], { queryParams });
}

navigateToleadEdit(lead_id: any): void {
  this.router.navigate(['/leadedit', lead_id], {
    queryParams: { 
      username: this.username,
      user_id: this.user_id,
      company_code: this.company_code,
      company_name: this.company_name, 
      user_right: this.user_right 
    }
  }); 
}

makePhoneCall(mobileno: string) {
  const cleanmobileno = mobileno.replace(/\D/g, '');
  const telUri = `tel:${cleanmobileno}`;
  window.location.href = telUri;
}

deleteItem(lead_id: number, username: string): void {
  this.Service.deletelead(lead_id.toString(), username).subscribe(() => {
    console.log('Item deleted successfully');
    alert('Item deleted successfully');
     this.updateLeadDataAfterDeletion(lead_id);
    this.changeDetectorRef.detectChanges();
    this.getLeadData(this.company_code, this.user_right, this.username); 
   
  },
  (error) => {
    console.error('Error deleting item:', error);
    alert('Item deleted successfully');
    this.updateLeadDataAfterDeletion(lead_id);
    this.changeDetectorRef.detectChanges();
  });
}

openDeleteConfirmation(statusId: number, username: string): void {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.panelClass = 'custom-dialog-container'; 
  dialogConfig.data = 'Are you sure you want to delete?';
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
  dialogRef.afterClosed().subscribe(result => {
      if (result === true) { 
        this.deleteItem(statusId, username); 
      } else {
      }
  });
}

updateLeadDataAfterDeletion(deletedId: number) {
    const index = this.leadData.findIndex(lead => lead.lead_id === deletedId);
    if (index !== -1) {
        this.leadData.splice(index, 1);
    }
}

openWhatsApp(contactNo: string): void {
  const message = encodeURIComponent('');
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${contactNo}&text=${message}`;
  window.open(whatsappUrl, '_blank');
}

openModal() {
  this.isModalOpen = true;
}

openUserPopup(userId: string, userName: string) {
  this.modalData.user_id = userId;
  this.modalData.username = userName;
  this.modalData.password = ''; 
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
}

submitUserForm() {
  console.log('Form submitted:', this.modalData);
  this.Service.updatePassword(this.modalData.user_id, this.modalData.password).subscribe(
    (response) => {
      console.log('Password update response:', response);
      alert('Password updated successfully');
      this.closeModal();
    },
    (error) => {
      console.error('Error updating password:', error);
      alert('Error updating password');
    }
  );
}

togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}


loadAdmissions(): void {
    this.loading = true;
    this.Service.getAdmissions().subscribe({
      next: (res: any) => {
        this.admissions = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/admission_view', id]);
  }

  editAdmission(id: number): void {
    if (this.user_id !== undefined && this.user_id !== null) {
      const queryParams = {
        username: this.username,
        company_code: this.company_code,
        company_name: this.company_name,
        user_right: this.user_right,
        edit_id: id
      };
      this.router.navigate(['/new-admission', this.user_id], { queryParams });
      return;
    }

    // Fallback route if user context is missing.
    this.router.navigate(['/admission/edit', id]);
  }

  deleteAdmission(id: number): void {
    if (confirm('Are you sure you want to delete this admission?')) {
      this.Service.deleteAdmission(id).subscribe({
        next: () => {
          alert('Deleted successfully');
          this.loadAdmissions();
        },
        error: (err) => alert('Delete failed: ' + err.message)
      });
    }
  }

  createReceipt(id: number): void {
    // Option 1: open a new window with receipt HTML
    this.Service.getAdmissionById(id).subscribe((res: any) => {
      const receiptHtml = this.generateReceiptHtml(res.data.admission);
      const win = window.open();
      win?.document.write(receiptHtml);
      win?.print();
    });
  }

  generateReceiptHtml(admission: any): string {
    return `
      <html>
      <head><title>Admission Receipt</title></head>
      <body style="font-family: Arial; padding: 20px;">
        <h1>NIILM University</h1>
        <h3>Admission Receipt</h3>
        <p><strong>Student ID:</strong> ${admission.student_id || 'N/A'}</p>
        <p><strong>Name:</strong> ${admission.name}</p>
        <p><strong>Course:</strong> ${admission.course_applying}</p>
        <p><strong>Session:</strong> ${admission.academic_session}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <hr>
        <p>This is a computer generated receipt.</p>
      </body>
      </html>
    `;
  }


}


