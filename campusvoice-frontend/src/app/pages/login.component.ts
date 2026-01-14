// src/app/pages/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.loginError = null;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        const user = this.authService.getCurrentUser();
        if (user?.role === 'STUDENT') {
          this.router.navigate(['/student']);
        } else if (user?.role === 'TEACHER') {
          this.router.navigate(['/teacher']);
        } else if (user?.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: err => {
        this.isLoading = false;
        this.loginError = 'Email ou mot de passe incorrect.';
      }
    });
  }
}