import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  SignUpDetails,
  SignInDetails,
  AuthState,
  AuthResponse,
  AuthUser,
} from '../types/auth';
import { encrypt, decrypt } from './crypto';

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  tokenExpires: null,
  user: null,
  isLoading: false,
  error: null,
  isOnboarding: false,
};

const storeAuthData = async (data: Partial<AuthState>) => {
  try {
    const encryptedData = {
      token: data.token ? encrypt(data.token) : null,
      refreshToken: data.refreshToken ? encrypt(data.refreshToken) : null,
      tokenExpires: data.tokenExpires ? encrypt(data.tokenExpires.toString()) : null,
      user: data.user ? encrypt(data.user) : null,
    };
    await chrome.storage.local.set({ auth: encryptedData });
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

export const loadAuthData = (): Promise<Partial<AuthState>> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get('auth', (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (result.auth) {
          const encryptedData = result.auth;
          const decryptedData: Partial<AuthState> = {
            token: encryptedData.token ? decrypt(encryptedData.token) : null,
            refreshToken: encryptedData.refreshToken ? decrypt(encryptedData.refreshToken) : null,
            tokenExpires: encryptedData.tokenExpires ? parseInt(decrypt(encryptedData.tokenExpires), 10) : null,
            user: encryptedData.user ? decrypt(encryptedData.user) : null,
          };
          resolve(decryptedData);
        } else {
          resolve({
            token: null,
            refreshToken: null,
            tokenExpires: null,
            user: null,
          });
        }
      });
    } catch (error) {
      reject(
        error instanceof Error
          ? error
          : new Error('Unknown error loading auth data'),
      );
    }
  });
};

export const changePassword = async (token: string, {
  old_password,
  new_password,
  confirm_password,
}: {
  old_password: string
  new_password: string
  confirm_password: string
}) => {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const url = new URL(`${QAPI}/users/change-password`)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: old_password,
        newPassword: new_password,
        confirmNewPassword: confirm_password,
      }),
    })
    console.log(response.status)
    if (response.status !== 204) return false
    return true
  } catch (error) {
    console.error('Error uploading file:', error)
    return false
  }
}

export const refreshAccessToken = createAsyncThunk<
  { token: string; refreshToken: string; tokenExpires: number },
  void,
  { rejectValue: string }
