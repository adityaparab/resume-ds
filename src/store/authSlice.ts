import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState, LoginFormData, RegisterFormData } from '@/types';
import { authApi, ApiRequestError } from '@/lib/api';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Load user from localStorage on initial load
const storedUser = localStorage.getItem('resumeforge_user');
if (storedUser) {
  try {
    const parsed = JSON.parse(storedUser) as User;
    initialState.user = parsed;
    initialState.isAuthenticated = true;
  } catch {
    localStorage.removeItem('resumeforge_user');
  }
}

export const loginUser = createAsyncThunk<
  User,
  LoginFormData,
  { rejectValue: string }
>('auth/login', async (data, { rejectWithValue }) => {
  try {
    const user = await authApi.login(data.email, data.password);
    localStorage.setItem('resumeforge_user', JSON.stringify(user));
    return user;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Login failed. Please try again.');
  }
});

export const registerUser = createAsyncThunk<
  User,
  RegisterFormData,
  { rejectValue: string }
>('auth/register', async (data, { rejectWithValue }) => {
  try {
    const user = await authApi.register(
      data.username,
      data.email,
      data.password,
      data.fullName
    );
    localStorage.setItem('resumeforge_user', JSON.stringify(user));
    return user;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Registration failed. Please try again.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('resumeforge_user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? 'Login failed';
    });
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? 'Registration failed';
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
