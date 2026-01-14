// src/app/models/course.model.ts
import { Document } from './document.model';

export interface Course {
  id?: number;
  code: string;
  title: string;
  department: string;
  teacherId: number | null;
  teacherName?: string;
  allowedClasses?: string[];
  documents?: Document[]; // ✅ Ajouté
}