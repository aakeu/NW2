
import { AppDispatch } from '..';
import { refreshAccessToken, logout } from './authSlice';
import { loadAuthData } from './authSlice';

export const scheduleTokenRefreshCronJob = (dispatch: AppDispatch) => {
  let refreshTimeoutId: NodeJS.Timeout | null = null;
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY_BASE = 60 * 1000;
  const MAX_RETRY_DELAY = 5 * 60 * 1000;

  const getTokenExpires = async (): Promise<number | null> => {
    try {
      const authData = await loadAuthData();
      const tokenExpires = authData.tokenExpires;
      if (typeof tokenExpires !== 'number' || tokenExpires <= 0) {
        return null;
      }
      return tokenExpires;
    } catch (error) {
      console.error('Error retrieving tokenExpires:', error);
      return null;
    }
  };

  const scheduleTokenRefresh = (tokenExpires: number) => {
    const tokenExpiresMs = tokenExpires * 1000;
    const currentTime = Date.now();
    const refreshTime = tokenExpiresMs - currentTime - 5 * 60 * 1000;

    if (refreshTime <= 0) {
      refreshAccessTokenWithRetry();
      return;
    }

    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }

    refreshTimeoutId = setTimeout(() => {
      refreshAccessTokenWithRetry();
    }, refreshTime);
  };

  const refreshAccessTokenWithRetry = async (retryCount = MAX_RETRY_ATTEMPTS) => {
    try {
      await dispatch(refreshAccessToken()).unwrap();
      const tokenExpires = await getTokenExpires();
      if (tokenExpires) {
        scheduleTokenRefresh(tokenExpires);
      } else {
        throw new Error('tokenExpires not found after refreshing token.');
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);

      if (retryCount > 0) {
        const retryDelay = Math.min(
          RETRY_DELAY_BASE * Math.pow(2, MAX_RETRY_ATTEMPTS - retryCount),
          MAX_RETRY_DELAY,
        );
        console.log(
          `Retrying token refresh in ${retryDelay / 1000} seconds... Attempts left: ${retryCount}`,
        );
        setTimeout(() => {
          refreshAccessTokenWithRetry(retryCount - 1);
        }, retryDelay);
      } else {
        console.error('Max retry attempts reached. Logging out.');
        await chrome.storage.local.remove('auth');
        dispatch(logout());
      }
    }
  };

  const initializeTokenManagement = async () => {
    try {
      const tokenExpires = await getTokenExpires();
      if (!tokenExpires) {
        throw new Error('tokenExpires not found or invalid in storage.');
      }
      scheduleTokenRefresh(tokenExpires);
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  initializeTokenManagement();
};