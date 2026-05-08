import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginResponse {
  message: string;
  userData: {
    support_id: string;
    company_data: {
      company_code: string;
      username: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})

export class ApiserviceService {
[x: string]: any;
http: any;
  
private readonly accessToken = 'EAAZAtQg69mwgBO7uzranmj3ZCy3iiZBC8tZCDKryi9uhJbEGJN2v4885JcXXPYOTJGjKzcT49EaM8jmZASXkUOcomg047sl5PeHXiZBXu8WJLxyRCJk8NUf4Lg1i2MsWK1vqMtvDeiiYojJ8UqZCZCwupX6OR7pOFva9wXRuriimyV5moFCE2TgijNQl';

constructor(private _http: HttpClient) { }

getLeadAds(adId: string): Observable<any> {
  const apiUrl = `https://graph.facebook.com/v13.0/${adId}/leads?access_token=${this.accessToken}`;
  return this._http.get(apiUrl);
}

companyregistration(formData:FormData):Observable<any>{
 return this._http.post(`http://localhost:3000/nodeapp/new_company`,formData);
}

registration(formData: any): Observable<any> {
  return this._http.post('http://localhost:3000/nodeapp/register', formData);
}

updateTeammates(data: any): Observable<any> {
  return this._http.post('http://localhost:3000/nodeapp/update-teammates', data);
}

// GET request for protected route
getProtectedData(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this._http.get(`http://localhost:3000/nodeapp/protected-route`, { headers });
}

loginData(data: any) {
  console.log("🚀 Sending login request:", data);
  return this._http.post('http://localhost:3000/nodeapp/login', data);
}

saveLoginData(token: string, userData: any) {
  console.log("🟢 Attempting to Save Token:", token);
  
  if (!token) {
    console.error("⛔ Token is undefined! Cannot save.");
    return;
  }

  localStorage.setItem('token', token);
  localStorage.setItem('userData', JSON.stringify(userData));

  console.log("✅ Token Saved in LocalStorage:", localStorage.getItem('token'));
  console.log("✅ User Data Saved:", localStorage.getItem('userData'));
}

isLoggedIn(): boolean {
  const token = localStorage.getItem('token'); 
  return !!token;  // ✅ Token agar hai to true return karega
}





getUserData() {
  return JSON.parse(localStorage.getItem('userData') || '{}');
}


logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  this['router'].navigate(['/login']);
}

addlead(formData:FormData):Observable<any>{
  console.log('Sending form data to API:', formData);
 return this._http.post(`http://localhost:3000/nodeapp/addlead`,formData);
}

leadupdate(data: any, lead_id: string): Observable<any> {
  return this._http.put(`http://localhost:3000/nodeapp/leadupdate/${lead_id}`, data);
}

getLeadDatabydate(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displayAllleadbydate?company_code=${companyCode}`).pipe(
    map((response: any) => response.data),
    catchError((error) => {
    console.error('Error fetching lead data:', error);
      throw error;
    })
  );
}

getLeadData(companyCode: string, user_right: string, username?: string): Observable<any> {
  const params: any = {
    company_code: companyCode,
    user_right: user_right
  };
  if ((user_right === 'data-entry' || user_right === 'manager') && username) {
    params.username = username;
  }
  return this._http.get(`http://localhost:3000/nodeapp/displayAlllead`, { params });
}


getLeadDatabystatistics(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displayAllleadby-statistics?company_code=${companyCode}`).pipe(
    map((response: any) => response.data), 
    catchError((error) => {
      console.error('Error fetching lead data:', error);
      throw error; 
    })
  );
}

getAllLead(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/getAlllead?company_code=${companyCode}`).pipe(
    map((response: any) => response.data),
    catchError((error) => {
      console.error('Error fetching lead data:', error);
      throw error;
    })
  );
}

getLeadCount(month: string, companyCode: string): Observable<number> {
  return this._http.get<number>(`http://localhost:3000/nodeapp/count?month=${month}&company_code=${companyCode}`);
}

getLeadDetails(month: string, companyCode: string): Observable<any> {
  return this._http.get<any>(`http://localhost:3000/nodeapp/lead-details?month=${month}&company_code=${companyCode}`);
}


getRenewalDataFromTable(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displayAlllead?company_code=${companyCode}`).pipe(
    map((response: any) => response.data),
    catchError((error) => {
      console.error('Error fetching lead data:', error);
      throw error;
    })
  );
}
  
gettrashlead(companyCode: string): Observable<any> {
    return this._http.get(`http://localhost:3000/nodeapp/displaytrashlead?company_code=${companyCode}`).pipe(
      map((response: any) => response.data),
      catchError((error) => {
        console.error('Error fetching lead data:', error);
        throw error;
      })
    );
}
  
deletelead(lead_id: string, username: string): Observable<any> {
    return this._http.delete(`http://localhost:3000/nodeapp/leaddelete/${lead_id}`, { params: { username } });
}
  