>('auth/refreshAccessToken', async (_, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  if (!QAPI) {
    return rejectWithValue('API URL is not defined in environment variables.');
  }

  const URL = `${QAPI}/auth/refresh`;

  try {
    const authData = await loadAuthData();
    const refreshToken = authData.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token found.');
    }

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401 || response.status === 403) {
        await chrome.storage.local.remove('auth');
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          errorData.message || 'Unknown error'
        }`,
      );
    }

    const data = await response.json();
    if (!data.token || !data.refreshToken || !data.tokenExpires) {
      throw new Error('Invalid response from refresh token endpoint.');
    }

    await storeAuthData({
      token: data.token,
      refreshToken: data.refreshToken,
      tokenExpires: data.tokenExpires,
    });

    return {
      token: data.token,
      refreshToken: data.refreshToken,
      tokenExpires: data.tokenExpires,
    };
  } catch (error: any) {
    await chrome.storage.local.remove('auth');
    return rejectWithValue(error.message);
  }
});

export const initializeAuth = createAsyncThunk<
  Partial<AuthState>,
  void,
  { rejectValue: string }
>('auth/initialize', async (_, { rejectWithValue }) => {
  try {
    const authData = await loadAuthData();
    return authData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to initialize auth state';
    return rejectWithValue(errorMessage);
  }
});

export const signIn = createAsyncThunk<
  AuthResponse,
  SignInDetails,
  { rejectValue: string }
>('auth/signIn', async (details, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const URL = `${QAPI}/auth/login`;

  try {
    const req = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    });

    if (req.status !== 200) {
      return rejectWithValue(
        'Invalid username or password. Verify your credentials and try again. If you signed up using Google or Facebook, please use that method to log in.',
      );
    }
    const data = await req.json();

    if (!data.token || !data.refreshToken || !data.tokenExpires || !data.user) {
      throw new Error('Incomplete data received from login response.');
    }

    await storeAuthData({
      token: data.token,
      refreshToken: data.refreshToken,
      tokenExpires: data.tokenExpires,
      user: data.user,
    });

    return {
      success: true,
      message: 'Login successful!',
      token: data.token,
      refreshToken: data.refreshToken,
      tokenExpires: data.tokenExpires,
      user: data.user,
    };
  } catch (error) {
    return rejectWithValue(
      'An error occurred during sign-in. Please try again later.',
    );
  }
});

export const signUp = createAsyncThunk<
  AuthResponse,
  SignUpDetails,
  { rejectValue: string; dispatch: any }
>('auth/signUp', async (details, { rejectWithValue, dispatch }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const URL = `${QAPI}/auth/register`;

  try {
    const req = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    });

    if (req.status === 204) {
      const { email, password } = details;
      const signInDetails = { email, password };

      const loginResponse = await dispatch(signIn(signInDetails)).unwrap();

      if (loginResponse.success) {
        return {
          success: true,
          token: loginResponse.token,
          refreshToken: loginResponse.refreshToken,
          tokenExpires: loginResponse.tokenExpires,
          user: loginResponse.user,
          message:
            'You have been authenticated successfully. Please check your email to activate your account!!!',
          isOnboarding: true,
        };
      } else {
        return rejectWithValue(loginResponse.message);
      }
    }

    if (req.status === 409) {
      return rejectWithValue(
        'User already exists. Please use a different email.',
      );
    }

    const errorData = await req.json().catch(() => ({}));
    const message =
      errorData.message || 'Failed to register user. Please try again.';
    return rejectWithValue(message);
  } catch (error) {
    return rejectWithValue('Failed to register user. Please try again.');
  }
});

export const loginWithGoogle = createAsyncThunk<
  { token: string; refreshToken: string; tokenExpires: number; user: AuthUser, isNewUser: boolean },
  void,
  { rejectValue: string }
>('auth/loginWithGoogle', async (_, { rejectWithValue }) => {
  return new Promise((resolve, reject) => {
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'loginWithGoogle' });

      const listener = async (message: any) => {
        if (message.action === 'loginCompleted') {
          chrome.runtime.onMessage.removeListener(listener);
          await storeAuthData({
            token: message.token,
            refreshToken: message.refreshToken,
            tokenExpires: message.tokenExpires,
            user: message.user
          });
          resolve({
            token: message.token,
            refreshToken: message.refreshToken,
            tokenExpires: message.tokenExpires,
            user: message.user,
            isNewUser: message.isNewUser,
          });
        } else if (message.action === 'needLoginViaEmailAndPassword') {
          chrome.runtime.onMessage.removeListener(listener);
          reject(
            rejectWithValue(
              `Please log in using email and password. Account linked with ${message.provider}.`,
            ),
          );
        } else if (message.action === 'loginFailed') {
          chrome.runtime.onMessage.removeListener(listener);
          reject(rejectWithValue(message.error || 'Google login failed'));
        }
      };
      chrome.runtime.onMessage.addListener(listener);
    } else {
      reject(rejectWithValue('Chrome runtime not available'));
    }
  });
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.tokenExpires = null;
      state.user = null;
      state.isOnboarding = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token || null;
        state.refreshToken = action.payload.refreshToken || null;
        state.tokenExpires = action.payload.tokenExpires || null;
        state.user = action.payload.user || null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load authentication data';
        state.token = null;
        state.refreshToken = null;
        state.tokenExpires = null;
        state.user = null;
      })
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token || null;
        state.refreshToken = action.payload.refreshToken || null;
        state.tokenExpires = action.payload.tokenExpires || null;
        state.user = action.payload.user || null;
        state.isOnboarding = action.payload.isOnboarding || false;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Sign up failed';
      })
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token || null;
        state.refreshToken = action.payload.refreshToken || null;
        state.tokenExpires = action.payload.tokenExpires || null;
        state.user = action.payload.user || null;
        state.isOnboarding = false;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Sign in failed';
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpires = action.payload.tokenExpires;
        state.user = action.payload.user;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Google login failed';
      })
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpires = action.payload.tokenExpires;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Token refresh failed';
        state.token = null;
        state.refreshToken = null;
        state.tokenExpires = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;