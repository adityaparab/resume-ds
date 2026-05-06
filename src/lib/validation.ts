import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens'
      ),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be at most 100 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================================
// Resume Upload Schema
// ============================================================
export const resumeSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^[+]?[\d\s()-]{7,20}$/,
      'Please enter a valid phone number'
    ),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be at most 200 characters'),
  resumeNickname: z
    .string()
    .min(3, 'Resume nickname must be at least 3 characters')
    .max(50, 'Resume nickname must be at most 50 characters')
    .regex(
      /^[a-zA-Z0-9_ -]+$/,
      'Nickname can only contain letters, numbers, spaces, underscores, and hyphens'
    ),
  resumeRawText: z
    .string()
    .min(200, 'Resume text must be at least 200 characters')
    .max(50000, 'Resume text must be at most 50,000 characters'),
});

// ============================================================
// Analyze Schema
// ============================================================
export const analyzeSchema = z.object({
  resumeId: z.string().min(1, 'Please select a resume'),
  jobDescription: z
    .string()
    .min(100, 'Job description must be at least 100 characters')
    .max(15000, 'Job description must be at most 15,000 characters'),
});

// ============================================================
// JSON Resume Schema Validation (for OpenAI response)
// ============================================================
export const jsonResumeBasicsSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z
    .object({
      city: z.string().optional(),
      region: z.string().optional(),
      countryCode: z.string().optional(),
    })
    .optional(),
  summary: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  picture: z.string().optional(),
});

export const jsonResumeWorkSchema = z.object({
  name: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  url: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const jsonResumeEducationSchema = z.object({
  institution: z.string(),
  area: z.string(),
  studyType: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  score: z.string().optional(),
});

export const jsonResumeSkillSchema = z.object({
  name: z.string(),
  level: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export const jsonResumeSchema = z.object({
  $schema: z.string().optional(),
  basics: jsonResumeBasicsSchema.optional(),
  work: z.array(jsonResumeWorkSchema).optional(),
  education: z.array(jsonResumeEducationSchema).optional(),
  skills: z.array(jsonResumeSkillSchema).optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        url: z.string().optional(),
        highlights: z.array(z.string()).optional(),
      })
    )
    .optional(),
  languages: z
    .array(
      z.object({
        language: z.string(),
        fluency: z.string().optional(),
      })
    )
    .optional(),
  interests: z
    .array(
      z.object({
        name: z.string(),
        keywords: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

// ============================================================
// Type exports
// ============================================================
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ResumeFormValues = z.infer<typeof resumeSchema>;
export type AnalyzeFormValues = z.infer<typeof analyzeSchema>;
export type JsonResumeFormValues = z.infer<typeof jsonResumeSchema>;
