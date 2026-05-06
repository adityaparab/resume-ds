import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { FileDown, FileText, Download, ChevronDown, Loader2 } from 'lucide-react';
import type { JsonResume } from '@/types';
import { openaiApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ResumeDownloadDropdownProps {
  jsonResume: JsonResume;
  label?: string;
}

export function ResumeDownloadDropdown({
  jsonResume,
  label = 'Download Resume',
}: ResumeDownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRenderedHtml = async (): Promise<string> => {
    try {
      return await openaiApi.exportResumeHtml(jsonResume);
    } catch {
      // Fallback to inline renderer if OpenAI fails
      toast.error('AI export failed, using fallback renderer');
      return generateFallbackHtml(jsonResume);
    }
  };

  const downloadHtml = async () => {
    setIsExporting('html');
    try {
      const html = await fetchRenderedHtml();
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${jsonResume.basics?.name || 'resume'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsOpen(false);
    } finally {
      setIsExporting(null);
    }
  };

  const downloadPdf = async () => {
    setIsExporting('pdf');
    try {
      const html = await fetchRenderedHtml();
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow pop-ups to download the PDF');
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        setIsOpen(false);
      }, 500);
    } finally {
      setIsExporting(null);
    }
  };

  const downloadDocx = async () => {
    setIsExporting('docx');
    try {
      const html = await fetchRenderedHtml();
      const docxContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><title>Resume</title></head>
      <body>${html}</body></html>`;
      const blob = new Blob([docxContent], {
        type: 'application/msword;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${jsonResume.basics?.name || 'resume'}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsOpen(false);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
        disabled={!!isExporting}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        {isExporting ? `Generating ${isExporting.toUpperCase()}...` : label}
        {!isExporting && (
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </Button>

      {isOpen && !isExporting && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-surface-200 bg-white shadow-lg dark:border-surface-300 dark:bg-surface-50">
          <button
            onClick={downloadHtml}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-200"
          >
            <FileText className="h-4 w-4 text-brand-500" />
            <div>
              <p className="font-medium">HTML</p>
              <p className="text-xs text-surface-400">Full web page</p>
            </div>
          </button>
          <button
            onClick={downloadPdf}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-200"
          >
            <FileDown className="h-4 w-4 text-red-500" />
            <div>
              <p className="font-medium">PDF</p>
              <p className="text-xs text-surface-400">Print to PDF</p>
            </div>
          </button>
          <button
            onClick={downloadDocx}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-200"
          >
            <Download className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium">DOCX</p>
              <p className="text-xs text-surface-400">Word document</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Fallback inline HTML renderer when OpenAI API is unavailable.
 */
function generateFallbackHtml(resume: JsonResume): string {
  const b = resume.basics;
  const name = b?.name || 'Resume';
  const summary = b?.summary || '';
  const skills = resume.skills || [];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — Resume</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;color:#1a1a2e;background:#fff;padding:40px;max-width:800px;margin:0 auto;line-height:1.6}
h1{font-size:28px;font-weight:700;margin-bottom:4px}
h2{font-size:18px;font-weight:600;margin:24px 0 12px;border-bottom:2px solid #e5e7eb;padding-bottom:6px}
.work-item{margin-bottom:16px}
.work-item h3{font-size:16px;font-weight:600}
.work-item .meta{font-size:13px;color:#6b7280;margin-bottom:4px}
.skill-tag{display:inline-block;background:#eef2ff;color:#4338ca;padding:2px 10px;border-radius:12px;font-size:13px;margin:2px}
@media print{body{padding:20px}@page{margin:0.5in}}
</style>
</head>
<body>
<h1>${name}</h1>
${b?.email ? `<p style="color:#6b7280;font-size:14px">${b.email}${b?.phone ? ' · ' + b.phone : ''}${b?.location?.city ? ' · ' + b.location.city : ''}</p>` : ''}
${summary ? `<p style="margin-top:12px;color:#374151">${summary}</p>` : ''}
${resume.work?.length ? `<h2>Experience</h2>${resume.work.map(w => `<div class="work-item"><h3>${w.position} at ${w.name}</h3><div class="meta">${w.startDate} — ${w.endDate || 'Present'}</div>${w.summary ? `<p style="font-size:14px;color:#374151;margin-top:4px">${w.summary}</p>` : ''}${w.highlights?.length ? `<ul style="margin-top:6px;padding-left:20px">${w.highlights.map(h => `<li style="font-size:14px;color:#4b5563">${h}</li>`).join('')}</ul>` : ''}</div>`).join('')}` : ''}
${resume.education?.length ? `<h2>Education</h2>${resume.education.map(e => `<div class="work-item"><h3>${e.area} — ${e.institution}</h3><div class="meta">${e.studyType} · ${e.startDate} — ${e.endDate || 'Present'}${e.score ? ' · ' + e.score : ''}</div></div>`).join('')}` : ''}
${skills.length ? `<h2>Skills</h2><div>${skills.map(s => `<span class="skill-tag">${s.name}${s.level ? ' (' + s.level + ')' : ''}</span>`).join('')}</div>` : ''}
</body></html>`;
}
