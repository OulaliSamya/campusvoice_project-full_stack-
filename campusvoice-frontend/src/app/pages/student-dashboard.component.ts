// src/app/pages/student-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService, User } from '../services/auth.service';
import { Course } from '../models/course.model';
import { CourseService } from '../services/course.service';
import { DocumentService } from '../services/document.service';

import {
  Feedback,
  FeedbackCategory,
} from '../models/feedback.model';
import {
  FeedbackService,
  CreateFeedbackRequest,
} from '../services/feedback.service';

type StudentSection = 'courses' | 'feedback-course' | 'feedback-infra' | 'history';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {

  // utilisateur connecté
  user: User | null = null;

  // sidebar : section sélectionnée
  selectedSection: StudentSection = 'courses';

  // données
  courses: Course[] = [];
  feedbackList: Feedback[] = [];

  // --------- Feedback cours / prof ----------
  selectedCourseId: number | null = null;
  courseFeedbackContent = '';
  courseFeedbackAnonymous = true;
  courseError: string | null = null;
  courseSuccess: string | null = null;
  sendingCourse = false;

  // --------- Feedback infrastructure ----------
  infraDepartment = 'Informatique';
  infraType = 'Salle';
  infraContent = '';
  infraAnonymous = true;
  infraError: string | null = null;
  infraSuccess: string | null = null;
  sendingInfra = false;

  // liste de départements & types
  infraDepartments: string[] = [
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
    'Autre'
  ];

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private documentService: DocumentService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadCourses();
    this.loadStudentFeedbacks();
  }

  // -------------------- Data loading --------------------

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

        this.courses.forEach(course => {
          if (course.id) {
            this.loadCourseDocuments(course.id);
          }
        });
      },
      error: err => {
        console.error('Erreur lors du chargement des cours', err);
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
      error: err => {
        console.error('Erreur lors du chargement des documents', err);
      }
    });
  }

  loadStudentFeedbacks(): void {
    this.feedbackService.getAll().subscribe({
      next: (all: Feedback[]) => {
        this.feedbackList = this.feedbackService.filterForStudent(all, this.user);
      },
      error: err => {
        console.error('Erreur lors du chargement des feedbacks', err);
      }
    });
  }

  // -------------------- Navigation intérieure --------------------

  selectSection(section: StudentSection): void {
    this.selectedSection = section;

    if (section === 'history') {
      this.loadStudentFeedbacks();
    }
  }

  // -------------------- Feedback cours / prof --------------------

  sendCourseFeedback(): void {
    this.courseError = null;
    this.courseSuccess = null;

    if (!this.selectedCourseId) {
      this.courseError = 'Veuillez choisir un cours.';
      return;
    }

    const trimmed = this.courseFeedbackContent.trim();
    if (trimmed.length < 10) {
      this.courseError = 'Le feedback doit contenir au moins 10 caractères.';
      return;
    }

    const payload: CreateFeedbackRequest = {
      content: trimmed,
      category: 'COURSE' as FeedbackCategory,
      anonymous: this.courseFeedbackAnonymous,
      studentId: this.courseFeedbackAnonymous ? null : this.user?.id ?? null,
      courseId: this.selectedCourseId
    };

    this.sendingCourse = true;

    this.feedbackService.create(payload).subscribe({
      next: fb => {
        this.sendingCourse = false;
        this.courseSuccess = 'Feedback sur le cours envoyé avec succès.';
        this.courseFeedbackContent = '';
        this.selectedCourseId = null;
        this.courseFeedbackAnonymous = true;
        this.loadStudentFeedbacks();
      },
      error: err => {
        this.sendingCourse = false;
        
        if (typeof err.error === 'string' && err.error.includes('inapproprié')) {
          this.courseError = 'Veuillez utiliser un langage respectueux.';
        } 
        else if (err.status === 400) {
          this.courseError = 'Contenu non autorisé. Veuillez reformuler votre feedback.';
        }
        else {
          console.error(err);
          this.courseError = 'Erreur lors de l’envoi du feedback.';
        }
      }
    });
  }

  // -------------------- Feedback infrastructure --------------------

  sendInfraFeedback(): void {
    this.infraError = null;
    this.infraSuccess = null;

    const trimmed = this.infraContent.trim();
    if (trimmed.length < 10) {
      this.infraError = 'Le feedback doit contenir au moins 10 caractères.';
      return;
    }

    const fullContent =
      `[${this.infraDepartment} - ${this.infraType}] ` + trimmed;

    const payload: CreateFeedbackRequest = {
      content: fullContent,
      category: 'INFRA' as FeedbackCategory,
      anonymous: this.infraAnonymous,
      studentId: this.infraAnonymous ? null : this.user?.id ?? null,
      courseId: null
    };

    this.sendingInfra = true;

    this.feedbackService.create(payload).subscribe({
      next: fb => {
        this.sendingInfra = false;
        this.infraSuccess = 'Feedback infrastructure envoyé avec succès.';
        this.infraContent = '';
        this.infraAnonymous = true;
        this.infraDepartment = 'Informatique';
        this.infraType = 'Salle de cours';
        this.loadStudentFeedbacks();
      },
      error: err => {
        this.sendingInfra = false;
        
        if (typeof err.error === 'string' && err.error.includes('inapproprié')) {
          this.infraError = 'Veuillez utiliser un langage respectueux.';
        } 
        else if (err.status === 400) {
          this.infraError = 'Contenu non autorisé. Veuillez reformuler votre feedback.';
        }
        else {
          console.error(err);
          this.infraError = 'Erreur lors de l’envoi du feedback.';
        }
      }
    });
  }

  // -------------------- Suppression de feedback --------------------

  deleteFeedback(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce feedback ?')) {
      return;
    }

    this.feedbackService.deleteFeedback(id).subscribe({
      next: () => {
        this.feedbackList = this.feedbackList.filter(fb => fb.id !== id);
      },
      error: err => {
        console.error('Erreur lors de la suppression', err);
        alert('Impossible de supprimer ce feedback.');
      }
    });
  }

  // -------------------- Modification de feedback --------------------

  editingFeedbackId: number | null = null;
  editingContent = '';

  startEditing(feedback: Feedback): void {
    this.editingFeedbackId = feedback.id!; // ✅ Force la non-nullité
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
        // Mettre à jour la liste
        const index = this.feedbackList.findIndex(fb => fb.id === feedbackId);
        if (index !== -1) {
          this.feedbackList[index].content = this.editingContent;
          this.feedbackList[index].updatedAt = new Date().toISOString();
        }
        this.cancelEditing();
      },
      error: err => {
        console.error('Erreur lors de la modification', err);
        alert('Impossible de modifier ce feedback.');
      }
    });
  }
}