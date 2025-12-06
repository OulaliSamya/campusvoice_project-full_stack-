import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-student-dashboard',
  imports: [CommonModule],
  template: `
    <h2>Espace Étudiant</h2>
    <p>Bienvenue dans votre espace. Ici nous intégrerons :</p>
    <ul>
      <li>Formulaire d’envoi de feedback</li>
      <li>Historique de vos feedbacks</li>
    </ul>
  `
})
export class StudentDashboardComponent {}
