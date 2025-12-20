import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback, FeedbackCategory } from '../models/feedback.model';
import { User } from './auth.service';

export interface CreateFeedbackRequest {
  content: string;
  category: FeedbackCategory;
  anonymous: boolean;
  studentId?: number | null;
  courseId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {

  private apiUrl = 'http://localhost:8080/api/feedbacks';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.apiUrl);
  }

  create(payload: CreateFeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(this.apiUrl, payload);
  }

  filterForStudent(list: Feedback[], student: User | null): Feedback[] {
    if (!student) {
      return [];
    }
    return list.filter(f => f.student && f.student.id === student.id);
  }
}
