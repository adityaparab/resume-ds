import OpenAI from 'openai';
import type { User, Resume, Analysis, ResumeFormData, JsonResume } from '@/types';
import { jsonResumeSchema } from './validation';
import { generateId } from './utils';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// ============================================================
// Generic fetch wrapper with error handling
// ============================================================
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new ApiRequestError(
          `Request failed: ${response.status} ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiRequestError) throw error;
      if ((error as Error).name === 'AbortError') {
        throw new ApiRequestError('Request timed out after 15 seconds', 408);
      }
      throw new ApiRequestError(
        (error as Error).message || 'Network error. Please check your connection.',
        0
      );
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiRequestError extends Error {
  status: number;
  body: string;

  constructor(message: string, status: number, body: string = '') {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}

export const apiClient = new ApiClient(API_BASE);

// ============================================================
// Auth API
// ============================================================
export const authApi = {
  async login(email: string, password: string): Promise<User> {
    const users = await apiClient.get<User[]>(
      `/users?email=${encodeURIComponent(email)}`
    );
    const user = users[0];
    if (!user) {
      throw new ApiRequestError('No account found with this email', 404);
    }
    if (user.password !== password) {
      throw new ApiRequestError('Invalid password', 401);
    }
    return user;
  },

  async register(
    username: string,
    email: string,
    password: string,
    fullName: string
  ): Promise<User> {
    const existing = await apiClient.get<User[]>(
      `/users?email=${encodeURIComponent(email)}`
    );
    if (existing.length > 0) {
      throw new ApiRequestError('An account with this email already exists', 409);
    }
    const newUser: User = {
      id: generateId(),
      username,
      email,
      password,
      fullName,
      createdAt: new Date().toISOString(),
    };
    return apiClient.post<User>('/users', newUser);
  },
};

// ============================================================
// Resume API
// ============================================================
export const resumeApi = {
  async getAll(userId: string): Promise<Resume[]> {
    return apiClient.get<Resume[]>(
      `/resumes?userId=${encodeURIComponent(userId)}&_sort=createdAt&_order=desc`
    );
  },

  async getById(id: string): Promise<Resume> {
    return apiClient.get<Resume>(`/resumes/${encodeURIComponent(id)}`);
  },

  async create(
    userId: string,
    data: ResumeFormData,
    jsonResume: JsonResume
  ): Promise<Resume> {
    const now = new Date().toISOString();
    const resume: Resume = {
      id: generateId(),
      userId,
      ...data,
      jsonResume,
      createdAt: now,
      updatedAt: now,
    };
    return apiClient.post<Resume>('/resumes', resume);
  },

  async update(
    id: string,
    data: Partial<ResumeFormData & { jsonResume: JsonResume }>
  ): Promise<Resume> {
    return apiClient.patch<Resume>(`/resumes/${encodeURIComponent(id)}`, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/resumes/${encodeURIComponent(id)}`);
  },
};

