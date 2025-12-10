import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home.component';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { StudentDashboardComponent } from './pages/student-dashboard.component';
import { TeacherDashboardComponent } from './pages/teacher-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'student', component: StudentDashboardComponent },
  { path: 'teacher', component: TeacherDashboardComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
];
