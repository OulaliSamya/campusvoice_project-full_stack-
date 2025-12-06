export interface User {
  id: number;
  fullName: string;
  email: string;
  studentId?: string | null;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  department?: string;
  active?: boolean;
  createdAt?: string;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  department?: string;
  teacher?: User;
}

export interface Feedback {
  id: number;
  content: string;
  category: 'COURSE' | 'TEACHER' | 'INFRASTRUCTURE' | 'OTHER';
  createdAt: string;
  sentimentLabel: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentimentScore: number;
  status: string;
  topics?: string | null;
  anonymous: boolean;
  student?: User | null;
  course?: Course | null;
}

export interface CreateFeedbackRequest {
  content: string;
  category: 'COURSE' | 'TEACHER' | 'INFRASTRUCTURE' | 'OTHER';
  anonymous: boolean;
  studentId?: number | null;
  courseId?: number | null;
}
