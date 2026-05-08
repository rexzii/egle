import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApiserviceService } from './apiservice.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private service: ApiserviceService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.service.isLoggedIn();
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }
  
    // ✅ Ensure correct navigation on refresh
    const userId = localStorage.getItem('user_id'); 
    if (!userId) {
      this.router.navigate(['/login']); // Agar localStorage me user nahi mila to login bhejo
      return false;
    }
    
    return true;
  }
  
}
