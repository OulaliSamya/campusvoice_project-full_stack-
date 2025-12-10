import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email = '';
  password = '';

  error: string | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = null;
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (user: User) => {
        this.loading = false;

        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (user.role === 'TEACHER') {
          this.router.navigate(['/teacher']);
        } else {
          this.router.navigate(['/student']);
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Email ou mot de passe incorrect.';
      }
    });
  }
}
