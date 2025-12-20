export type FeedbackCategory = 'COURSE' | 'TEACHER' | 'INFRA';

export interface FeedbackStudentInfo {
  id: number;
  fullName: string;
  email: string;
}

export interface FeedbackCourseInfo {
  id: number;
  code: string;
  title: string;
}

export interface Feedback {
  id?: number;
  content: string;
  category: FeedbackCategory;
  createdAt?: string;
  sentimentLabel?: string;
  sentimentScore?: number;
  status?: string;
  topics?: string;
  anonymous: boolean;

  student?: FeedbackStudentInfo | null;
  course?: FeedbackCourseInfo | null;
}
