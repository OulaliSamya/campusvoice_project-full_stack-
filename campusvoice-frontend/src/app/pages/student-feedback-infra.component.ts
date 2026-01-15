// src/app/pages/student-feedback-infra.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { FeedbackService, CreateFeedbackRequest } from '../services/feedback.service';
import { FeedbackCategory } from '../models/feedback.model';

@Component({
  selector: 'app-student-feedback-infra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="feedback-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Feedback <span class="highlight">Infrastructure</span></h1>
          <p class="subtitle">Signalez un problème ou suggérez une amélioration</p>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="form-card">
        <form (ngSubmit)="sendFeedback()">
          <div class="form-row">
            <!-- Département -->
            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                Département / Zone
              </label>
              <select
                [(ngModel)]="department"
                name="department"
                class="form-select">
                <option *ngFor="let dept of departments" [value]="dept">
                  {{ dept }}
                </option>
              </select>
            </div>

            <!-- Type d'infrastructure -->
            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                Type d'infrastructure
              </label>
              <select
                [(ngModel)]="infraType"
                name="infraType"
                class="form-select">
                <option *ngFor="let type of infraTypes" [value]="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </div>

          <!-- Contenu du feedback -->
          <div class="form-group">
            <label class="form-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Décrivez le problème ou la suggestion *
            </label>
            <textarea
              [(ngModel)]="feedbackContent"
              name="feedbackContent"
              class="form-textarea"
              rows="6"
              placeholder="Exemple: La salle de TP 3 n'a pas de Wi-Fi fonctionnel... (minimum 10 caractères)"
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
            <button type="submit" class="btn-primary" [disabled]="isSending || feedbackContent.length < 10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              {{ isSending ? 'Envoi en cours...' : 'Envoyer le feedback' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Catégories de problèmes fréquents -->
      <div class="categories-grid">
        <div class="category-card" *ngFor="let cat of problemCategories">
          <div class="category-icon" [style.background]="cat.color">
            {{ cat.emoji }}
          </div>
          <h4>{{ cat.title }}</h4>
          <p>{{ cat.description }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feedback-page {
      max-width: 1000px;
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
      margin-bottom: 32px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      margin-bottom: 24px;

      .form-row & {
        margin-bottom: 0;
      }
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

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .category-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      text-align: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      }

      .category-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        margin: 0 auto 16px;
      }

      h4 {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 8px;
      }

      p {
        color: #64748b;
        font-size: 0.9rem;
        margin: 0;
        line-height: 1.5;
      }
    }
  `]
})
export class StudentFeedbackInfraComponent implements OnInit {
  user: User | null = null;
  
  department = 'Informatique';
  infraType = 'Salle de cours';
  feedbackContent = '';
  isAnonymous = true;
  
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSending = false;

  departments: string[] = [
    'Informatique',
    'Mathématiques',
    'Physique',
    'Administration',
    'Bibliothèque',
    'Autre'
  ];

  infraTypes: string[] = [
    'Salle de cours',
    'Salle de TP',
    'Wi-Fi',
    'Électricité',
    'Sécurité',
    'Propreté',
    'Matériel',
    'Autre'
  ];

  problemCategories = [
    {
      emoji: '💻',
      title: 'Matériel informatique',
      description: 'Ordinateurs, projecteurs, imprimantes',
      color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    },
    {
      emoji: '📶',
      title: 'Connexion réseau',
      description: 'Wi-Fi, accès internet, serveurs',
      color: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
    },
    {
      emoji: '🔌',
      title: 'Électricité',
      description: 'Prises, éclairage, climatisation',
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      emoji: '🧹',
      title: 'Propreté',
      description: 'Entretien des salles et espaces',
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    }
  ];

  constructor(
    private authService: AuthService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  sendFeedback(): void {
    this.errorMessage = null;
    this.successMessage = null;

    const trimmed = this.feedbackContent.trim();
    if (trimmed.length < 10) {
      this.errorMessage = 'Le feedback doit contenir au moins 10 caractères.';
      return;
    }

    const fullContent = `[${this.department} - ${this.infraType}] ${trimmed}`;

    const payload: CreateFeedbackRequest = {
      content: fullContent,
      category: 'INFRA' as FeedbackCategory,
      anonymous: this.isAnonymous,
      studentId: this.isAnonymous ? null : this.user?.id ?? null,
      courseId: null
    };

    this.isSending = true;

    this.feedbackService.create(payload).subscribe({
      next: () => {
        this.isSending = false;
        this.successMessage = 'Feedback infrastructure envoyé avec succès !';
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
    this.department = 'Informatique';
    this.infraType = 'Salle de cours';
    this.isAnonymous = true;
    this.errorMessage = null;
    this.successMessage = null;
  }
}