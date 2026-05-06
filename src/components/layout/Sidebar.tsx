import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyze', icon: Sparkles, label: 'Analyze' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
] as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-surface-200 bg-white transition-all duration-300 dark:border-surface-300 dark:bg-surface-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-surface-200 dark:border-surface-300',
          collapsed ? 'justify-center' : 'gap-3 px-5'
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
          <FileText className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-surface-900">
            ResumeForge
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-200 dark:hover:text-surface-50',
                collapsed && 'justify-center px-0'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-surface-200 p-3 dark:border-surface-300">
        <button
          onClick={onToggle}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-200 dark:hover:text-surface-300',
            collapsed && 'justify-center px-0'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
