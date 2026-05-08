import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddleadComponent } from './addlead/addlead.component';
import { LeadupdateComponent } from './leadupdate/leadupdate.component';
import { ViewleaddetailsComponent } from './viewleaddetails/viewleaddetails.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { EditfollowupComponent } from './editfollowup/editfollowup.component';
import { TrashLeadsComponent } from './trash-leads/trash-leads.component';
import { EmailreportsComponent } from './emailreports/emailreports.component';
import { LeadStatisticsComponent } from './lead-statistics/lead-statistics.component';
import { RegisterComponent } from './register/register.component';
import { MasterEntryComponent } from './master-entry/master-entry.component';
import { CompanyRegisterComponent } from './company-register/company-register.component';
import { UsereditComponent } from './useredit/useredit.component';
import { LeadeditComponent } from './leadedit/leadedit.component';
import { FacebookLeadsComponent } from './facebook-leads/facebook-leads.component';
import { AuthGuard } from './auth.guard';
import { HomepageComponent } from './homepage/homepage.component';
import { ManageuserComponent } from './manageuser/manageuser.component';
import { UpdatecompanyComponent } from './updatecompany/updatecompany.component';
import { IndiamartLeadsComponent } from './indiamart-leads/indiamart-leads.component';
import { TbSupportregistrationComponent } from './tb-supportregistration/tb-supportregistration.component';
import { SupportloginComponent } from './supportlogin/supportlogin.component';
import { SupportdashbordComponent } from './supportdashbord/supportdashbord.component';
import { SupportEndcustomerComponent } from './support-endcustomer/support-endcustomer.component';
import { TicketviewComponent } from './ticketview/ticketview.component';
import { VisitingCardScannerComponent } from './visiting-card-scanner/visiting-card-scanner.component';
import { AdmissionFormComponent } from './admission-form/admission-form.component';
import { AdmissionDetailComponent } from './admission-detail/admission-detail.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },  
  { path: 'login', component: LoginComponent },
  // { path: 'dashboard/:user_id', component: DashboardComponent, canActivate: [AuthGuard] },  
  // { path: 'addLead/:user_id', component: AddleadComponent, canActivate: [AuthGuard] },
    { path: 'dashboard/:user_id', component: DashboardComponent},  
   { path: 'addLead/:user_id', component: AddleadComponent},
  { path: 'register/:user_id',component: RegisterComponent},
  { path: 'manageruser/:user_id',component: ManageuserComponent},
  {path: 'updatelead',component: LeadupdateComponent},
  {path: 'view-leaddetails/:lead_id',component: ViewleaddetailsComponent},
  {path: 'forgotpassword',component: ForgotpasswordComponent},
  {path: 'followupedit/:status_id',component: EditfollowupComponent},
  {path: 'trash_leads/:user_id',component: TrashLeadsComponent},
  {path: 'email_reports/:user_id',component: EmailreportsComponent},
  {path: 'lead_statastics/:user_id',component: LeadStatisticsComponent},
  {path: 'masters_entry/:user_id',component: MasterEntryComponent},
  {path: 'company_register',component: CompanyRegisterComponent},
  {path: 'useredit/:user_id',component: UsereditComponent},
  {path: 'leadedit/:lead_id',component: LeadeditComponent},
  {path: 'companyedit/:company_code',component: UpdatecompanyComponent},
  {path: 'facebookleads/:user_id',component: FacebookLeadsComponent},
  {path: 'indiamartleads',component: IndiamartLeadsComponent},
  {path: 'supportregistration',component: TbSupportregistrationComponent},
  {path: 'supportlogin',component: SupportloginComponent},//supportlogin
  {path: 'supportdashbord/:support_id',component: SupportdashbordComponent},
  { path: 'support_endcustomer/:company_code', component: SupportEndcustomerComponent },
  {path: 'view-ticket/:ticket_id',component: TicketviewComponent},
  {path: 'visitingcard-scanner/:user_id',component: VisitingCardScannerComponent},
  {path: 'new-admission/:user_id', component: AdmissionFormComponent },
  {path: 'admission/edit/:id', component: AdmissionFormComponent },
  {path: 'admission_view/:id',component: AdmissionDetailComponent},
  
   
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
// { path: 'login', component: LoginComponent },
  // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  // { path: '**', redirectTo: 'login' },
  //  { path: '', component: HomepageComponent},//home
  // { path: 'login', component: LoginComponent},
   //{ path: 'dashboard/:user_id', component: DashboardComponent },
   //  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' },