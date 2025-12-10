import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest, User, UserRole } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  fullName = '';
  email = '';
  password = '';
  department = '';
  studentId: string | null = null;
  role: UserRole = 'STUDENT';

  error: string | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {

    const payload: RegisterRequest = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      department: this.department,
      studentId: this.role === 'STUDENT' ? this.studentId : null,
      role: this.role
    };

    this.error = null;
    this.loading = true;

    this.authService.register(payload).subscribe({
      next: (user: User) => {
        this.loading = false;
        console.log('Inscription OK', user);
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading = false;
        this.error = "Erreur lors de l'inscription (email déjà utilisé ?).";
      }
    });
  }
}
