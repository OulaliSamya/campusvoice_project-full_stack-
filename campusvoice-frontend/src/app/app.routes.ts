// src/app/app.routes.ts
import { inject } from '@angular/core';
import { Router, Routes, CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

// Import des composants publics
import { HomeComponent } from './pages/home.component';
import { LoginComponent } from './pages/login.component';

// Import des composants admin
import { AdminLayoutComponent } from './pages/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';
import { AdminFeedbacksComponent } from './pages/admin-feedbacks.component';
import { AdminManagementComponent } from './pages/admin-management.component';
import { AdminUsersComponent } from './pages/admin-users.component';
import { AdminCoursesComponent } from './pages/admin-courses.component';

// Import des composants enseignant
import { TeacherLayoutComponent } from './pages/teacher-layout.component';
import { TeacherCoursesComponent } from './pages/teacher-courses.component';
import { TeacherFeedbacksComponent } from './pages/teacher-feedbacks.component';

// Import des composants étudiant
import { StudentLayoutComponent } from './pages/student-layout.component';
import { StudentCoursesComponent } from './pages/student-courses.component';
import { StudentFeedbackCourseComponent } from './pages/student-feedback-course.component';
import { StudentFeedbackInfraComponent } from './pages/student-feedback-infra.component';
import { StudentHistoryComponent } from './pages/student-history.component';

/**
 * Guard pour vérifier l'authentification
 */
const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (auth.getCurrentUser()) {
    return true;
  }
  
  return router.parseUrl('/login');
};

/**
 * Guard pour vérifier le rôle admin
 */
const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.getCurrentUser();
  
  if (!user) {
    return router.parseUrl('/login');
  }
  
  if (user.role === 'ADMIN') {
    return true;
  }
  
  // Rediriger vers le dashboard approprié selon le rôle
  if (user.role === 'STUDENT') {
    return router.parseUrl('/student/courses');
  }
  
  if (user.role === 'TEACHER') {
    return router.parseUrl('/teacher/courses');
  }
  
  return router.parseUrl('/login');
};

/**
 * Guard pour vérifier le rôle étudiant
 */
const studentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.getCurrentUser();
  
  if (!user) {
    return router.parseUrl('/login');
  }
  
  if (user.role === 'STUDENT') {
    return true;
  }
  
  // Rediriger vers le dashboard approprié
  if (user.role === 'ADMIN') {
    return router.parseUrl('/admin/dashboard');
  }
  
  if (user.role === 'TEACHER') {
    return router.parseUrl('/teacher/courses');
  }
  
  return router.parseUrl('/login');
};

/**
 * Guard pour vérifier le rôle enseignant
 */
const teacherGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.getCurrentUser();
  
  if (!user) {
    return router.parseUrl('/login');
  }
  
  if (user.role === 'TEACHER') {
    return true;
  }
  
  // Rediriger vers le dashboard approprié
  if (user.role === 'ADMIN') {
    return router.parseUrl('/admin/dashboard');
  }
  
  if (user.role === 'STUDENT') {
    return router.parseUrl('/student/courses');
  }
  
  return router.parseUrl('/login');
};

/**
 * Routes de l'application
 */
export const routes: Routes = [
  // ============================================
  // ROUTES PUBLIQUES
  // ============================================
  
  { 
    path: '', 
    component: HomeComponent 
  },
  
  { 
    path: 'login', 
    component: LoginComponent 
  },
  
  // ============================================
  // ESPACE ÉTUDIANT (protégé)
  // ============================================
  
  { 
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [studentGuard],
    children: [
      { 
        path: '', 
        redirectTo: 'courses', 
        pathMatch: 'full' 
      },
      { 
        path: 'courses', 
        component: StudentCoursesComponent 
      },
      { 
        path: 'feedback-course', 
        component: StudentFeedbackCourseComponent 
      },
      { 
        path: 'feedback-infra', 
        component: StudentFeedbackInfraComponent 
      },
      { 
        path: 'history', 
        component: StudentHistoryComponent 
      }
    ]
  },
  
  // ============================================
  // ESPACE ENSEIGNANT (protégé)
  // ============================================
  
  { 
    path: 'teacher',
    component: TeacherLayoutComponent,
    canActivate: [teacherGuard],
    children: [
      { 
        path: '', 
        redirectTo: 'courses', 
        pathMatch: 'full' 
      },
      { 
        path: 'courses', 
        component: TeacherCoursesComponent 
      },
      { 
        path: 'feedbacks', 
        component: TeacherFeedbacksComponent 
      }
    ] 
  },
  
  // ============================================
  // ESPACE ADMINISTRATEUR (protégé)
  // ============================================
  
  { 
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent 
      },
      { 
        path: 'feedbacks', 
        component: AdminFeedbacksComponent 
      },
      { 
        path: 'courses', 
        component: AdminCoursesComponent 
      },
      { 
        path: 'users', 
        component: AdminUsersComponent 
      },
      { 
        path: 'management', 
        component: AdminManagementComponent 
      }
    ] 
  },
  
  // ============================================
  // ROUTE PAR DÉFAUT (404)
  // ============================================
  
  { 
    path: '**', 
    redirectTo: '' 
  }
];