addleadupdate(formData:FormData):Observable<any>
  {
   return this._http.post(`http://localhost:3000/nodeapp/updatelead`,formData);
}

fetchAllData(lead_id:string):Observable<any>{
  return this._http.get(`http://localhost:3000/nodeapp/displayLead1/${lead_id}`);
}
  
fetchfollowup(lead_id:string):Observable<any>{
  return this._http.get(`http://localhost:3000/nodeapp/displayfollowup/${lead_id}`);
}

fetchfollowuphistry(lead_id:string):Observable<any>
{
  return this._http.get(`http://localhost:3000/nodeapp/allfollowup/${lead_id}`);
}

getfollowup(status_id:string):Observable<any>
{
  return this._http.get(`http://localhost:3000/nodeapp/followupbyedit/${status_id}`);
}

followupupdate(data: any, status_id: string): Observable<any> {
  return this._http.put(`http://localhost:3000/nodeapp/followupbyupdate/${status_id}`, data);
}

deletefollowup(status_id: string): Observable<any> 
{
  return this._http.delete(`http://localhost:3000/nodeapp/followupdelet/${status_id}`);
}
  
getNotifications(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/notifications?company_code=${companyCode}`);
}

getClientDetails(personname: string, companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/client/${personname}?company_code=${companyCode}`);
}

getClientexistingDetails(companyname: string, companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/exitingclient/${companyname}?company_code=${companyCode}`);
}

getClientexistingDetails1(personname: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/exitingclient1/${personname}`);
}

getProductsForCompany(companyname: string) {
  return this._http.get(`http://localhost:3000/nodeapp/leadproducts/${companyname}`);
}

checkLeadExistence(personname: string, companyCode: string): Observable<any> {
  return this._http.post<any>(`http://localhost:3000/nodeapp/check-lead`, { personname, company_code: companyCode });
}

sendEmail(email: string) {
  const emailData = {
  email: email, 
  };
  return this._http.post(`http://localhost:3000/nodeapp/reset-password`, emailData);
}

followupsendEmail(email: string) {
  return this._http.post('http://localhost:3000/nodeapp/send-email', { email });
}

getProducts(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displayproducts?company_code=${companyCode}`).pipe(
    map((response: any) => response.data),
    catchError((error) => {
    console.error('Error fetching lead data:', error);
    throw error;
    })
  );
}
  
getsource(companyCode: string): Observable<any[]> {
  return this._http.get<any>(`http://localhost:3000/nodeapp/displaysource?company_code=${companyCode}`).pipe(
  map((response: any) => response.data),
  catchError((error) => {
    console.error('Error fetching source data:', error);
    throw error;
  })
  );
}

getprofile(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displayprofile?company_code=${companyCode}`).pipe(
  map((response: any) => response.data),
  catchError((error) => {
    console.error('Error fetching lead data:', error);
    throw error;
  })
  );
}

getbusiness(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displaybussiness?company_code=${companyCode}`).pipe(
  map((response: any) => response.data), 
  catchError((error) => {
    console.error('Error fetching lead data:', error);
    throw error;
  })
  );
}

getstage(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displaystage?company_code=${companyCode}`).pipe(
  map((response: any) => response.data), 
  catchError((error) => {
    console.error('Error fetching lead data:', error);
    throw error;
    })
  );
}

getreminder(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displayreminder?company_code=${companyCode}`).pipe(
    map((response: any) => response.data),
    catchError((error) => {
    console.error('Error fetching lead data:', error);
      throw error;
    })
  );
}

restoreLead(lead_id: number): Observable<any> {
  return this._http.post(`http://localhost:3000/nodeapp/restorelead/${lead_id}`, null).pipe(
    catchError((error) => {
    console.error('Error restoring lead:', error);
      throw error; 
    })
  );
}
 
deletetrashlead(id: string): Observable<any>{
  return this._http.delete(`http://localhost:3000/nodeapp/trashleaddelet/${id}`);
}

getautomail(): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displayautoemail`).pipe(
  map((response: any) => response.data),
  catchError((error) => {
    console.error('Error fetching lead data:', error);
    throw error;
  })
  );
}

getLeads(): Observable<any> {
  return this._http.get('http://localhost:3000/nodeapp/indiamart-leads');
}

getCompanyLogoUrl(companyCode: string): Observable<Blob> {
  return this._http.get(`http://localhost:3000/nodeapp/companylogo?company_code=${companyCode}`, {
  responseType: 'blob'
  });
}

fetchData(sortBy: string, companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/data?sort_by=${sortBy}&company_code=${companyCode}`);
}

deleteItem(option: string, id: any) {
  const url = `http://localhost:3000/nodeapp/delete/${option}/${id}`;
  return this._http.delete<any>(url);
}

getcompanydetails(companyCode: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displaycompanydetails?company_code=${companyCode}`);
}

getAllcompanydetails(): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/Alldisplaycompanydetails`);
}

getUsersByCompanyCode(companyCode: string): Observable<any> {
  return this._http.get<any>(`http://localhost:3000/nodeapp/users?company_code=${companyCode}`);
}

