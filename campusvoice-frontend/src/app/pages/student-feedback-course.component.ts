// src/app/pages/student-feedback-course.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { Course } from '../models/course.model';
import { CourseService } from '../services/course.service';
import { FeedbackService, CreateFeedbackRequest } from '../services/feedback.service';
import { FeedbackCategory } from '../models/feedback.model';

@Component({
  selector: 'app-student-feedback-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="feedback-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Feedback <span class="highlight">Cours & Enseignant</span></h1>
          <p class="subtitle">Partagez votre avis sur un cours ou un enseignant</p>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="form-card">
        <form (ngSubmit)="sendFeedback()">
          <!-- Sélection du cours -->
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Sélectionnez un cours *
            </label>
            <select
              [(ngModel)]="selectedCourseId"
              name="selectedCourseId"
              class="form-select"
              required>
              <option [ngValue]="null" disabled>-- Choisissez un cours --</option>
              <option *ngFor="let course of courses" [ngValue]="course.id">
                {{ course.code }} — {{ course.title }}
                <span *ngIf="course.teacherName"> ({{ course.teacherName }})</span>
              </option>
            </select>
          </div>

          <!-- Contenu du feedback -->
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Votre feedback *
            </label>
            <textarea
              [(ngModel)]="feedbackContent"
              name="feedbackContent"
              class="form-textarea"
              rows="6"
              placeholder="Partagez votre expérience... (minimum 10 caractères)"
              required
            ></textarea>
            <div class="char-count" [class.valid]="feedbackContent.length >= 10">
              {{ feedbackContent.length }} / 10 caractères minimum
            </div>
          </div>

          <!-- Mode anonyme -->
          <div class="checkbox-card">
            <input
              type="checkbox"
              id="anonymous"
              [(ngModel)]="isAnonymous"
              name="isAnonymous"
              class="form-checkbox"
            />
            <label for="anonymous" class="checkbox-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <div>
                <strong>Envoyer en mode anonyme</strong>
                <p>Votre identité ne sera pas visible</p>
              </div>
            </label>
          </div>

          <!-- Messages -->
          <div *ngIf="errorMessage" class="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="alert alert-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {{ successMessage }}
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" (click)="resetForm()" class="btn-secondary" [disabled]="isSending">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              Réinitialiser
            </button>
            <button type="submit" class="btn-primary" [disabled]="isSending || !selectedCourseId || feedbackContent.length < 10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              {{ isSending ? 'Envoi en cours...' : 'Envoyer le feedback' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Conseils -->
      <div class="tips-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Conseils pour un feedback constructif
        </h3>
        <ul>
          <li>Soyez précis et détaillé dans vos commentaires</li>
          <li>Mentionnez les points positifs et les axes d'amélioration</li>
          <li>Restez respectueux et professionnel</li>
          <li>Évitez les propos offensants ou diffamatoires</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .feedback-page {
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;

      h1 {
        font-size: 2.5rem;
        font-weight: 800;
        color: #1e293b;
        margin: 0 0 8px;

        @media (max-width: 768px) {
          font-size: 2rem;
        }

        .highlight {
          background: linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }

      .subtitle {
        color: #64748b;
        font-size: 1.1rem;
        margin: 0;
      }
    }

    .form-card {
      background: white;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
      font-size: 1rem;

      svg {
        width: 20px;
        height: 20px;
        color: #6366f1;
      }
    }

    .form-select,
    .form-textarea {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      }
    }

    .form-select {
      cursor: pointer;
      background: white;
    }

    .form-textarea {
      resize: vertical;
      min-height: 150px;
    }

    .char-count {
      text-align: right;
      font-size: 0.85rem;
      color: #94a3b8;
      margin-top: 4px;

      &.valid {
        color: #10b981;
        font-weight: 600;
      }
    }

    .checkbox-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      display: flex;
      align-items: start;
      gap: 12px;
      transition: all 0.3s ease;

      &:has(.form-checkbox:checked) {
        background: rgba(99, 102, 241, 0.05);
        border-color: #6366f1;
      }

      .form-checkbox {
        width: 20px;
        height: 20px;
        margin-top: 2px;
        cursor: pointer;
        flex-shrink: 0;
      }

      .checkbox-label {
        flex: 1;
        display: flex;
        gap: 12px;
        cursor: pointer;
        margin: 0;

        svg {
          width: 24px;
          height: 24px;
          color: #6366f1;
          flex-shrink: 0;
          margin-top: 2px;
        }

        strong {
          display: block;
          color: #1e293b;
          margin-bottom: 4px;
        }

        p {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0;
        }
      }
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 24px;
      font-weight: 500;

      svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      &.alert-error {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border: 1px solid rgba(239, 68, 68, 0.3);

        svg {
          color: #dc2626;
        }
      }

      &.alert-success {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.3);

        svg {
          color: #059669;
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;

      @media (max-width: 768px) {
        flex-direction: column-reverse;
      }
    }

    .btn-primary,
    .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;

      svg {
        width: 18px;
        height: 18px;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.5);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.6);
      }
    }

    .btn-secondary {
      background: white;
      color: #475569;
      border: 2px solid #e2e8f0;

      &:hover:not(:disabled) {
        border-color: #6366f1;
        color: #6366f1;
        transform: translateY(-2px);
      }
    }

    .tips-card {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(14, 165, 233, 0.05) 100%);
      border: 2px solid rgba(99, 102, 241, 0.2);
      border-radius: 16px;
      padding: 24px;

      h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.2rem;
        color: #1e293b;
        margin: 0 0 16px;

        svg {
          width: 24px;
          height: 24px;
          color: #6366f1;
        }
      }

      ul {
        margin: 0;
        padding-left: 24px;
        color: #475569;

        li {
          margin-bottom: 8px;
          line-height: 1.6;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  `]
})
export class StudentFeedbackCourseComponent implements OnInit {
  user: User | null = null;
  courses: Course[] = [];
  
  selectedCourseId: number | null = null;
  feedbackContent = '';
  isAnonymous = true;
  
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSending = false;

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadCourses();
  }

  loadCourses(): void {
    this.courseService.getAll().subscribe({
      next: (list: Course[]) => {
        if (this.user?.classe) {
          const userClassNormalized = this.user.classe.trim().toLowerCase();
          this.courses = list.filter(course =>
            course.allowedClasses?.some(cls =>
              cls?.trim().toLowerCase() === userClassNormalized
            )
          );
        } else {
          this.courses = list;
        }
      },
      error: err => console.error('Erreur chargement cours', err)
    });
  }

  sendFeedback(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.selectedCourseId) {
      this.errorMessage = 'Veuillez sélectionner un cours.';
      return;
    }

    const trimmed = this.feedbackContent.trim();
    if (trimmed.length < 10) {
      this.errorMessage = 'Le feedback doit contenir au moins 10 caractères.';
      return;
    }

    const payload: CreateFeedbackRequest = {
      content: trimmed,
      category: 'COURSE' as FeedbackCategory,
      anonymous: this.isAnonymous,
      studentId: this.isAnonymous ? null : this.user?.id ?? null,
      courseId: this.selectedCourseId
    };

    this.isSending = true;

    this.feedbackService.create(payload).subscribe({
      next: () => {
        this.isSending = false;
        this.successMessage = 'Feedback envoyé avec succès !';
        setTimeout(() => this.resetForm(), 2000);
      },
      error: err => {
        this.isSending = false;
        
        if (typeof err.error === 'string' && err.error.includes('inapproprié')) {
          this.errorMessage = 'Veuillez utiliser un langage respectueux.';
        } else if (err.status === 400) {
          this.errorMessage = 'Contenu non autorisé. Veuillez reformuler votre feedback.';
        } else {
          this.errorMessage = 'Erreur lors de l\'envoi du feedback.';
        }
      }
    });
  }

  resetForm(): void {
    this.feedbackContent = '';
    this.selectedCourseId = null;
    this.isAnonymous = true;
    this.errorMessage = null;
    this.successMessage = null;
  }
}