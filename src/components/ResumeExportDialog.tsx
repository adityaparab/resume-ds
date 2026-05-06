import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { FileText, FileDown, Loader2, Download, X, Eye } from 'lucide-react';
import type { JsonResume } from '@/types';

type ExportFormat = 'html' | 'pdf' | 'docx';

interface ResumeExportDialogProps {
  jsonResume: JsonResume;
  onClose: () => void;
}

export function ResumeExportDialog({ jsonResume, onClose }: ResumeExportDialogProps) {
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderResume();
  }, [jsonResume]);

  const renderResume = async () => {
    setIsRendering(true);
    setRenderError(null);
    try {
      const themeName =
        import.meta.env.VITE_JSON_RESUME_THEME || 'jsonresume-theme-even';

      // Dynamically import the theme
      const themeModule = await import(/* @vite-ignore */ themeName);
      const renderFn = themeModule.render || themeModule.default?.render;

      if (typeof renderFn !== 'function') {
        throw new Error(`Theme '${themeName}' does not export a render function`);
      }

      const html = renderFn(jsonResume);
      setRenderedHtml(html);
    } catch (err) {
      // Fallback: render with simple inline template
      setRenderError(
        err instanceof Error ? err.message : 'Failed to render resume'
      );
      setRenderedHtml(generateFallbackHtml(jsonResume));
    } finally {
      setIsRendering(false);
    }
  };

  const downloadAsHtml = () => {
    if (!renderedHtml) return;
    const blob = new Blob([renderedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jsonResume.basics?.name || 'resume'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPdf = () => {
    if (!renderedHtml) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to download the PDF');
      return;
    }
    printWindow.document.write(renderedHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const downloadAsDocx = () => {
    if (!renderedHtml) return;
    // Save HTML as .doc — Word can open HTML files
    const docxContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><title>Resume</title></head>
      <body>${renderedHtml}</body></html>`;
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
  };

  const handleExport = (format: ExportFormat) => {
    switch (format) {
      case 'html':
        downloadAsHtml();
        break;
      case 'pdf':
        downloadAsPdf();
        break;
      case 'docx':
        downloadAsDocx();
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between shrink-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-500" />
              Export Updated Resume
            </CardTitle>
            <CardDescription>
              Preview and download your optimized resume
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto space-y-4">
          {/* Preview */}
          <div className="rounded-lg border border-surface-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2 border-b border-surface-200 bg-surface-50 px-4 py-2">
              <Eye className="h-4 w-4 text-surface-400" />
              <span className="text-xs font-medium text-surface-500">PREVIEW</span>
              {isRendering && (
                <span className="ml-auto flex items-center gap-1 text-xs text-surface-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Rendering...
                </span>
              )}
            </div>
            <div
              ref={previewRef}
              className="resume-preview max-h-[400px] overflow-auto p-4"
              style={{ transformOrigin: 'top center' }}
            >
              {isRendering ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-surface-300" />
                </div>
              ) : renderedHtml ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderedHtml
                      .replace(/<style>/gi, '<style> body { transform: scale(0.8); transform-origin: top center; }')
                  }}
                />
              ) : (
                <p className="text-center text-surface-400 py-8">
                  Failed to render preview
                </p>
              )}
            </div>
          </div>

          {renderError && (
            <p className="text-xs text-amber-600">
              Note: {renderError}. Using fallback renderer.
            </p>
          )}

          {/* Export options */}
          <div>
            <p className="mb-3 text-sm font-medium text-surface-700">
              Download as:
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleExport('html')}
                disabled={!renderedHtml}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-surface-200 p-4 transition-all hover:border-brand-300 hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed dark:hover:border-brand-700 dark:hover:bg-brand-950"
              >
                <FileText className="h-8 w-8 text-brand-500" />
                <span className="text-sm font-medium text-surface-700">HTML</span>
                <span className="text-xs text-surface-400">Full web page</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={!renderedHtml}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-surface-200 p-4 transition-all hover:border-red-300 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed dark:hover:border-red-700 dark:hover:bg-red-950"
              >
                <FileDown className="h-8 w-8 text-red-500" />
                <span className="text-sm font-medium text-surface-700">PDF</span>
                <span className="text-xs text-surface-400">Print to PDF</span>
              </button>
              <button
                onClick={() => handleExport('docx')}
                disabled={!renderedHtml}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-surface-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed dark:hover:border-blue-700 dark:hover:bg-blue-950"
              >
                <Download className="h-8 w-8 text-blue-500" />
                <span className="text-sm font-medium text-surface-700">DOCX</span>
                <span className="text-xs text-surface-400">Word document</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-surface-50 p-3 text-xs text-surface-500">
            <p className="flex items-center gap-1">
              <strong>Theme:</strong>{' '}
              {import.meta.env.VITE_JSON_RESUME_THEME || 'jsonresume-theme-even'}
              {' · '}
              <strong>Name:</strong> {jsonResume.basics?.name || 'Unnamed'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Fallback HTML renderer if the theme module fails to load in browser.
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
.section{margin-bottom:20px}
.work-item{margin-bottom:16px}
.work-item h3{font-size:16px;font-weight:600}
.work-item .meta{font-size:13px;color:#6b7280;margin-bottom:4px}
.skill-tag{display:inline-block;background:#eef2ff;color:#4338ca;padding:2px 10px;border-radius:12px;font-size:13px;margin:2px}
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
