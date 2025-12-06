import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback, CreateFeedbackRequest } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  // On parle directement au backend Spring Boot
  private baseUrl = 'http://localhost:8080/api/feedbacks';

  constructor(private http: HttpClient) {}

  getAllFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.baseUrl);
  }

  createFeedback(payload: CreateFeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(this.baseUrl, payload);
  }
}
