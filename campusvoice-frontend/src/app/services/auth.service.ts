// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string | null;
  classe?: string;
}

// ✅ AJOUTE CETTE INTERFACE
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  department?: string;
  studentId?: string | null;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = 'http://localhost:8080/api/auth';
  private userApiUrl = 'http://localhost:8080/api/users/me';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
  // ✅ Ne PAS charger l'utilisateur ici
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUserSubject.next(JSON.parse(userJson) as User);
    }
    // ⚠️ Pas de appel à loadUserFromBackend() ici
  }
  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, data);
  }
  login(email: string, password: string): Observable<User> {
    return this.http.post<{ token: string; email: string }>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap(res => localStorage.setItem('token', res.token)),
      switchMap(() => this.loadUserFromBackend())
    );
  }

  private loadUserFromBackend(): Observable<User> {
    return this.http.get<User>(this.userApiUrl).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  initializeAuth(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (token && userJson) {
      this.currentUserSubject.next(JSON.parse(userJson) as User);
    } else if (token) {
      // ✅ Charge l'utilisateur seulement si nécessaire
      this.loadUserFromBackend().subscribe({
        error: () => this.logout() // Token invalide → déconnexion
      });
    }
  }
}