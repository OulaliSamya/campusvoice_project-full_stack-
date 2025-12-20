// src/app/pages/student-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService, User } from '../services/auth.service';
import { Course } from '../models/course.model';
import { CourseService } from '../services/course.service';

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

  // liste de départements & types (simple pour le moment)
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
        this.courses = list;
      },
      error: err => {
        console.error('Erreur lors du chargement des cours', err);
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

    // on pourrait, plus tard, recharger les données selon la section
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
        console.error(err);
        this.courseError = 'Erreur lors de l’envoi du feedback.';
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
        console.error(err);
        this.infraError = 'Erreur lors de l’envoi du feedback.';
      }
    });
  }
}
