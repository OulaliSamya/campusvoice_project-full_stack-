import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  fullName = '';
  email = '';
  password = '';
  department = '';
  studentId = '';
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' = 'STUDENT';

  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = null;

    const data: RegisterRequest = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      department: this.department,
      studentId: this.role === 'STUDENT' ? this.studentId : null,
      role: this.role
    };

    console.log('👉 Envoi register', data);

    this.authService.register(data).subscribe({
      next: (user) => {
        console.log('✅ Register OK', user);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('❌ Register error', err);
        this.error = "Erreur lors de la création du compte (email déjà utilisé ?)";
      }
    });
  }
}
