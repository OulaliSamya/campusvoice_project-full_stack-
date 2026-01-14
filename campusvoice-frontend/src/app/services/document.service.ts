// src/app/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8080/api/documents';

  constructor(private http: HttpClient) {}

  // Récupérer tous les documents
  getAll(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl);
  }

  // Récupérer les documents par ID de cours
  getByCourseId(courseId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}?courseId=${courseId}`);
  }

  // Télécharger un document (facultatif - géré via lien direct)
  download(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileName}`, {
      responseType: 'blob'
    });
  }
}