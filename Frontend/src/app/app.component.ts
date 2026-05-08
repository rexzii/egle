import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, CanActivate  } from '@angular/router';
import { ApiserviceService } from './apiservice.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
title = 'LeadsManagementSystems';
  protectedData: any;

constructor(private Service:ApiserviceService,private router: Router, private route: ActivatedRoute){
  // this.router.events.subscribe(event => {
  //   if (event instanceof NavigationEnd) {
  //     sessionStorage.setItem('lastVisitedPage', event.urlAfterRedirects);
  //   }
  // });
}

ngOnInit() {
  // if (this.Service.isLoggedIn()) {
  //   const userData = this.Service.getUserData();
  //   if (userData && userData.user_id && userData.company_data) {
  //     const { user_id, username, user_right, company_data } = userData;
  //     const { company_code, company_name } = company_data;
  //     // ✅ Get last visited page from sessionStorage
  //     const lastVisited = sessionStorage.getItem('lastVisitedPage');
  //     if (!lastVisited || lastVisited === '/' || lastVisited === '/login') {
  //       this.router.navigate(['/dashboard', user_id], {
  //         queryParams: {
  //           fromLogin: 'true',
  //           username,
  //           company_code,
  //           company_name,
  //           user_right
  //         }
  //       });
  //     } else {
  //       // ✅ Redirect to last visited page
  //       this.router.navigateByUrl(lastVisited);
  //     }
  //   }
  // }
}






// getProtectedContent() {
//   this.Service.getProtectedData().subscribe(
//     (response) => {
//       this.protectedData = response;
//       console.log('Protected Route Response:', this.protectedData);
//     },
//     (error) => {
//       console.error('Error fetching protected data:', error);
//       alert('You are not authorized to access this resource.');
//     }
//   );
// }

}
