// src/app/models/course.model.ts
export interface Course {
  id: number;
  code: string;
  title: string;
  department: string;

  
  // on affichera simplement le nom complet du prof si présent
  teacher?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
}