getuser(user_id: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displayLead/${user_id}`);
}

getUserLogs(user_id: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/getUserLogs/${user_id}`);
}

userupdate(data: any, user_id: string): Observable<any> {
  return this._http.put(`http://localhost:3000/nodeapp/userupdate/${user_id}`, data);
}

companyupdate(data: any, company_code: string): Observable<any>{
  return this._http.put(`http://localhost:3000/nodeapp/companyupdate/${company_code}`, data);
}

userdelete(user_id: string): Observable<any>{
  return this._http.delete(`http://localhost:3000/nodeapp/userdelet/${user_id}`);
}

insertSource(sourceName: string, companyCode: string) {
  return this._http.post(`http://localhost:3000/nodeapp/insertSource`, { source_name: sourceName, company_code: companyCode });
}
  
insertStage(stageName: string, companyCode: string) {
  return this._http.post(`http://localhost:3000/nodeapp/insertStage`, { stage_name: stageName, company_code: companyCode });
}

insertprofile(profileName: string, companyCode: string) {
  return this._http.post(`http://localhost:3000/nodeapp/insertprofile`, { profile_name: profileName, company_code: companyCode });
}

insertproducts(productName: string, companyCode: string) {
  return this._http.post(`http://localhost:3000/nodeapp/insertproducts`, { product_name: productName, company_code: companyCode });
}

insertbussinesscategory(categoryName: string, companyCode: string) {
  return this._http.post(`http://localhost:3000/nodeapp/insertbussinesscategory`, { category_name: categoryName, company_code: companyCode });
}

getcompany(company_code: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/editcompany/${company_code}`);
}

updateItemColor(itemId: string, newColor: string) {
  console.log('Sending update request to backend for itemId:', itemId, 'with new color:', newColor);
  return this._http.put(`http://localhost:3000/nodeapp/updateColor/${itemId}`, { color: newColor });
}
  
updatePassword(user_id: string, password: string): Observable<any> {
  const body = { password };
  return this._http.put(`http://localhost:3000/nodeapp/update-password/${user_id}`, body);
}
  
updateLeadStatus(lead: any): Observable<any> {
  return this._http.put(`http://localhost:3000/nodeapp/update-active/${lead.company_code}`, lead);
}

// API call to check if the contact number exists in tb_lead
checkContactNumberExists(contactno: string): Observable<any> {
  return this._http.post('http://localhost:3000/nodeapp/check-contact', { contactno });
}
  

private apiUrl = 'http://localhost:3000/nodeapp/user-rights'; 

getUserRights(companyCode: string): Observable<any> {
  const params = new HttpParams().set('company_code', companyCode);
  return this._http.get<any>(this.apiUrl, { params });
}

checkContactNo(contactno: string): Observable<any> {
  return this._http.post(`http://localhost:3000/nodeapp/check-contactno`, { contactno });
}

submitSupportRegistration(data: any): Observable<any> {
  return this._http.post(`http://localhost:3000/nodeapp/submit-support-registration`, data);
}
  
supportlogin(contactno: string, password: string): Observable<LoginResponse> {
  const loginData = { contactno, password };
  return this._http.post<LoginResponse>('http://localhost:3000/nodeapp/supportlogin', loginData);
}
  
saveTicket(formData: FormData): Observable<any> {
  return this._http.post('http://localhost:3000/nodeapp/saveTicket', formData);
}
  
getAllticketdetails(): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/Alldisplayticketdetails`);
}

getAllticketissue(): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displayissuedetails`);
}

Endcustomer(formData: FormData): Observable<any> {
  return this._http.post('http://localhost:3000/nodeapp/save_endcustomer', formData);
}

getAllendcustomer(): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displayendcustomer`);
}

getTicketById(ticket_id: string): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/displaylead2/${ticket_id}`);
}

getNames(company_code: string, username: String) {
  return this._http.get(`http://localhost:3000/nodeapp/getvisitingcards?company_code=${company_code}&username=${username}`);
}

sendCardData(cardData: any): Observable<any> {
  return this._http.post(`http://localhost:3000/nodeapp/addCard`, cardData);
}

getCompanyCodealluser(companyCode: string) {
  return this._http.get(`http://localhost:3000/nodeapp/users?company_code=${companyCode}`);
}


submitAdmissionForm(formData: FormData): Observable<any> {
    return this._http.post(`http://localhost:3000/api/admission/submit`, formData);
  }


  getAdmissions(): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/admissions`);
}

getAdmissionById(id: number): Observable<any> {
  return this._http.get(`http://localhost:3000/nodeapp/admission/${id}`);
}

updateAdmission(id: number, formData: FormData): Observable<any> {
  return this._http.put(`http://localhost:3000/nodeapp/admission_update/${id}`, formData);
}

deleteAdmission(id: number): Observable<any> {
  return this._http.delete(`http://localhost:3000/nodeapp/admission/${id}`);
}

}

