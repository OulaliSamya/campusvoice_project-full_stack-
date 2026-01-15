// src/app/pages/admin-courses.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Course } from '../models/course.model';

interface User {
  id?: number;
  fullName: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-courses.component.html',
  styleUrls: ['./admin-courses.component.scss']
})
export class AdminCoursesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  teachers: User[] = [];
  
  newCourse: Course = {
    code: '',
    title: '',
    department: '',
    teacherId: null
  };
  
  searchTerm: string = '';
  filterDepartment: string = '';
  showAddModal: boolean = false;
  selectedCourse: Course | null = null;
  
  courseError: string | null = null;
  courseSuccess: string | null = null;

  // Pour l'ajout de classe
  newClassName: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadTeachers();
  }

  loadCourses(): void {
    this.http.get<Course[]>('http://localhost:8080/api/courses').subscribe(courses => {
      this.courses = courses.map(c => ({
        ...c,
        id: c.id ? Number(c.id) : undefined,
        teacherId: c.teacherId || null,
        allowedClasses: []
      }));
      // Charger les classes pour chaque cours
      this.courses.forEach(course => {
        if (course.id) {
          this.loadAllowedClasses(course.id, course);
        }
      });
      this.filteredCourses = [...this.courses];
    });
  }

  loadAllowedClasses(courseId: number, course: Course): void {
    this.http.get<string[]>(`http://localhost:8080/api/courses/${courseId}/classes`)
      .subscribe(classes => {
        course.allowedClasses = classes;
      }, error => {
        console.error('Erreur chargement classes pour cours', courseId, error);
        course.allowedClasses = [];
      });
  }

  loadTeachers(): void {
    this.http.get<User[]>('http://localhost:8080/api/users').subscribe(users => {
      this.teachers = users
        .filter(u => u.role === 'TEACHER')
        .map(u => ({
          ...u,
          id: u.id ? Number(u.id) : undefined
        }));
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch = !this.searchTerm || 
        course.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (course.teacherName && course.teacherName.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesDepartment = !this.filterDepartment || course.department === this.filterDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.resetNewCourse();
    this.courseError = null;
    this.courseSuccess = null;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetNewCourse();
  }

  resetNewCourse(): void {
    this.newCourse = {
      code: '',
      title: '',
      department: '',
      teacherId: null
    };
  }

  createCourse(): void {
    if (this.newCourse.teacherId == null) {
      this.courseError = 'Veuillez sélectionner un enseignant';
      return;
    }
    // ✅ Ajoute les headers
    const headers = { 'Content-Type': 'application/json' };

    this.http.post<Course>('http://localhost:8080/api/courses', this.newCourse).subscribe({
      next: (course) => {
        const newCourse = {
          ...course,
          id: course.id ? Number(course.id) : undefined,
          allowedClasses: []
        };
        this.courses.push(newCourse);
        this.applyFilters();
        this.courseSuccess = 'Cours créé avec succès !';
        this.courseError = null;
        setTimeout(() => this.closeAddModal(), 1500);
      },
      error: (err) => {
        console.error('Erreur création cours :', err);
        this.courseError = err.error?.message || 'Échec de la création du cours.';
        this.courseSuccess = null;
      }
    });
  }

  viewDetails(course: Course): void {
    this.selectedCourse = { ...course };
    this.newClassName = '';
  }

  closeModal(): void {
    this.selectedCourse = null;
    this.newClassName = '';
  }

  deleteCourse(id: number | undefined): void {
    if (!id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      this.http.delete(`http://localhost:8080/api/courses/${id}`).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== id);
          this.applyFilters();
          if (this.selectedCourse?.id === id) {
            this.closeModal();
          }
        },
        error: (err) => {
          console.error('Erreur suppression cours :', err);
          alert('Échec de la suppression du cours.');
        }
      });
    }
  }

  addClassToCourse(courseId: number, className: string): void {
    if (!className.trim()) {
      alert('Veuillez entrer un nom de classe');
      return;
    }

    this.http.post(
      `http://localhost:8080/api/courses/${courseId}/classes`,
      className.trim(),
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        // Recharger les classes pour ce cours
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
          this.loadAllowedClasses(courseId, course);
        }
        // Mettre à jour aussi dans selectedCourse si c'est le même
        if (this.selectedCourse && this.selectedCourse.id === courseId) {
          this.loadAllowedClasses(courseId, this.selectedCourse);
        }
        this.newClassName = '';
      },
      error: (err) => {
        console.error('Erreur ajout classe :', err);
        alert('Échec de l\'ajout de la classe.');
      }
    });
  }

  removeClassFromCourse(courseId: number, className: string): void {
    if (confirm(`Retirer la classe "${className}" de ce cours ?`)) {
      this.http.delete(`http://localhost:8080/api/courses/${courseId}/classes/${className}`)
        .subscribe({
          next: () => {
            // Mettre à jour le cours dans la liste
            const course = this.courses.find(c => c.id === courseId);
            if (course && course.allowedClasses) {
              course.allowedClasses = course.allowedClasses.filter(c => c !== className);
            }
            // Mettre à jour aussi dans selectedCourse
            if (this.selectedCourse && this.selectedCourse.allowedClasses) {
              this.selectedCourse.allowedClasses = this.selectedCourse.allowedClasses.filter(c => c !== className);
            }
          },
          error: (err) => {
            console.error('Erreur suppression classe :', err);
            alert('Échec de la suppression de la classe.');
          }
        });
    }
  }

  getTeacherName(course: Course): string {
    return course.teacherName || 'Non attribué';
  }

  get totalCourses(): number {
    return this.courses.length;
  }

  get departments(): string[] {
    const depts = new Set(this.courses.map(c => c.department));
    return Array.from(depts).sort();
  }
}