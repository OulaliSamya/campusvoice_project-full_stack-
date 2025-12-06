import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email = '';
  password = '';
  error: string | null = null;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = null;
    this.loading = true;

    console.log('👉 Tentative login', this.email);

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loading = false;
        console.log('✅ Login OK', user);

        if (user.role === 'STUDENT') {
          this.router.navigate(['/student']);
        } else if (user.role === 'TEACHER') {
          this.router.navigate(['/teacher']);
        } else {
          this.router.navigate(['/admin']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Login error', err);
        this.error = 'Email ou mot de passe incorrect, ou serveur indisponible.';
      }
    });
  }
}
