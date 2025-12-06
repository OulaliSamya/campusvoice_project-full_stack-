import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  template: `
    <h2>Espace Admin</h2>
    <p>Tableau de bord des feedbacks, gestion des utilisateurs, statistiques, etc.</p>
  `
})
export class AdminDashboardComponent {}
