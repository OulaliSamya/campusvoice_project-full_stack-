// src/app/app.routes.ts
import { inject } from '@angular/core';
import { Router, Routes, CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

// Import des composants
import { HomeComponent } from './pages/home.component';
import { LoginComponent } from './pages/login.component';
import { StudentDashboardComponent } from './pages/student-dashboard.component';
import { TeacherDashboardComponent } from './pages/teacher-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';
import { AdminLayoutComponent } from './pages/admin-layout.component';
import { AdminManagementComponent } from './pages/admin-management.component';
import { AdminFeedbacksComponent } from './pages/admin-feedbacks.component';

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
    return router.parseUrl('/student');
  }
  
  if (user.role === 'TEACHER') {
    return router.parseUrl('/teacher');
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
    return router.parseUrl('/teacher');
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
    return router.parseUrl('/student');
  }
  
  return router.parseUrl('/login');
};

/**
 * Routes de l'application
 */
export const routes: Routes = [
  // Page d'accueil publique
  { 
    path: '', 
    component: HomeComponent 
  },
  
  // Page de connexion
  { 
    path: 'login', 
    component: LoginComponent 
  },
  
  // Dashboard étudiant (protégé)
  { 
    path: 'student', 
    component: StudentDashboardComponent, 
    canActivate: [studentGuard] 
  },
  
  // Dashboard enseignant (protégé)
  { 
    path: 'teacher', 
    component: TeacherDashboardComponent, 
    canActivate: [teacherGuard] 
  },
  
  // Section admin (protégée avec layout)
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
        path: 'management', 
        component: AdminManagementComponent 
      }
    ] 
  },
  
  // Redirection pour toutes les routes non trouvées
  { 
    path: '**', 
    redirectTo: '' 
  }
];