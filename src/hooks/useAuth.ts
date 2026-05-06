import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './useAppStore';
import { loginUser, registerUser, logout, clearError } from '@/store/authSlice';
import type { LoginFormData, RegisterFormData } from '@/types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = useCallback(
    async (data: LoginFormData) => {
      const result = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(result)) {
        navigate('/', { replace: true });
        return true;
      }
      return false;
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (data: RegisterFormData) => {
      const result = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(result)) {
        navigate('/', { replace: true });
        return true;
      }
      return false;
    },
    [dispatch, navigate]
  );

  const signOut = useCallback(() => {
    dispatch(logout());
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    signOut,
    dismissError,
  };
}
