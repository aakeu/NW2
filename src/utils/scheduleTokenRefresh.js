import { clearSecureStorage, getSecureToken } from "../api/auth.ts"
import { refreshToken } from "../api/default.js"

/**
 * Schedules a cron job to refresh the access token before it expires.
 */
export async function scheduleTokenRefreshCronJob() {
  let refreshTimeoutId = null
  const MAX_RETRY_ATTEMPTS = 3
  const RETRY_DELAY_BASE = 60 * 1000 // 1 minute
  const MAX_RETRY_DELAY = 5 * 60 * 1000 // 5 minutes

  /**
   * Retrieves the token expiration timestamp from secure storage.
   * @returns {Promise<number|null>} The token expiration time in UNIX timestamp (seconds) or null if not found.
   */
  async function getTokenExpires() {
    try {
      const tokenExpires = await getSecureToken('tokenExpires')
      if (typeof tokenExpires !== 'number' || tokenExpires <= 0) {
        // console.warn('Invalid tokenExpires value:', tokenExpires)
        return null
      }
      return tokenExpires
    } catch (error) {
      // console.error('Error retrieving tokenExpires:', error)
      return null
    }
  }

  /**
   * Schedules the token refresh based on the token's expiration time.
   * @param {number} tokenExpires - The expiration time of the token in UNIX timestamp (seconds).
   */
  function scheduleTokenRefresh(tokenExpires) {
    const tokenExpiresMs = tokenExpires * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const refreshTime = tokenExpiresMs - currentTime - 5 * 60 * 1000 // Refresh 5 minutes before expiration

    if (refreshTime <= 0) {
      // console.info(
      //   'Refresh time has passed or is too close. Refreshing token immediately.',
      // )
      refreshAccessToken()
      return
    }

    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId)
    }

    // console.info(`Scheduling token refresh in ${refreshTime / 1000} seconds.`)
    refreshTimeoutId = setTimeout(() => {
      refreshAccessToken()
    }, refreshTime)
  }

  /**
   * Refreshes the access token using the refresh token.
   * Implements a retry mechanism with exponential backoff.
   * @param {number} [retryCount=MAX_RETRY_ATTEMPTS] - The number of retry attempts remaining.
   */
  async function refreshAccessToken(retryCount = MAX_RETRY_ATTEMPTS) {
    try {
      const newToken = await refreshToken()
      // console.log('Token refreshed successfully:', newToken)
      const tokenExpires = await getTokenExpires()
      if (tokenExpires) {
        scheduleTokenRefresh(tokenExpires)
      } else {
        throw new Error('tokenExpires not found after refreshing token.')
      }
    } catch (error) {
      // console.error('Failed to refresh token:', error)

      if (retryCount > 0) {
        const retryDelay = Math.min(
          RETRY_DELAY_BASE * Math.pow(2, MAX_RETRY_ATTEMPTS - retryCount),
          MAX_RETRY_DELAY,
        )
        // console.log(
        //   `Retrying token refresh in ${
        //     retryDelay / 1000
        //   } seconds... Attempts left: ${retryCount}`,
        // )
        setTimeout(() => {
          refreshAccessToken(retryCount - 1)
        }, retryDelay)
      } else {
        // console.error(
        //   'Max retry attempts reached. Clearing storage and notifying user.',
        // )
        try {
          await clearSecureStorage()
        } catch (storageError) {
          // console.error('Error clearing storage:', storageError)
        }
      }
    }
  }

  /**
   * Initializes the token management by scheduling the initial token refresh.
   */
  async function initializeTokenManagement() {
    try {
      const tokenExpires = await getTokenExpires()
      if (!tokenExpires) {
        throw new Error('tokenExpires not found or invalid in storage.')
      }
      scheduleTokenRefresh(tokenExpires)
    } catch (error) {
      // console.error('Initialization error:', error)
    }
  }

  // Start the token management process
  await initializeTokenManagement()
}
