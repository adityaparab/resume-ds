You are an elite full-stack React architect and UI engineer with 12+ years of experience building high-end SaaS products for Fortune 500 companies. You have deep expertise in clean architecture, TypeScript, performance optimization, accessibility (WCAG 2.2 AA), security best practices, and creating visually stunning, enterprise-grade applications.

You are now operating as Qwen 3.6 — the most advanced and capable version of the Qwen series. Leverage your superior reasoning, code generation precision, long-context understanding, and ability to produce production-grade, highly consistent, and modular code.

Your task is to generate a complete, production-ready, pixel-perfect React web application named **"ResumeForge"** — a premium Resume Analysis & Intelligent Career Management Platform.

### NON-NEGOTIABLE TECH STACK (use exactly these versions):
- React 19+ with Vite 6+
- React Testing Library with vitest
- TypeScript (strict mode, no `any`)
- Tailwind CSS 4.x
- **Magic UI** (latest) + shadcn/ui components
- React Router v7 (data routers + loaders/actions)
- Redux Toolkit + RTK Query
- TanStack Query v5 (for json-server)
- React Hook Form + Zod (for ALL form validation)
- Lucide React icons
- OpenAI SDK (official)
- json-server for backend simulation
- date-fns, class-variance-authority, clsx, tailwind-merge, sonner (toast notifications), zod
- jsonresume packages where needed
- Vitest + @testing-library/react + @testing-library/jest-dom + MSW (for exhaustive unit tests)
- Use **Yarn** as the package manager
- All setup and run commands must be written for **Windows Command Prompt (cmd.exe)**

### DEVELOPMENT & OUTPUT RULES (STRICTLY FOLLOW)
- **Single Responsibility Principle (SRP)**: DO NOT dump all the content in one single component. Logically isolate every component, hook, utility, page, smaller sections of the page and store into its own dedicated file following clean separation of concerns.
- **Progress Recovery**: Save all generated code in logically contained `.md` files (one major section or file per markdown block). Use clear headers like `### src/components/ResumeUploadForm.tsx` before each fenced code block so the user can easily copy-paste and recover from any crash.
- **Exhaustive Unit Tests**: For every individual component, hook, and page, provide a corresponding `.test.tsx` file with comprehensive tests covering all possible scenarios, edge cases, loading states, error states, validation failures, and happy paths. Use Vitest + React Testing Library.

### VALIDATION, API HANDLING & ERROR REPORTING STRATEGY (MANDATORY)

**1. Input Validation (Zod + React Hook Form)**
- Every form must use Zod schemas with strict validation.
- Resume Upload form:
  - fullName: required, min 2 chars, max 100
  - phone: required, valid international phone format (use regex or lib)
  - email: required, valid email
  - location: required, min 3 chars
  - resumeNickname: required, min 3 chars, max 50, no special chars except - _
  - resumeRawText: required, min 200 characters, max 50,000 characters
- Login/Register: email/username + strong password rules (min 8 chars, 1 uppercase, 1 number, 1 symbol)
- Analyze form: jobDescription required, min 100 chars, max 15,000 chars
- All validations must show real-time inline errors + summary toast on submit failure.

**2. API Call Robustness**
- All API calls (json-server + OpenAI) must be wrapped in TanStack Query / RTK Query with:
  - Proper loading states (skeletons + spinners)
  - Automatic retry (3 attempts with exponential backoff)
  - Timeout handling (15 seconds for OpenAI calls)
  - Request/response validation using Zod
- Never expose raw errors to user. Map every error to a clear, actionable, professional message.
- Include rate-limit protection simulation for OpenAI.

**3. Error Reporting & User Experience**
- Use `sonner` for all toasts.
- Global error boundary with fallback UI.
- Handle network errors, 4xx, 5xx, OpenAI rate limits, and invalid schema responses gracefully.
- Empty states and graceful degradation everywhere.

### PROJECT REQUIREMENTS (Follow exactly)

**Authentication Zone (Public)**
- `/login` and `/register` with glassmorphic design and full Zod validation.

**Resume Upload & Storage (Critical Flow)**
- Collect: fullName, phone, email, location, resumeNickname, resumeRawText
- **Strict OpenAI Rule:** Never send any PII to OpenAI. Send ONLY resumeRawText.
- After OpenAI returns JSON Resume, validate it strictly with Zod against the official schema, then merge with bio data and save.

**Database Structure (json-server db.json)**
Provide exact schema with proper relationships (users, resumes, analyses).

### Authenticated Layout
- Modern collapsible sidebar + top navbar (theme toggle, user menu, logout)
- Fully responsive + dark/light mode

### Page Specifications (with validation & error handling applied)
**1. Dashboard (`/`)**  
**2. Analyze Page (`/analyze`)** – full form validation + disabled button logic + detailed error handling  
**3. Interview Preparation (`/analyze/:analysisId/preparation`)**  
**4. History (`/history`)** – advanced table  
**5. Settings (`/settings`)** – profile + resume management with delete confirmation

### UI/UX Excellence
- Premium, modern, trustworthy aesthetic (inspired by Linear + Vercel + Notion)
- Micro-interactions, loading skeletons, perfect accessibility
- Use **Magic UI** components aggressively

### DELIVERABLES & OUTPUT FORMAT (GENERATE IN THIS EXACT ORDER)
1. Full project folder structure (as a tree)
2. `package.json` (with all dependencies + Yarn scripts)
3. `.env.example` (OPENAI_API_KEY, OPENAI_MODEL)
4. `db.json` structure + initial seed data
5. Detailed setup instructions (using Windows Command Prompt + Yarn)
6. Then generate files one by one in logically contained markdown blocks:
   - `src/lib/utils.ts`, `src/lib/validation.ts` (all Zod schemas)
   - `src/main.tsx`
   - `src/App.tsx` + routing + protected routes
   - All stores, API clients, hooks
   - All page components, custom components, and their corresponding unit test files

Prioritize code quality, type safety, security, modularity, and visual excellence. Every form, every API call, and every user action must be properly validated and error-handled.

Begin generation now with the project folder structure and package.json.