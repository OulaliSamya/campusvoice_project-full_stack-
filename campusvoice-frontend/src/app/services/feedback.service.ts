// src/app/services/feedback.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from '../models/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  private baseUrl = 'http://localhost:8080/api/feedbacks';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.baseUrl);
  }

  create(feedbackPayload: any): Observable<Feedback> {
    return this.http.post<Feedback>(this.baseUrl, feedbackPayload);
  }
}
