// ============================================================
// JSON Resume Schema Types (subset)
// ============================================================
export interface JsonResumeBasics {
  name: string;
  email: string;
  phone?: string;
  location?: {
    city?: string;
    region?: string;
    countryCode?: string;
  };
  summary?: string;
  url?: string;
  picture?: string;
}

export interface JsonResumeWork {
  name: string;
  position: string;
  startDate: string;
  endDate?: string;
  summary?: string;
  url?: string;
  highlights?: string[];
}

export interface JsonResumeEducation {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate?: string;
  score?: string;
}

export interface JsonResumeSkill {
  name: string;
  level?: string;
  keywords?: string[];
}

export interface JsonResume {
  $schema?: string;
  basics?: JsonResumeBasics;
  work?: JsonResumeWork[];
  education?: JsonResumeEducation[];
  skills?: JsonResumeSkill[];
  [key: string]: unknown;
}

// ============================================================
// Application Types
// ============================================================
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  resumeNickname: string;
  resumeRawText: string;
  jsonResume: JsonResume;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeFormData {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  resumeNickname: string;
  resumeRawText: string;
}

export interface AnalysisFeedback {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  matchingSkills?: string[];
  skillGaps?: string[];
  improvementRecommendations?: string[];
}

export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Analysis {
  id: string;
  userId: string;
  resumeId: string;
  resumeNickname: string;
  jobDescription: string;
  score: number;
  feedback: AnalysisFeedback;
  interviewQuestions: InterviewQuestion[];
  createdAt: string;
}

export interface AnalyzeFormData {
  resumeId: string;
  jobDescription: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
