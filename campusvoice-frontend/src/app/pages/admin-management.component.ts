// src/app/pages/admin-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Course } from '../models/course.model';

interface User {
  id?: number;
  fullName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  department?: string;
  classe?: string | null;
}

@Component({
  selector: 'app-admin-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>⚙️ Gestion administrateur</h2>

    <div class="tabs">
      <button [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">👥 Utilisateurs</button>
      <button [class.active]="activeTab === 'courses'" (click)="activeTab = 'courses'">📚 Cours</button>
    </div>

    <!-- Gestion des utilisateurs -->
    <div *ngIf="activeTab === 'users'" class="management-section">
      <section class="card">
        <h3>Ajouter un utilisateur</h3>
        <form (ngSubmit)="createUser()" #userForm="ngForm">
          <label>
            Nom complet
            <input [(ngModel)]="newUser.fullName" name="fullName" required />
          </label>
          <label>
            Email
            <input [(ngModel)]="newUser.email" name="email" type="email" required />
          </label>
          <label>
            Mot de passe
            <input [(ngModel)]="newUser.password" name="password" type="password" required />
          </label>
          <label>
            Rôle
            <select [(ngModel)]="newUser.role" name="role" required>
              <option value="STUDENT">Étudiant</option>
              <option value="TEACHER">Enseignant</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </label>
          <div *ngIf="newUser.role === 'STUDENT'">
            <label>
              Classe / Niveau
              <input [(ngModel)]="newUser.classe" name="classe" placeholder="Ex: L3 Informatique" required />
            </label>
          </div>
          <div *ngIf="newUser.role === 'TEACHER' || newUser.role === 'ADMIN'">
            <label>
              Département
              <input [(ngModel)]="newUser.department" name="department" required />
            </label>
          </div>
          <button type="submit">Créer l'utilisateur</button>
          <p *ngIf="userError" class="error">{{ userError }}</p>
          <p *ngIf="userSuccess" class="success">{{ userSuccess }}</p>
        </form>
      </section>

      <section class="card">
        <h3>Liste des utilisateurs ({{ users.length }})</h3>
        <div class="user-list">
          <div *ngFor="let user of users" class="user-item">
            <strong>{{ user.fullName }}</strong> ({{ user.email }}) — {{ user.role }}
            <button (click)="deleteUser(user.id)" class="delete-btn" *ngIf="user.id !== undefined">🗑️</button>
          </div>
        </div>
      </section>
    </div>

    <!-- Gestion des cours -->
    <div *ngIf="activeTab === 'courses'" class="management-section">
      <section class="card">
        <h3>Ajouter un cours</h3>
        <form (ngSubmit)="createCourse()" #courseForm="ngForm">
          <label>
            Code du cours
            <input [(ngModel)]="newCourse.code" name="code" required placeholder="Ex: INF-301" />
          </label>
          <label>
            Titre
            <input [(ngModel)]="newCourse.title" name="title" required placeholder="Ex: Web Dev" />
          </label>
          <label>
            Département
            <input [(ngModel)]="newCourse.department" name="department" required />
          </label>
          <label>
            Enseignant
            <select [(ngModel)]="newCourse.teacherId" name="teacherId" required>
              <option [ngValue]="null">-- Sélectionnez --</option>
              <option *ngFor="let t of teachers" [ngValue]="t.id">{{ t.fullName }}</option>
            </select>
          </label>
          <button type="submit">Créer le cours</button>
          <p *ngIf="courseError" class="error">{{ courseError }}</p>
          <p *ngIf="courseSuccess" class="success">{{ courseSuccess }}</p>
        </form>
      </section>

      <section class="card">
        <h3>Liste des cours ({{ courses.length }})</h3>
        <div class="course-list">
          <div *ngFor="let course of courses" class="course-item">
            <strong>{{ course.code }} — {{ course.title }}</strong>
            <br> Département : {{ course.department }}
            <br> Enseignant : {{ getTeacherName(course) }}

            <!-- ✅ Section gestion des classes -->
            <div class="class-management">
              <h5>Classes autorisées</h5>
              <div class="class-tags">
                <span *ngFor="let cls of course.allowedClasses || []" class="class-tag">
                  {{ cls }}
                  <button (click)="removeClassFromCourse(course.id!, cls)" class="remove-class-btn">×</button>
                </span>
              </div>
              <div class="add-class-form">
                <input #newClassInput 
                       type="text" 
                       placeholder="Ex: L3 Informatique" 
                       (keyup.enter)="addClassToCourse(course.id!, newClassInput.value); newClassInput.value=''"
                       class="class-input" />
                <button (click)="addClassToCourse(course.id!, newClassInput.value); newClassInput.value=''">
                  + Ajouter
                </button>
              </div>
            </div>

            <button (click)="deleteCourse(course.id!)" class="delete-btn">🗑️ Supprimer</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
    h2 {
      color: #2c3e50;
      margin-bottom: 24px;
      font-weight: 600;
    }

    .tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .tabs button {
      padding: 10px 20px;
      background: #ecf0f1;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      color: #2c3e50;
      transition: all 0.2s;
    }

    .tabs button.active {
      background: #3498db;
      color: white;
    }

    .tabs button:hover:not(.active) {
      background: #d5dbdb;
    }

    .management-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      color: #2c3e50;
    }

    h3, h5 {
      color: #3498db;
      margin: 0 0 16px;
      font-weight: 600;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-weight: 500;
      color: #2c3e50;
    }

    input, select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      color: #2c3e50;
      background: white;
    }

    button {
      padding: 10px 16px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      width: fit-content;
      transition: background 0.2s;
    }

    button:hover {
      background: #2980b9;
    }

    .delete-btn {
      background: #e74c3c;
      padding: 6px 12px;
      font-size: 0.9rem;
      color: white;
      margin-top: 12px;
    }

    .delete-btn:hover {
      background: #c0392b;
    }

    .user-list, .course-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .user-item, .course-item {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3498db;
      color: #2c3e50;
    }

    /* Gestion des classes */
    .class-management {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px dashed #ddd;
    }

    .class-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .class-tag {
      background: #e8f4fc;
      color: #3498db;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .remove-class-btn {
      background: #c0392b;
      color: white;
      border: none;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .add-class-form {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .class-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 0.95rem;
    }

    .error {
      color: #e74c3c;
      margin-top: 8px;
      font-weight: 500;
    }

    .success {
      color: #2ecc71;
      margin-top: 8px;
      font-weight: 500;
    }
    `
  ]
})
export class AdminManagementComponent implements OnInit {
  activeTab: 'users' | 'courses' = 'users';

  // Utilisateurs
  users: User[] = [];
  newUser: User = {
    fullName: '',
    email: '',
    password: '',
    role: 'STUDENT',
    classe: ''
  };
  userError: string | null = null;
  userSuccess: string | null = null;

  // Cours
  courses: Course[] = [];
  teachers: User[] = [];
  newCourse: Course = { code: '', title: '', department: '', teacherId: null };
  courseError: string | null = null;
  courseSuccess: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadCourses();
    this.loadTeachers();
  }

  // --- Utilisateurs ---
  loadUsers(): void {
    this.http.get<User[]>('http://localhost:8080/api/users').subscribe(users => {
      this.users = users.map(u => ({
        ...u,
        id: u.id ? Number(u.id) : undefined,
        classe: u.classe || ''
      }));
    });
  }

  createUser(): void {
    const payload = {
      ...this.newUser,
      classe: this.newUser.role === 'STUDENT' ? this.newUser.classe : null,
      department: this.newUser.role !== 'STUDENT' ? this.newUser.department : null
    };

    this.http.post<User>('http://localhost:8080/api/auth/register', payload).subscribe({
      next: (user) => {
        this.users.push({
          ...user,
          id: user.id ? Number(user.id) : undefined,
          classe: user.classe || ''
        });
        this.userSuccess = 'Utilisateur créé !';
        this.userError = null;
        this.newUser = {
          fullName: '',
          email: '',
          password: '',
          role: 'STUDENT',
          classe: ''
        };
      },
      error: (err) => {
        console.error('Erreur création utilisateur :', err);
        this.userError = 'Échec de la création.';
        this.userSuccess = null;
      }
    });
  }

  deleteUser(id: number | undefined): void {
    if (!id) return;
    if (confirm('Supprimer cet utilisateur ?')) {
      this.http.delete(`http://localhost:8080/api/users/${id}`).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
        },
        error: (err) => {
          console.error('Erreur suppression :', err);
          alert('Échec de la suppression.');
        }
      });
    }
  }

  // --- Cours ---
  loadCourses(): void {
    this.http.get<Course[]>('http://localhost:8080/api/courses').subscribe(courses => {
      this.courses = courses.map(c => ({
        ...c,
        id: c.id ? Number(c.id) : undefined,
        teacherId: c.teacherId || null,
        allowedClasses: [] // Initialisé vide
      }));
      // Charger les classes pour chaque cours
      this.courses.forEach(course => {
        if (course.id) {
          this.loadAllowedClasses(course.id, course);
        }
      });
    });
  }

  loadAllowedClasses(courseId: number, course: Course): void {
    this.http.get<string[]>(`http://localhost:8080/api/courses/${courseId}/classes`)
      .subscribe(classes => {
        course.allowedClasses = classes;
      }, error => {
        console.error('Erreur chargement classes pour cours', courseId, error);
        course.allowedClasses = [];
      });
  }

  loadTeachers(): void {
    this.http.get<User[]>('http://localhost:8080/api/users').subscribe(users => {
      this.teachers = users
        .filter(u => u.role === 'TEACHER')
        .map(u => ({
          ...u,
          id: u.id ? Number(u.id) : undefined
        }));
    });
  }

  createCourse(): void {
    if (this.newCourse.teacherId == null) return;
    this.http.post<Course>('http://localhost:8080/api/courses', this.newCourse).subscribe({
      next: (course) => {
        const newCourse = {
          ...course,
          id: course.id ? Number(course.id) : undefined,
          allowedClasses: []
        };
        this.courses.push(newCourse);
        this.courseSuccess = 'Cours créé !';
        this.courseError = null;
        this.newCourse = { code: '', title: '', department: '', teacherId: null };
      },
      error: (err) => {
        console.error('Erreur création cours :', err);
        this.courseError = 'Échec de la création.';
        this.courseSuccess = null;
      }
    });
  }

  deleteCourse(id: number): void {
    if (confirm('Supprimer ce cours ?')) {
      this.http.delete(`http://localhost:8080/api/courses/${id}`).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== id);
        },
        error: (err) => {
          console.error('Erreur suppression cours :', err);
          alert('Échec de la suppression du cours.');
        }
      });
    }
  }

  addClassToCourse(courseId: number, className: string): void {
    if (!className.trim()) return;
    this.http.post(
      `http://localhost:8080/api/courses/${courseId}/classes`,
      className.trim(),
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        // Recharger les classes pour ce cours
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
          this.loadAllowedClasses(courseId, course);
        }
      },
      error: (err) => {
        console.error('Erreur ajout classe :', err);
        alert('Échec de l\'ajout de la classe.');
      }
    });
  }

  removeClassFromCourse(courseId: number, className: string): void {
    if (confirm(`Retirer la classe "${className}" de ce cours ?`)) {
      this.http.delete(`http://localhost:8080/api/courses/${courseId}/classes/${className}`)
        .subscribe({
          next: () => {
            const course = this.courses.find(c => c.id === courseId);
            if (course && course.allowedClasses) {
              course.allowedClasses = course.allowedClasses.filter(c => c !== className);
            }
          },
          error: (err) => {
            console.error('Erreur suppression classe :', err);
            alert('Échec de la suppression de la classe.');
          }
        });
    }
  }

  // Remplace getTeacherName par :
  getTeacherName(course: Course): string {
    // ✅ Utilise teacherName du DTO, pas course.teacher
    return course.teacherName || 'Non attribué';
  }

}