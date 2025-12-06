import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-teacher-dashboard',
  imports: [CommonModule],
  template: `
    <h2>Espace Enseignant</h2>
    <p>Ici nous afficherons les feedbacks liés à vos cours.</p>
  `
})
export class TeacherDashboardComponent {}
