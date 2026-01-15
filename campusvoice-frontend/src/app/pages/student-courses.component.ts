// src/app/pages/student-courses.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth.service';
import { Course } from '../models/course.model';
import { CourseService } from '../services/course.service';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="courses-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Mes <span class="highlight">Cours</span></h1>
          <p class="subtitle">Accédez à vos modules et documents de cours</p>
        </div>
        <div class="header-stats">
          <div class="stat-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <span>{{ courses.length }} cours</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement de vos cours...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && courses.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
        <h3>Aucun cours disponible</h3>
        <p>Vous n'êtes inscrit à aucun cours pour le moment</p>
      </div>

      <!-- Courses list -->
      <div *ngIf="!isLoading && courses.length > 0" class="courses-container">
        <div class="course-item" *ngFor="let course of courses; let i = index">
          <!-- Course header -->
          <div class="course-header" (click)="toggleCourse(i)">
            <div class="course-main-info">
              <div class="course-code">{{ course.code }}</div>
              <div class="course-details">
                <h3 class="course-title">{{ course.title }}</h3>
                <div class="course-meta">
                  <span class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                    {{ course.department }}
                  </span>
                  <span class="meta-item" *ngIf="course.teacherName">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {{ course.teacherName }}
                  </span>
                  <span class="meta-item documents-count" *ngIf="course.documents && course.documents.length > 0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    {{ course.documents.length }} document(s)
                  </span>
                </div>
              </div>
            </div>
            <button class="expand-btn" [class.expanded]="expandedCourses.has(i)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <!-- Course content (documents) -->
          <div class="course-content" *ngIf="expandedCourses.has(i)" [@slideDown]>
            <div *ngIf="course.documents && course.documents.length > 0" class="documents-section">
              <h4 class="documents-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                Documents du cours
              </h4>
              
              <div class="documents-grid">
                <a 
                  *ngFor="let doc of course.documents"
                  [href]="'http://localhost:8080/api/documents/download/' + doc.fileName" 
                  target="_blank"
                  class="document-card">
                  <div class="document-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                  </div>
                  <div class="document-info">
                    <span class="document-name">{{ doc.title }}</span>
                    <span class="document-date">{{ doc.uploadDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="document-action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            <div *ngIf="!course.documents || course.documents.length === 0" class="no-documents">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>Aucun document disponible pour ce cours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .courses-page {
      max-width: 1200px;
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

    .header-stats {
      .stat-badge {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 24px;
        background: white;
        border-radius: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        font-weight: 600;
        color: #475569;
        font-size: 1rem;

        svg {
          width: 22px;
          height: 22px;
          color: #6366f1;
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #e2e8f0;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      p {
        margin-top: 20px;
        color: #64748b;
        font-size: 1.1rem;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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
        margin: 0;
      }
    }

    .courses-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .course-item {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover {
        border-color: #6366f1;
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
      }
    }

    .course-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      cursor: pointer;
      gap: 20px;
      transition: background 0.2s ease;

      &:hover {
        background: #f8fafc;
      }
    }

    .course-main-info {
      flex: 1;
      display: flex;
      gap: 20px;
      align-items: center;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    .course-code {
      padding: 12px 20px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      font-weight: 700;
      font-size: 1rem;
      border-radius: 12px;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      min-width: 120px;
      text-align: center;
    }

    .course-details {
      flex: 1;

      .course-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 12px;
        line-height: 1.3;
      }

      .course-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #64748b;
        font-size: 0.95rem;

        svg {
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        &.documents-count {
          color: #6366f1;
          font-weight: 600;

          svg {
            color: #6366f1;
          }
        }
      }
    }

    .expand-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #f1f5f9;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      flex-shrink: 0;

      svg {
        width: 20px;
        height: 20px;
        color: #64748b;
        transition: transform 0.3s ease;
      }

      &:hover {
        background: #e2e8f0;

        svg {
          color: #6366f1;
        }
      }

      &.expanded svg {
        transform: rotate(180deg);
      }
    }

    .course-content {
      padding: 0 24px 24px;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .documents-section {
      .documents-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 20px;

        svg {
          width: 20px;
          height: 20px;
          color: #6366f1;
        }
      }
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }

    .document-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        background: white;
        border-color: #6366f1;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);

        .document-action svg {
          color: #6366f1;
          transform: translateY(2px);
        }
      }

      .document-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        svg {
          width: 22px;
          height: 22px;
          color: white;
        }
      }

      .document-info {
        flex: 1;
        min-width: 0;

        .document-name {
          display: block;
          font-weight: 600;
          color: #1e293b;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .document-date {
          display: block;
          font-size: 0.85rem;
          color: #94a3b8;
        }
      }

      .document-action {
        flex-shrink: 0;

        svg {
          width: 20px;
          height: 20px;
          color: #94a3b8;
          transition: all 0.3s ease;
        }
      }
    }

    .no-documents {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      text-align: center;

      svg {
        width: 48px;
        height: 48px;
        color: #cbd5e1;
        margin-bottom: 12px;
      }

      p {
        color: #94a3b8;
        margin: 0;
        font-size: 0.95rem;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .documents-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StudentCoursesComponent implements OnInit {
  user: User | null = null;
  courses: Course[] = [];
  isLoading = false;
  expandedCourses = new Set<number>();

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
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

        this.courses.forEach(course => {
          if (course.id) {
            this.loadCourseDocuments(course.id);
          }
        });
        
        this.isLoading = false;
      },
      error: err => {
        console.error('Erreur chargement cours', err);
        this.isLoading = false;
      }
    });
  }

  loadCourseDocuments(courseId: number): void {
    this.documentService.getByCourseId(courseId).subscribe({
      next: (docs) => {
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
          course.documents = docs;
        }
      },
      error: err => console.error('Erreur chargement documents', err)
    });
  }

  toggleCourse(index: number): void {
    if (this.expandedCourses.has(index)) {
      this.expandedCourses.delete(index);
    } else {
      this.expandedCourses.add(index);
    }
  }
}