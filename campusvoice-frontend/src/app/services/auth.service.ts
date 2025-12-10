import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string | null;
}

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

  private apiUrl = 'http://localhost:8080/api/auth';

  private currentUserSubject: BehaviorSubject<User | null>;
  currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    // 🔹 Initialiser à partir de localStorage
    const userJson = localStorage.getItem('currentUser');
    const user = userJson ? JSON.parse(userJson) as User : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(user => {
        // 🔹 stocker dans le BehaviorSubject
        this.currentUserSubject.next(user);
        // 🔹 stocker dans localStorage (persistance entre refresh)
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  register(data: RegisterRequest): Observable<User> {
    // ici on peut juste renvoyer la réponse;
    // on ne connecte pas automatiquement après inscription (à toi de voir)
    return this.http.post<User>(`${this.apiUrl}/register`, data);
  }

  // 🔹 utilisée par tes composants (student-space, admin, etc.)
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // 🔹 si tu veux forcer la relecture depuis localStorage quelque part
  reloadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    const user = userJson ? JSON.parse(userJson) as User : null;
    this.currentUserSubject.next(user);
  }

  logout(): void {
    // vider localStorage + BehaviorSubject
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
