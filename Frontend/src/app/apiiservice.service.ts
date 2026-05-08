import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiiserviceService {

  constructor(private http: HttpClient) { }


Backendapi(formdata:any){
  return this.http.post('http://localhost:30000/insertdata', formdata);
}

}
