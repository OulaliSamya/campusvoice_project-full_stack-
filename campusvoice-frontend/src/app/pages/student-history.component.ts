// src/app/pages/student-history.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { Feedback } from '../models/feedback.model';
import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-student-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="history-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Historique des <span class="highlight">Feedbacks</span></h1>
          <p class="subtitle">Consultez et gérez vos feedbacks envoyés</p>
        </div>
        <div class="header-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{{ feedbackList.length }} feedbacks</span>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="feedbackList.length === 0 && !isLoading" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <h3>Aucun feedback envoyé</h3>
        <p>Vous n'avez pas encore partagé de feedback</p>
        <a routerLink="/student/feedback-course" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Créer un feedback
        </a>
      </div>

      <!-- Feedbacks list -->
      <div *ngIf="feedbackList.length > 0" class="feedback-list">
        <div *ngFor="let fb of feedbackList" class="feedback-card" 
             [class.course]="fb.category === 'COURSE'" 
             [class.infra]="fb.category === 'INFRA'">
          
          <!-- Mode édition -->
          <div *ngIf="editingFeedbackId === fb.id" class="edit-mode">
            <textarea
              [(ngModel)]="editingContent"
              class="edit-textarea"
              rows="4"
              placeholder="Modifiez votre feedback"></textarea>
            <div class="edit-actions">
              <button type="button" (click)="cancelEditing()" class="btn-cancel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Annuler
              </button>
              <button type="button" (click)="saveEdit(fb.id!)" class="btn-save">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Enregistrer
              </button>
            </div>
          </div>

          <!-- Mode lecture -->
          <div *ngIf="editingFeedbackId !== fb.id">
            <div class="feedback-header">
              <div class="header-left">
                <span class="category-badge" [attr.data-category]="fb.category">
                  {{ getCategoryLabel(fb.category) }}
                </span>
                <span class="anonymous-badge" *ngIf="fb.anonymous">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Anonyme
                </span>
              </div>
              <div class="header-actions">
                <button type="button" (click)="startEditing(fb)" class="action-btn edit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button type="button" (click)="deleteFeedback(fb.id!)" class="action-btn delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>

            <p class="feedback-content">{{ fb.content }}</p>

            <div class="feedback-footer">
              <div class="feedback-meta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{{ fb.createdAt | date:'dd/MM/yyyy à HH:mm' }}</span>
                <span *ngIf="fb.updatedAt" class="updated">
                  (modifié le {{ fb.updatedAt | date:'dd/MM/yyyy' }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-page {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;

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

    .header-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      font-weight: 600;
      color: #475569;

      svg {
        width: 20px;
        height: 20px;
        color: #6366f1;
      }
    }

    .empty-state {
      background: white;
      border-radius: 20px;
      padding: 80px 40px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      svg {
        width: 80px;
        height: 80px;
        color: #cbd5e1;
        margin-bottom: 24px;
      }

      h3 {
        font-size: 1.8rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 12px;
      }

      p {
        color: #64748b;
        font-size: 1.1rem;
        margin: 0 0 32px;
      }

      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 28px;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: white;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.5);
        transition: all 0.3s ease;

        svg {
          width: 20px;
          height: 20px;
          color: white;
        }

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.6);
        }
      }
    }

    .feedback-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .feedback-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-left: 4px solid;
      transition: all 0.3s ease;

      &.course {
        border-left-color: #6366f1;
      }

      &.infra {
        border-left-color: #0ea5e9;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      }
    }

    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 16px;
      flex-wrap: wrap;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .category-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid;

      &[data-category="COURSE"] {
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
        border-color: rgba(99, 102, 241, 0.3);
      }

      &[data-category="INFRA"] {
        background: rgba(14, 165, 233, 0.1);
        color: #0ea5e9;
        border-color: rgba(14, 165, 233, 0.3);
      }
    }

    .anonymous-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(100, 116, 139, 0.1);
      color: #64748b;
      border: 1px solid rgba(100, 116, 139, 0.2);
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;

      svg {
        width: 14px;
        height: 14px;
      }
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      svg {
        width: 18px;
        height: 18px;
      }

      &.edit {
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;

        &:hover {
          background: rgba(99, 102, 241, 0.2);
          transform: scale(1.1);
        }
      }

      &.delete {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;

        &:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.1);
        }
      }
    }

    .feedback-content {
      color: #475569;
      line-height: 1.6;
      margin: 0 0 16px;
      font-size: 1rem;
    }

    .feedback-footer {
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }

    .feedback-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #94a3b8;
      font-size: 0.9rem;

      svg {
        width: 16px;
        height: 16px;
      }

      .updated {
        font-style: italic;
        color: #cbd5e1;
      }
    }

    .edit-mode {
      .edit-textarea {
        width: 100%;
        padding: 14px;
        border: 2px solid #6366f1;
        border-radius: 12px;
        font-size: 1rem;
        font-family: inherit;
        resize: vertical;
        margin-bottom: 12px;

        &:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
      }

      .edit-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .btn-cancel,
      .btn-save {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;

        svg {
          width: 18px;
          height: 18px;
        }
      }

      .btn-cancel {
        background: #f1f5f9;
        color: #64748b;

        &:hover {
          background: #e2e8f0;
          color: #475569;
        }
      }

      .btn-save {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .feedback-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class StudentHistoryComponent implements OnInit {
  user: User | null = null;
  feedbackList: Feedback[] = [];
  isLoading = false;

  editingFeedbackId: number | null = null;
  editingContent = '';

  constructor(
    private authService: AuthService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.isLoading = true;
    this.feedbackService.getAll().subscribe({
      next: (all: Feedback[]) => {
        this.feedbackList = this.feedbackService.filterForStudent(all, this.user);
        this.isLoading = false;
      },
      error: err => {
        console.error('Erreur chargement feedbacks', err);
        this.isLoading = false;
      }
    });
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'COURSE': 'Cours',
      'INFRA': 'Infrastructure'
    };
    return labels[category] || 'Autre';
  }

  startEditing(feedback: Feedback): void {
    this.editingFeedbackId = feedback.id!;
    this.editingContent = feedback.content;
  }

  cancelEditing(): void {
    this.editingFeedbackId = null;
    this.editingContent = '';
  }

  saveEdit(feedbackId: number): void {
    if (this.editingContent.trim().length < 10) {
      alert('Le feedback doit contenir au moins 10 caractères.');
      return;
    }

    this.feedbackService.updateFeedback(feedbackId, { content: this.editingContent }).subscribe({
      next: () => {
        const index = this.feedbackList.findIndex(fb => fb.id === feedbackId);
        if (index !== -1) {
          this.feedbackList[index].content = this.editingContent;
          this.feedbackList[index].updatedAt = new Date().toISOString();
        }
        this.cancelEditing();
      },
      error: err => {
        console.error('Erreur modification', err);
        alert('Impossible de modifier ce feedback.');
      }
    });
  }

  deleteFeedback(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce feedback ? Cette action est irréversible.')) {
      return;
    }

    this.feedbackService.deleteFeedback(id).subscribe({
      next: () => {
        this.feedbackList = this.feedbackList.filter(fb => fb.id !== id);
      },
      error: err => {
        console.error('Erreur suppression', err);
        alert('Impossible de supprimer ce feedback.');
      }
    });
  }
}