import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';

interface NavbarProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

export function Navbar({ onThemeToggle, isDark }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-200 bg-white/80 px-6 backdrop-blur-xl dark:border-surface-300 dark:bg-surface-50/80">
      <div>
        <h1 className="text-lg font-semibold text-surface-900">
          Welcome back, {user?.fullName?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-xs text-surface-500">
          Let's advance your career today
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-200 dark:hover:text-surface-300"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2 border-l border-surface-200 pl-3 dark:border-surface-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden text-sm font-medium text-surface-700 sm:block dark:text-surface-300">
            {user?.fullName || 'User'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 text-surface-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}
