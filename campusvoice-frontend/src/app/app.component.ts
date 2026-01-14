// src/app/app.component.ts
import { Component, OnInit } from '@angular/core'; // ✅ Ajoute OnInit
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit { // ✅ Implémente OnInit

  title = 'CampusVoice';
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // ✅ S'abonner au flux d'utilisateur connecté
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // ✅ Initialiser l'authentification
    this.authService.initializeAuth();
  }

  getHomeRoute(): string {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return '/';
    }
    switch (user.role) {
      case 'STUDENT':
        return '/student';
      case 'TEACHER':
        return '/teacher';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}