// src/app/pages/teacher-feedbacks.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { Course } from '../models/course.model';
import { Feedback, SentimentLabel } from '../models/feedback.model'; // ✅ Importe SentimentLabel

@Component({
  selector: 'app-teacher-feedbacks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-feedbacks.component.html',
  styleUrls: ['./teacher-feedbacks.component.scss']
})
export class TeacherFeedbacksComponent implements OnInit {
  user: User | null = null;
  myCourses: Course[] = [];
  allFeedbacks: Feedback[] = [];
  filteredFeedbacks: Feedback[] = [];
  
  searchTerm: string = '';
  filterSentiment: SentimentLabel | '' = ''; // ✅ Utilise SentimentLabel
  loadingFeedbacks = true;
  
  selectedFeedback: Feedback | null = null;

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
    this.loadCoursesAndFeedbacks();
  }

  loadCoursesAndFeedbacks(): void {
    this.loadingFeedbacks = true;
    
    this.http.get<Course[]>('http://localhost:8080/api/courses').subscribe({
      next: (courses) => {
        this.myCourses = courses.filter(c => c.teacherId === this.user?.id);
        const courseIds = this.myCourses.map(c => c.id!);
        
        this.http.get<Feedback[]>('http://localhost:8080/api/feedbacks').subscribe({
          next: (feedbacks) => {
            this.allFeedbacks = feedbacks
              .filter(fb => fb.course && courseIds.includes(fb.course.id))
              .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
            
            this.filteredFeedbacks = [...this.allFeedbacks];
            this.loadingFeedbacks = false;
          },
          error: (err) => {
            console.error('Erreur chargement feedbacks:', err);
            this.loadingFeedbacks = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur chargement cours:', err);
        this.loadingFeedbacks = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredFeedbacks = this.allFeedbacks.filter(feedback => {
      const matchesSearch = !this.searchTerm || 
        feedback.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (feedback.course?.title && feedback.course.title.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesSentiment = !this.filterSentiment || feedback.sentimentLabel === this.filterSentiment;
      
      return matchesSearch && matchesSentiment;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  viewDetails(feedback: Feedback): void {
    this.selectedFeedback = feedback;
  }

  closeModal(): void {
    this.selectedFeedback = null;
  }

  deleteFeedback(id: number | undefined): void {
    if (!id) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce feedback ?')) {
      return;
    }

    this.http.delete(`http://localhost:8080/api/feedbacks/${id}`).subscribe({
      next: () => {
        this.allFeedbacks = this.allFeedbacks.filter(fb => fb.id !== id);
        this.applyFilters();
        if (this.selectedFeedback && this.selectedFeedback.id === id) {
          this.closeModal();
        }
      },
      error: (err) => {
        console.error('Erreur suppression feedback:', err);
        alert('Impossible de supprimer ce feedback.');
      }
    });
  }

  getSentimentLabel(label: SentimentLabel | undefined): string {
    const labels: Record<SentimentLabel, string> = {
      'POSITIVE': 'Positif',
      'NEUTRAL': 'Neutre',
      'NEGATIVE': 'Négatif'
    };
    return label ? labels[label] : 'Inconnu';
  }

  get totalFeedbacks(): number {
    return this.allFeedbacks.length;
  }

  get positiveFeedbacks(): number {
    return this.allFeedbacks.filter(fb => fb.sentimentLabel === 'POSITIVE').length;
  }

  get neutralFeedbacks(): number {
    return this.allFeedbacks.filter(fb => fb.sentimentLabel === 'NEUTRAL').length;
  }

  get negativeFeedbacks(): number {
    return this.allFeedbacks.filter(fb => fb.sentimentLabel === 'NEGATIVE').length;
  }
}