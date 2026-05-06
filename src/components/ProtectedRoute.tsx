import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppStore';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
