import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('resumeforge_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('resumeforge_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 dark:bg-surface-50 dark:text-surface-900">
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme={isDark ? 'dark' : 'light'}
      />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div
        className={cn(
          'flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Navbar onThemeToggle={toggleTheme} isDark={isDark} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
