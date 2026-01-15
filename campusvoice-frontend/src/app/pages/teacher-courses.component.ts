// src/app/pages/teacher-courses.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { Course } from '../models/course.model';
import { Document } from '../models/document.model';

interface CourseWithDocuments extends Course {
  documents?: Document[];
}

@Component({
  selector: 'app-teacher-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-courses.component.html',
  styleUrls: ['./teacher-courses.component.scss']
})
export class TeacherCoursesComponent implements OnInit {
  user: User | null = null;
  myCourses: CourseWithDocuments[] = [];
  filteredCourses: CourseWithDocuments[] = [];
  
  searchTerm: string = '';
  loadingCourses = true;
  
  // Upload modal
  showUploadModal = false;
  selectedCourse: CourseWithDocuments | null = null;
  selectedFile: File | null = null;
  docTitle = '';
  uploading = false;
  uploadError: string | null = null;
  uploadSuccess: string | null = null;

  // View documents modal
  viewingCourse: CourseWithDocuments | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.http.get<CourseWithDocuments[]>('http://localhost:8080/api/courses').subscribe({
      next: (courses) => {
        this.myCourses = courses.filter(c => c.teacherId === this.user?.id);
        // Charger les documents pour chaque cours
        this.myCourses.forEach(course => {
          this.loadDocumentsForCourse(course);
        });
        this.filteredCourses = [...this.myCourses];
        this.loadingCourses = false;
      },
      error: (err) => {
        console.error('Erreur chargement cours:', err);
        this.loadingCourses = false;
      }
    });
  }

  loadDocumentsForCourse(course: CourseWithDocuments): void {
    this.http.get<Document[]>(`http://localhost:8080/api/documents?courseId=${course.id}`).subscribe({
      next: (docs) => {
        course.documents = docs;
      },
      error: () => {
        course.documents = [];
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCourses = [...this.myCourses];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCourses = this.myCourses.filter(course =>
      course.code.toLowerCase().includes(term) ||
      course.title.toLowerCase().includes(term) ||
      course.department.toLowerCase().includes(term)
    );
  }

  openUploadModal(course: CourseWithDocuments): void {
    this.selectedCourse = course;
    this.showUploadModal = true;
    this.selectedFile = null;
    this.docTitle = '';
    this.uploadError = null;
    this.uploadSuccess = null;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedCourse = null;
    this.selectedFile = null;
    this.docTitle = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.uploadError = 'Le fichier ne doit pas dépasser 10 MB';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
      this.uploadError = null;
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.docTitle.trim() || !this.selectedCourse) {
      this.uploadError = 'Veuillez remplir tous les champs';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.docTitle.trim());
    if (this.selectedCourse.id != null) {
      formData.append('courseId', this.selectedCourse.id.toString());
    } else {
      this.uploadError = 'Erreur: ID du cours introuvable';
      return;
    }

    this.uploading = true;
    this.uploadError = null;

    this.http.post<Document>('http://localhost:8080/api/documents', formData).subscribe({
      next: (doc) => {
        // Ajouter le document à la liste
        if (!this.selectedCourse!.documents) {
          this.selectedCourse!.documents = [];
        }
        this.selectedCourse!.documents.push(doc);
        
        this.uploadSuccess = 'Document ajouté avec succès !';
        setTimeout(() => this.closeUploadModal(), 1500);
        this.uploading = false;
      },
      error: (err) => {
        console.error('Erreur upload:', err);
        this.uploadError = err.error?.message || 'Échec de l\'upload du document';
        this.uploading = false;
      }
    });
  }

  viewDocuments(course: CourseWithDocuments): void {
    this.viewingCourse = course;
  }

  closeViewModal(): void {
    this.viewingCourse = null;
  }

  deleteDocument(doc: Document, course: CourseWithDocuments): void {
    if (!confirm(`Supprimer le document "${doc.title}" ?`)) return;

    this.http.delete(`http://localhost:8080/api/documents/${doc.id}`).subscribe({
      next: () => {
        // Retirer le document de la liste
        if (course.documents) {
          course.documents = course.documents.filter(d => d.id !== doc.id);
        }
        // Mettre à jour aussi dans viewingCourse si c'est le même
        if (this.viewingCourse && this.viewingCourse.id === course.id && this.viewingCourse.documents) {
          this.viewingCourse.documents = this.viewingCourse.documents.filter(d => d.id !== doc.id);
        }
      },
      error: (err) => {
        console.error('Erreur suppression document:', err);
        alert('Échec de la suppression du document.');
      }
    });
  }

  getDocumentUrl(fileName: string): string {
    return `http://localhost:8080/api/documents/download/${fileName}`;
  }

  get totalCourses(): number {
    return this.myCourses.length;
  }

  get totalDocuments(): number {
    return this.myCourses.reduce((sum, course) => 
      sum + (course.documents?.length || 0), 0
    );
  }
}