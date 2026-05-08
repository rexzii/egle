import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddleadComponent } from './addlead/addlead.component';
import { LeadupdateComponent } from './leadupdate/leadupdate.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ViewleaddetailsComponent } from './viewleaddetails/viewleaddetails.component';
import { FilterModalComponent } from './filter-modal/filter-modal.component';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EditfollowupComponent } from './editfollowup/editfollowup.component';
import { TodaysleadsComponent } from './todaysleads/todaysleads.component';
import { ThismonthleadComponent } from './thismonthlead/thismonthlead.component';
import { NextmonthleadComponent } from './nextmonthlead/nextmonthlead.component';
import { PendinginvoicesComponent } from './pendinginvoices/pendinginvoices.component';
import { RenewalsComponent } from './renewals/renewals.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { TrashLeadsComponent } from './trash-leads/trash-leads.component';
import { EmailreportsComponent } from './emailreports/emailreports.component';
import { LeadStatisticsComponent } from './lead-statistics/lead-statistics.component';
import { RegisterComponent } from './register/register.component';
import { MasterEntryComponent } from './master-entry/master-entry.component';
import { CompanyRegisterComponent } from './company-register/company-register.component';
import { UpdatecompanyComponent } from './updatecompany/updatecompany.component';
import { UserDetailsModalComponent } from './user-details-modal/user-details-modal.component';
import { UsereditComponent } from './useredit/useredit.component';
import { LeadeditComponent } from './leadedit/leadedit.component';
import { ConfirmationDialogboxComponent } from './confirmation-dialogbox/confirmation-dialogbox.component';
import { MessageEditorComponent } from './message-editor/message-editor.component';
import { FacebookLeadsComponent } from './facebook-leads/facebook-leads.component';
import { AttendanceModalComponent } from './attendance-modal/attendance-modal.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ManageuserComponent } from './manageuser/manageuser.component';
import { EmailEditorDialogComponent } from './email-editor-dialog/email-editor-dialog.component';
import { PasswordModalComponent } from './password-modal/password-modal.component';
import { IndiamartLeadsComponent } from './indiamart-leads/indiamart-leads.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TbSupportregistrationComponent } from './tb-supportregistration/tb-supportregistration.component';
import { SupportloginComponent } from './supportlogin/supportlogin.component';
import { SupportdashbordComponent } from './supportdashbord/supportdashbord.component';
import { SupportEndcustomerComponent } from './support-endcustomer/support-endcustomer.component';
import { TicketviewComponent } from './ticketview/ticketview.component';
import { ModalComponent } from './modal/modal.component';
import { WebcamModule } from 'ngx-webcam';
import { VisitingCardScannerComponent } from './visiting-card-scanner/visiting-card-scanner.component';
import { AdmissionFormComponent } from './admission-form/admission-form.component';
import { AdmissionDetailComponent } from './admission-detail/admission-detail.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AddleadComponent,
    LeadupdateComponent,
    ViewleaddetailsComponent,
    FilterModalComponent,
    NotificationDetailsComponent,
    ForgotpasswordComponent,
    EditfollowupComponent,
    TodaysleadsComponent,
    ThismonthleadComponent,
    NextmonthleadComponent,
    PendinginvoicesComponent,
    RenewalsComponent,
    ConfirmationDialogComponent,
    TrashLeadsComponent,
    EmailreportsComponent,
    LeadStatisticsComponent,
    RegisterComponent,
    MasterEntryComponent,
    CompanyRegisterComponent,
    UpdatecompanyComponent,
    UserDetailsModalComponent,
    UsereditComponent,
    LeadeditComponent,
    ConfirmationDialogboxComponent,
    MessageEditorComponent,
    FacebookLeadsComponent,
    AttendanceModalComponent,
    HomepageComponent,
    ManageuserComponent,
    EmailEditorDialogComponent,
    PasswordModalComponent,
    IndiamartLeadsComponent,
    TbSupportregistrationComponent,
    SupportloginComponent,
    SupportdashbordComponent,
    SupportEndcustomerComponent,
    TicketviewComponent,
    ModalComponent,
    VisitingCardScannerComponent,
    AdmissionFormComponent,
    AdmissionDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatIconModule,
    NgbModule,
    WebcamModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
