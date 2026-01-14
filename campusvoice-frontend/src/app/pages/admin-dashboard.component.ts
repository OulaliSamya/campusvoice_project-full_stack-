// src/app/pages/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = { totalFeedbacks: 0, teachers: 0, students: 0, courses: 0 };
  latestFeedbacks: any[] = [];
  categoryStats = { positive: 0, neutral: 0, negative: 0 };
  totalFeedbacks = 0;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      filter(user => user !== null),
      take(1)
    ).subscribe(() => {
      this.loadData();
    });

    setTimeout(() => {
      if (this.stats.totalFeedbacks === 0) {
        this.loadData();
      }
    }, 500);
  }

  loadData() {
    this.loadStats();
    this.loadLatestFeedbacks();
    this.loadCategoryStats();
  }

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  loadStats() {
    this.http.get<any>('http://localhost:8080/api/admin/stats', { headers: this.getAuthHeaders() }).subscribe(stats => {
      this.stats = stats;
    });
  }

  loadLatestFeedbacks() {
    this.http.get<any[]>('http://localhost:8080/api/feedbacks?sort=createdAt,desc&page=0&size=5', { headers: this.getAuthHeaders() }).subscribe(feedbacks => {
      this.latestFeedbacks = feedbacks;
    });
  }

  loadCategoryStats() {
    this.http.get<any>('http://localhost:8080/api/admin/feedback-stats', { headers: this.getAuthHeaders() }).subscribe(stats => {
      this.categoryStats = stats;
      this.totalFeedbacks = stats.positive + stats.neutral + stats.negative;
    });
  }

  calculatePercentage(value: number): number {
    if (this.totalFeedbacks === 0) return 0;
    return Math.round((value / this.totalFeedbacks) * 100);
  }
}