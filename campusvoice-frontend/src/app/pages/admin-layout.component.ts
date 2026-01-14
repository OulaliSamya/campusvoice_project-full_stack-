// src/app/pages/admin-layout.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  isSidebarOpen = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Définir l'état initial selon la taille de l'écran
    this.checkScreenSize();
  }

  // Écouter les changements de taille d'écran
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    // Fermer la sidebar par défaut sur mobile/tablette
    if (window.innerWidth <= 1024) {
      this.isSidebarOpen = false;
    } else {
      // Ouvrir la sidebar par défaut sur desktop
      this.isSidebarOpen = true;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    // Ferme seulement sur mobile/tablette
    if (window.innerWidth <= 1024) {
      this.isSidebarOpen = false;
    }
  }

  onNavClick() {
    // Ferme la sidebar après navigation sur mobile
    if (window.innerWidth <= 1024) {
      this.isSidebarOpen = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}