// ============================================================
// Analysis API
// ============================================================
export const analysisApi = {
  async getAll(userId: string): Promise<Analysis[]> {
    return apiClient.get<Analysis[]>(
      `/analyses?userId=${encodeURIComponent(userId)}&_sort=createdAt&_order=desc`
    );
  },

  async getById(id: string): Promise<Analysis> {
    return apiClient.get<Analysis>(`/analyses/${encodeURIComponent(id)}`);
  },

  async create(
    userId: string,
    resumeId: string,
    resumeNickname: string,
    jobDescription: string,
    score: number,
    feedback: Analysis['feedback'],
    interviewQuestions: Analysis['interviewQuestions']
  ): Promise<Analysis> {
    const analysis: Analysis = {
      id: generateId(),
      userId,
      resumeId,
      resumeNickname,
      jobDescription,
      score,
      feedback,
      interviewQuestions,
      createdAt: new Date().toISOString(),
    };
    return apiClient.post<Analysis>('/analyses', analysis);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/analyses/${encodeURIComponent(id)}`);
  },
};

// ============================================================
// OpenAI Integration — Expert Resume Analysis Engine
// ============================================================
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const OPENAI_MODEL = (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o';

function createOpenAIClient(): OpenAI {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
    throw new ApiRequestError(
      'OpenAI API key not configured. Set VITE_OPENAI_API_KEY in your .env file.',
      0
    );
  }
  return new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
    timeout: 60000,
    maxRetries: 3,
  });
}

/**
 * System prompt — positions the AI as an elite resume analysis expert.
 */
const ANALYZER_SYSTEM_PROMPT = `You are a world-class Senior Technical Recruiter and Career Coach with 20+ years of experience at FAANG companies and top-tier startups. You have reviewed over 50,000 resumes and conducted 10,000+ technical interviews.

Your expertise includes:
- Deep understanding of what hiring managers look for across all industries
- Expert knowledge of ATS (Applicant Tracking System) optimization
- Mastery of resume structure, keyword optimization, and impact quantification
- Ability to identify both explicit and implicit requirements in job descriptions
- Creating interview questions that genuinely test candidates' fit

You provide brutally honest, actionable, and specific feedback. You never give generic advice. Every point you make is grounded in the specific content of the resume and job description provided.

When analyzing, consider:
1. Keyword alignment between resume and job description
2. Experience level match (years, seniority, scope)
3. Skills relevance and depth demonstrated
4. Achievement impact (quantified vs. vague descriptions)
5. Resume structure, clarity, and professionalism
6. Gaps or missing critical elements
7. ATS compatibility issues
8. Cultural fit indicators

Output your analysis as valid JSON only, with no markdown formatting or code fences.`;

/**
 * System prompt for the JSON Resume converter.
 */
const JSON_RESUME_SYSTEM_PROMPT = `You are an expert resume parser. Extract structured information from the provided resume text and output it in JSON Resume format (https://jsonresume.org/schema/).

Extract as much detail as possible:
- Basics: name, email, phone, location, summary
- Work experience: company, position, dates, description, highlights
- Education: institution, degree, field, dates, GPA if available
- Skills: name, level, keywords
- Projects: name, description, highlights, URL
- Languages: language, fluency

If information is not present in the text, omit the field rather than guessing. Output valid JSON only, with no markdown formatting or code fences.`;

/**
 * System prompt for updating resume based on suggestions.
 */
const RESUME_UPDATE_SYSTEM_PROMPT = `You are an expert resume optimization specialist. Your task is to take an existing JSON Resume and a set of improvement suggestions, and produce an updated JSON Resume that incorporates all suggestions to maximize the resume's effectiveness.

Rules:
- Keep ALL existing work, education, and project entries intact — only modify or add content as suggested
- Do NOT remove any existing entries unless a suggestion explicitly asks for it
- Update skills, summaries, descriptions, and highlights based on the suggestions
- Add quantified achievements, action verbs, and keywords where suggested
- Ensure the output conforms exactly to the JSON Resume schema (https://raw.githubusercontent.com/lfbn/json-resume-validator/refs/heads/master/data/resume-schema.json)
- Output valid JSON only, with no markdown formatting or code fences`;

/**
 * System prompt for exporting a resume as a beautifully formatted HTML page.
 */
const RESUME_EXPORT_SYSTEM_PROMPT = `You are an expert resume designer and HTML/CSS specialist. Your task is to take a JSON Resume and generate a complete, standalone HTML page that presents the resume in a professional, modern, print-ready format.

Design requirements:
- Clean, modern, ATS-friendly layout inspired by FAANG-level resume standards
- Use a professional color scheme with subtle accents (blues or teals)
- Responsive design that looks great both on screen and when printed
- Proper typography with clear hierarchy (name, section headers, body text)
- Include embedded CSS — no external dependencies
- Format work experience with bullet points, dates right-aligned
- Skills displayed as compact tags or a clean grid
- Education and projects sections as applicable
- Optimized for PDF printing (page breaks, margins, print-friendly colors)
- The HTML should be a complete document with <!DOCTYPE html>, <html>, <head>, and <body> tags
- Ensure the output conforms exactly to the JSON Resume schema (https://raw.githubusercontent.com/lfbn/json-resume-validator/refs/heads/master/data/resume-schema.json)
- Output the full HTML as a plain string — no JSON wrapper, no markdown, no code fences`;

export const openaiApi = {
  /**
   * Step 1: Parse and score the resume against the job description.
   * Returns match score and brief initial assessment.
   */
  async scoreResume(
    resumeText: string,
    jobDescription: string
  ): Promise<{
    score: number;
    assessmentSummary: string;
  }> {
    const client = createOpenAIClient();

    const userPrompt = `You are analyzing a resume against a job description. Provide a match score from 0-100 and a brief 1-2 sentence summary of the overall fit.

RESUME TEXT:
---
${resumeText}
---

JOB DESCRIPTION:
---
${jobDescription}
---

Respond with valid JSON only:
{
  "score": <number 0-100>,
  "assessmentSummary": "<1-2 sentence overall assessment>"
}`;

    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: ANALYZER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new ApiRequestError('OpenAI returned an empty response', 500);

    try {
      const parsed = JSON.parse(content) as { score: number; assessmentSummary: string };
      return {
        score: Math.min(100, Math.max(0, Math.round(parsed.score))),
        assessmentSummary: parsed.assessmentSummary || 'Assessment completed.',
      };
    } catch {
      throw new ApiRequestError('Failed to parse OpenAI score response', 500);
    }
  },

  /**
   * Step 2: Generate detailed feedback (strengths, weaknesses, suggestions).
   */
  async generateFeedback(
    resumeText: string,
    jobDescription: string,
    score: number
  ): Promise<Analysis['feedback']> {
    const client = createOpenAIClient();

    const userPrompt = `You are generating detailed resume feedback. The resume scored ${score}/100 against the job description.

RESUME TEXT:
---
${resumeText}
---

JOB DESCRIPTION:
---
${jobDescription}
---

Provide expert feedback as valid JSON only:
{
  "strengths": [
    "<specific strength #1 — reference actual content from the resume>",
    "<specific strength #2>",
    "<specific strength #3>"
  ],
  "weaknesses": [
    "<specific weakness or gap #1 — be brutally honest and constructive>",
    "<specific weakness #2>",
    "<specific weakness #3>"
  ],
  "suggestions": [
    "<actionable suggestion #1 — exactly what to change and why>",
    "<actionable suggestion #2>",
    "<actionable suggestion #3>",
    "<actionable suggestion #4>"
  ],
  "matchingSkills": [
    "<skill from resume that matches the job description #1>",
    "<skill #2>",
    "<skill #3>"
  ],
  "skillGaps": [
    "<skill mentioned in job description that is missing or weak in resume #1>",
    "<skill gap #2>",
    "<skill gap #3>"
  ],
  "improvementRecommendations": [
    "<specific action to improve score #1>",
    "<recommendation #2>",
    "<recommendation #3>"
  ]
}

Requirements:
- Strengths MUST reference actual content from the resume (specific projects, technologies, achievements)
- Weaknesses MUST be specific to this resume and job description, not generic
- Suggestions must be concrete, actionable steps the candidate can take immediately
- matchingSkills: list specific skills from the resume that closely match what the job description asks for
- skillGaps: list specific skills required by the job description that are absent or underdeveloped in the resume
- improvementRecommendations: concrete actions to increase the match score
- Include 3 strengths, 3 weaknesses, 3-4 suggestions, 3-5 matching skills, 2-4 skill gaps, and 2-3 improvement recommendations
- Be professional but direct — this is career-defining feedback`;

    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: ANALYZER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new ApiRequestError('OpenAI returned an empty response', 500);

    try {
      const parsed = JSON.parse(content) as Analysis['feedback'];
      return {
        strengths: parsed.strengths?.slice(0, 5) || [],
        weaknesses: parsed.weaknesses?.slice(0, 5) || [],
        suggestions: parsed.suggestions?.slice(0, 6) || [],
        matchingSkills: parsed.matchingSkills?.slice(0, 8) || [],
        skillGaps: parsed.skillGaps?.slice(0, 6) || [],
        improvementRecommendations: parsed.improvementRecommendations?.slice(0, 5) || [],
      };
    } catch {
      throw new ApiRequestError('Failed to parse OpenAI feedback response', 500);
    }
  },

  /**
   * Step 3: Generate tailored interview questions.
   */
  async generateInterviewQuestions(
    resumeText: string,
    jobDescription: string
  ): Promise<Analysis['interviewQuestions']> {
    const client = createOpenAIClient();

    const userPrompt = `You are a senior technical interviewer preparing questions for a candidate. Based on their resume and the job description, generate targeted interview questions.

RESUME TEXT:
---
${resumeText}
---

JOB DESCRIPTION:
---
${jobDescription}
---

Generate interview questions as valid JSON only:
{
  "questions": [
    {
      "question": "<specific, detailed interview question that references content from the resume>",
      "category": "Technical | Behavioral | System Design | Leadership | Cultural Fit",
      "difficulty": "easy | medium | hard"
    }
  ]
}

Requirements:
- Each question must reference specific experience or skills from the resume
- Mix of technical, behavioral, and cultural fit questions
- Include 4-6 questions with varied difficulty
- Questions should feel like they come from a real hiring manager who has read the resume
- Avoid generic questions — make them personal to this candidate`;

    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: ANALYZER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new ApiRequestError('OpenAI returned an empty response', 500);

    try {
      const parsed = JSON.parse(content) as { questions: Analysis['interviewQuestions'] };
      return (parsed.questions || []).slice(0, 8);
    } catch {
      throw new ApiRequestError('Failed to parse OpenAI interview questions response', 500);
    }
  },

  /**
   * Single comprehensive analysis call (fallback / combined approach).
   */
  async analyzeResume(
    resumeText: string,
    jobDescription: string,
    onProgress?: (step: string, status: 'in-progress' | 'done') => void
  ): Promise<{
    score: number;
    feedback: Analysis['feedback'];
    interviewQuestions: Analysis['interviewQuestions'];
  }> {
    // Step 1: Score
    onProgress?.('score', 'in-progress');
    const { score } = await this.scoreResume(resumeText, jobDescription);
    onProgress?.('score', 'done');

    // Step 2: Feedback
    onProgress?.('feedback', 'in-progress');
    const feedback = await this.generateFeedback(resumeText, jobDescription, score);
    onProgress?.('feedback', 'done');

    // Step 3: Interview Questions
    onProgress?.('questions', 'in-progress');
    const interviewQuestions = await this.generateInterviewQuestions(
      resumeText,
      jobDescription
    );
    onProgress?.('questions', 'done');

    return { score, feedback, interviewQuestions };
  },

  async convertToJsonResume(resumeText: string): Promise<JsonResume> {
    const client = createOpenAIClient();

    const userPrompt = `Parse the following resume text and convert it to JSON Resume format. You MUST strictly adhere to the official JSON Resume schema defined at:
https://raw.githubusercontent.com/lfbn/json-resume-validator/refs/heads/master/data/resume-schema.json

RESUME TEXT:
---
${resumeText}
---

Respond with valid JSON only that conforms exactly to the schema at the URL above. Include these fields where present in the text: basics (name, email, phone, location, summary), work (company, position, startDate, endDate, summary, highlights), education (institution, area, studyType, startDate, endDate), skills (name, level, keywords), projects, and languages. Omit any fields where information is not available. The response must be valid JSON only, with no markdown formatting or code fences.`;

    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: JSON_RESUME_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new ApiRequestError('OpenAI returned an empty response', 500);

    try {
      const parsed = JSON.parse(content) as JsonResume;
      const result = jsonResumeSchema.safeParse(parsed);
      return result.success ? (result.data as JsonResume) : parsed;
    } catch {
      throw new ApiRequestError('Failed to parse OpenAI JSON Resume response', 500);
    }
  },

  /**
   * Updates a JSON Resume schema based on improvement suggestions.
   * Excludes biographical data (basics) — only work, education, skills, projects, etc.
   */
  async updateResumeWithSuggestions(
    jsonResume: JsonResume,
    suggestions: string[]
  ): Promise<JsonResume> {
    const client = createOpenAIClient();

    // Extract bio data to preserve separately
    const { basics, ...resumeWithoutBasics } = jsonResume;

    const userPrompt = `Update the following JSON Resume schema based on the improvement suggestions provided. You MUST strictly adhere to the official JSON Resume schema defined at:
https://raw.githubusercontent.com/lfbn/json-resume-validator/refs/heads/master/data/resume-schema.json

Keep ALL existing entries intact — only modify or add content as the suggestions dictate.

IMPROVEMENT SUGGESTIONS:
${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

CURRENT RESUME (excluding biographical data):
${JSON.stringify(resumeWithoutBasics, null, 2)}

Respond with valid JSON only — the updated resume schema (excluding basics/biographical data) that conforms exactly to the schema at the URL above. Include the same structure and all existing fields, with modifications per the suggestions.`;

    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: RESUME_UPDATE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new ApiRequestError('OpenAI returned an empty response', 500);

    try {
      const updatedSections = JSON.parse(content) as Partial<JsonResume>;

      // Merge updated sections back with preserved basics
      const merged: JsonResume = {
        $schema: jsonResume.$schema,
        basics,
        ...updatedSections,
      };

      const result = jsonResumeSchema.safeParse(merged);
      return result.success ? (result.data as JsonResume) : merged;
    } catch {
      throw new ApiRequestError('Failed to parse OpenAI resume update response', 500);
    }
  },

  /**
   * Generates a beautifully formatted HTML page from a JSON Resume.
   * Uses OpenAI to create a professional, print-ready resume document.
   */
  async exportResumeHtml(jsonResume: JsonResume): Promise<string> {
    const client = createOpenAIClient();

    const userPrompt = `Generate a complete, standalone HTML page for the following JSON Resume. The HTML should be a professional, modern, print-optimized resume document with embedded CSS.

JSON RESUME:
${JSON.stringify(jsonResume, null, 2)}

Respond with ONLY the complete HTML string. No markdown formatting, no code fences, no JSON wrapper — just the raw HTML.`;

    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: RESUME_EXPORT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new ApiRequestError('OpenAI returned an empty response', 500);

    // Strip any markdown code fences if they appear despite instructions
    let html = content.trim();
    if (html.startsWith('```html')) html = html.slice(7);
    else if (html.startsWith('```')) html = html.slice(3);
    if (html.endsWith('```')) html = html.slice(0, -3);
    html = html.trim();

    // Ensure it's a valid HTML document
    if (!html.toLowerCase().startsWith('<!doctype') && !html.toLowerCase().startsWith('<html')) {
      html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${jsonResume.basics?.name || 'Resume'} — Resume</title>
<style>
body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a2e;line-height:1.6}
h1{font-size:28px;font-weight:700;margin-bottom:4px}
h2{font-size:18px;font-weight:600;margin:24px 0 12px;border-bottom:2px solid #e5e7eb;padding-bottom:6px}
</style>
</head>
<body>${html}</body></html>`;
    }

    return html;
  },
};
