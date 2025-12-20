// src/app/services/course.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course.model';

@Injectable({ providedIn: 'root' })
export class CourseService {

  private apiUrl = 'http://localhost:8080/api/courses';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }
}
