// src/app/pages/teacher-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService, User } from '../services/auth.service';
import { Course } from '../models/course.model';
import { Feedback } from '../models/feedback.model';
import { Document } from '../models/document.model';
import { Observable } from 'rxjs';

// 🔹 Interface Course étendue
interface CourseWithDocuments extends Course {
  documents?: Document[];
}

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Espace Enseignant : {{ user?.fullName }}</h2>

    <!-- Section : Mes cours -->
    <section class="card">
      <h3>Mes cours</h3>
      <p *ngIf="loadingCourses">Chargement de vos cours...</p>
      <p *ngIf="!loadingCourses && myCourses.length === 0">
        Aucun cours ne vous est attribué.
      </p>

      <div *ngIf="!loadingCourses && myCourses.length > 0" class="course-list">
        <div class="course-item" *ngFor="let course of myCourses">
          <h4>{{ course.code }} — {{ course.title }}</h4>
          <p><strong>Département :</strong> {{ course.department }}</p>

          <!-- Bouton d'upload -->
          <button (click)="openUploadModal(course)" class="upload-btn">
            ➕ Ajouter un support
          </button>

          <!-- Liste des documents -->
          <div *ngIf="course.documents && course.documents.length > 0" class="document-list">
            <h5>📚 Documents disponibles</h5>
            <div class="document-item" *ngFor="let doc of course.documents">
              <!-- ✅ Nouveau lien vers l'endpoint sécurisé -->
              <a 
                [href]="'http://localhost:8080/api/documents/download/' + doc.fileName" 
                target="_blank">
                {{ doc.title }}
              </a>
              <small>{{ doc.uploadDate | date: 'short' }}</small>
              <!-- ✅ Bouton de suppression -->
              <button 
                (click)="deleteDocument(doc)" 
                class="remove-doc-btn">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal d'upload -->
    <div *ngIf="showUploadForm" class="upload-modal">
      <div class="modal-content">
        <h4>Ajouter un document à {{ selectedCourse?.title }}</h4>
        <form (ngSubmit)="uploadDocumentToCourse()" #form="ngForm">
          <label>
            Titre du document
            <input
              [(ngModel)]="docTitle"
              name="docTitle"
              required
              placeholder="Ex: Support TP1"
            />
          </label>

          <label>
            Fichier (PDF, DOC, PPT, etc.)
            <input type="file" (change)="onFileSelected($event)" required />
          </label>

          <div class="modal-buttons">
            <button type="submit" [disabled]="uploading">
              {{ uploading ? 'Envoi...' : 'Uploader' }}
            </button>
            <button type="button" (click)="closeUploadForm()">Annuler</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Section : Feedbacks reçus -->
    <section class="card">
      <h3>📬 Feedbacks reçus ({{ recentFeedbacks.length }})</h3>
      <p *ngIf="loadingFeedbacks">Chargement des feedbacks...</p>
      <p *ngIf="!loadingFeedbacks && recentFeedbacks.length === 0">
        Aucun feedback pour le moment.
      </p>
      <div *ngIf="!loadingFeedbacks && recentFeedbacks.length > 0" class="feedback-list">
        <div class="feedback-item" *ngFor="let fb of recentFeedbacks">
          <div class="feedback-header">
            <span class="badge">{{ fb.category }}</span>
            <span class="date">{{ fb.createdAt | date: 'short' }}</span>
            <!-- ✅ Bouton de suppression pour enseignant -->
            <button 
            type="button" 
            class="delete-btn"
            (click)="deleteFeedback(fb.id!)">
            🗑️
          </button>
          </div>
          <p>"{{ fb.content }}"</p>
          <small class="meta">
            Cours : {{ fb.course?.title || 'Non précisé' }}
            <span *ngIf="fb.anonymous"> • Anonyme</span>
          </small>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border: 1px solid #e1e5eb;
    }
    h2 {
      color: #2c3e50;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f2f5;
    }
    h3, h4, h5 {
      color: #3498db;
      margin: 16px 0 12px;
    }
    .course-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .course-item {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }
    .upload-btn {
      margin-top: 12px;
      padding: 6px 12px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .upload-btn:hover {
      background: #2980b9;
    }

    /* Modal */
    .upload-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 24px;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
    }
    .modal-buttons {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    .modal-buttons button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .modal-buttons button[type="submit"] {
      background: #2ecc71;
      color: white;
    }
    .modal-buttons button[type="button"] {
      background: #e74c3c;
      color: white;
    }

    /* Documents */
    .document-list {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px dashed #ddd;
    }
    .document-item a {
      color: #3498db;
      text-decoration: none;
      font-weight: 500;
    }
    .document-item a:hover {
      text-decoration: underline;
    }
    .document-item small {
      color: #6c757d;
      font-size: 0.9rem;
    }

    /* Feedbacks */
    .feedback-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .feedback-item {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3498db;
      position: relative;
    }
    .feedback-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      align-items: center;
    }
    .badge {
      background: #e8f4fc;
      color: #3498db;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .date {
      color: #6c757d;
      font-size: 0.9rem;
    }
    .meta {
      display: block;
      margin-top: 8px;
      color: #6c757d;
      font-size: 0.9rem;
    }

    /* Formulaire */
    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 12px 0;
      font-weight: 500;
    }
    input[type="text"], input[type="file"] {
      padding: 10px 12px;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 1rem;
    }
    
    /* Boutons de suppression */
    .remove-doc-btn, .delete-btn {
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
    }

    .remove-doc-btn:hover, .delete-btn:hover {
      background: #c0392b;
    }
    
    .delete-btn {
      width: auto;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 14px;
    }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  user: User | null = null;

  myCourses: CourseWithDocuments[] = [];
  loadingCourses = true;

  recentFeedbacks: Feedback[] = [];
  loadingFeedbacks = true;

  // Upload
  showUploadForm = false;
  selectedCourse: CourseWithDocuments | null = null;
  selectedFile: File | null = null;
  docTitle = '';
  uploading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCourses();
    this.loadFeedbacks();
  }

  // --- Cours ---
  loadCourses(): void {
    this.loadingCourses = true;
    this.http.get<CourseWithDocuments[]>('http://localhost:8080/api/courses').subscribe({
      next: (courses) => {
        this.myCourses = courses.filter(c => c.teacherId === this.user?.id);
        // Charger les documents pour chaque cours
        this.myCourses.forEach(course => {
          this.loadDocumentsForCourse(course);
        });
        this.loadingCourses = false;
      },
      error: () => this.loadingCourses = false
    });
  }

  loadDocumentsForCourse(course: CourseWithDocuments): void {
    this.http.get<Document[]>(`http://localhost:8080/api/documents?courseId=${course.id}`).subscribe({
      next: (docs) => {
        course.documents = docs;
      },
      error: () => {
        course.documents = [];
      }
    });
  }

  deleteDocument(doc: Document): void {
    if (!confirm(`Supprimer le document "${doc.title}" ?`)) return;

    this.http.delete(`http://localhost:8080/api/documents/${doc.id}`).subscribe({
      next: () => {
        // Retirer le document de la liste
        const course = this.myCourses.find(c => c.id === doc.courseId);
        if (course && course.documents) {
          course.documents = course.documents.filter(d => d.id !== doc.id);
        }
      },
      error: err => {
        console.error('Erreur suppression document', err);
        alert('Échec de la suppression.');
      }
    });
  }

  checkIfDocumentExists(fileName: string): Observable<boolean> {
    return this.http.get<boolean>(`http://localhost:8080/api/documents/exists/${fileName}`);
  }

  // --- Upload ---
  openUploadModal(course: CourseWithDocuments): void {
    this.selectedCourse = course;
    this.showUploadForm = true;
    this.selectedFile = null;
    this.docTitle = '';
  }

  closeUploadForm(): void {
    this.showUploadForm = false;
    this.selectedCourse = null;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadDocumentToCourse(): void {
    if (!this.selectedFile || !this.docTitle.trim() || !this.selectedCourse) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.docTitle.trim());
    if (this.selectedCourse.id != null) {
      formData.append('courseId', this.selectedCourse.id.toString());
    } else {
      console.error('Course ID is undefined');
      return;
    }

    this.uploading = true;
    this.http.post<Document>('http://localhost:8080/api/documents', formData).subscribe({
      next: (doc) => {
        // Ajouter le document à la liste du cours
        if (!this.selectedCourse!.documents) {
          this.selectedCourse!.documents = [];
        }
        this.selectedCourse!.documents.push(doc);
        this.closeUploadForm();
        this.docTitle = '';
        this.selectedFile = null;
        this.uploading = false;
      },
      error: (err) => {
        console.error(err);
        this.uploading = false;
      }
    });
  }

  // --- Feedbacks ---
  loadFeedbacks(): void {
    this.loadingFeedbacks = true;
    this.http.get<Feedback[]>('http://localhost:8080/api/feedbacks').subscribe({
      next: (feedbacks) => {
        const courseIds = this.myCourses.map(c => c.id);
        this.recentFeedbacks = feedbacks
          .filter(fb => fb.course && courseIds.includes(fb.course.id))
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 20);
        this.loadingFeedbacks = false;
      },
      error: () => this.loadingFeedbacks = false
    });
  }

  // ✅ Méthode de suppression de feedback
  deleteFeedback(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce feedback ?')) {
      return;
    }

    this.http.delete<void>(`http://localhost:8080/api/feedbacks/${id}`).subscribe({
      next: () => {
        // Mettre à jour la liste
        this.recentFeedbacks = this.recentFeedbacks.filter(fb => fb.id !== id);
      },
      error: err => {
        console.error('Erreur lors de la suppression', err);
        alert('Impossible de supprimer ce feedback.');
      }
    });
  }
}