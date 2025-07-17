import { getSecureToken, setSecureToken, clearSecureStorage } from './auth.ts'

const SignUpMessages = {
  Conflict: 'Email already used',
}

/**
 * Refreshes the access token using the refresh token.
 * @returns {Promise<string>} The new access token.
 * @throws Will throw an error if the refresh token is missing or the refresh request fails.
 */
export async function refreshToken() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  if (!QAPI) {
    throw new Error('API URL is not defined in environment variables.')
  }

  const URL = `${QAPI}/auth/refresh`

  try {
    const refreshToken = await getSecureToken('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token found.')
    }

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()

      if (response.status === 401 || response.status === 403) {
        await clearSecureStorage()
        throw new Error('Session expired. Please log in again.')
      }

      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          errorData.message || 'Unknown error'
        }`,
      )
    }

    const data = await response.json()

    if (!data.token || !data.refreshToken || !data.tokenExpires) {
      throw new Error('Invalid response from refresh token endpoint.')
    }

    await setSecureToken('token', data.token)
    await setSecureToken('refreshToken', data.refreshToken)
    await setSecureToken('tokenExpires', data.tokenExpires)

    return data.token
  } catch (error) {
    // console.error('Refresh token error:', error)
    await clearSecureStorage()

    throw error
  }
}

/**
 * Checks if the token has expired.
 * @param {number} tokenExpires - The expiration time of the token in UNIX timestamp (seconds).
 * @returns {boolean} True if the token is expired, false otherwise.
 */
function isTokenExpired(tokenExpires) {
  if (typeof tokenExpires !== 'number') {
    // console.warn('Invalid tokenExpires value:', tokenExpires)
    return true
  }
  return Date.now() > tokenExpires * 1000
}

/**
 * Retrieves a valid access token.
 * @returns {Promise<string>} The valid access token.
 * @throws Will throw an error if tokens are missing or if refreshing the token fails.
 */
export async function getValidToken() {
  try {
    const [token, tokenExpires] = await Promise.all([
      getSecureToken('token'),
      getSecureToken('tokenExpires'),
    ])

    if (!token || !tokenExpires) {
      // console.warn('Token or token expiration time is missing.')
      return
    }

    if (isTokenExpired(tokenExpires)) {
      // console.info('Token has expired. Attempting to refresh...')
      const newToken = await refreshToken()
      return newToken
    }

    return token
  } catch (error) {
    // console.error('getValidToken error:', error)

    throw error
  }
}

/**
 * Retrieves a valid token.
 * @returns {Promise<string>} The valid token.
 */
export async function getToken() {
  try {
    const token = await getValidToken()
    return token
  } catch (error) {
    // console.error('getToken error:', error)
    throw error
  }
}

/**
 * Logs out the user and handles errors safely.
 * @returns {Promise<boolean>} true if successful, false otherwise.
 */
export async function log_out() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const URL = `${QAPI}/auth/logout`

  try {
    const token = await getSecureToken('token')

    if (!token) {
      // console.warn('No token found. User may already be logged out.')
      alert('You are already logged out.', 2500, 'orange', '#fff')
      return true
    }

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    // Check if the response is not successful
    if (response.status !== 204) {
      let errorMessage = 'Logout failed. Please try again later.'
      try {
        const errorData = await response.json()
        // console.error('Detailed Logout Error:', errorData)
        errorMessage = errorData.message || errorMessage
      } catch (parseError) {
        // console.error('Failed to parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    // Clear secure storage
    // await clearSecureStorage()
    return true
  } catch (error) {
    // console.error('Logout error:', error)
    return false
  }
}

/**
 * Signs up a new user.
 * @param {Object} details - The user details for registration.
 * @returns {Promise<Object>} The result of the sign-up process.
 */
export async function sign_up(details) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const URL = `${QAPI}/auth/register`

  try {
    const req = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    })

    if (req.status === 204) {
      const { email, password } = details
      const signInDetails = { email, password }
      const loginResponse = await sign_in(signInDetails)

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
        }
      } else {
        // If login fails, return the login error
        return {
          success: false,
          message: loginResponse.message,
        }
      }
    }

    // Handle registration conflicts (409 Conflict)
    if (req.status === 409) {
      return {
        success: false,
        message: 'User already exists. Please use a different email.',
      }
    }

    // Handle other errors
    const errorData = await req.json().catch(() => ({}))
    const message =
      errorData.message || 'Failed to register user. Please try again.'
    return {
      success: false,
      message,
    }
  } catch (error) {
    // console.error('Sign-up error:', error)
    return {
      success: false,
      message: 'Failed to register user. Please try again.',
    }
  }
}

/**
 * Signs in an existing user.
 * @param {Object} details - The user credentials for login.
 * @returns {Promise<Object>} The result of the sign-in process.
 */
export async function sign_in(details) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const URL = `${QAPI}/auth/login`

  try {
    const req = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    })

    if (req.status !== 200) {
      const errorMessage =
        'Invalid username or password. Verify your credentials and try again. If you signed up using Google or Facebook, please use that method to log in.'
      return { success: false, message: errorMessage }
    }

    const data = await req.json()

    // Ensure the response contains the necessary fields
    if (!data.token || !data.refreshToken || !data.tokenExpires || !data.user) {
      throw new Error('Incomplete data received from login response.')
    }

    return {
      success: true,
      message: 'Login successful!',
      token: data.token,
      refreshToken: data.refreshToken,
      tokenExpires: data.tokenExpires,
      user: data.user,
    }
  } catch (error) {
    // console.error('Sign-in error:', error)
    const errorMessage =
      'An error occurred during sign-in. Please try again later.'
    return { success: false, message: errorMessage }
  }
}

export async function getEncryptedToken() {
  try {
    const token = await getSecureToken('token')
    const response = await fetch(
      `${process.env.REACT_APP_QAPI_URL}/auth/encrypt-token`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }
    const responseText = await response.text()

    // console.log(responseText)

    return responseText
  } catch (error) {
    // console.error('Error getting encrypted:', error)
    throw error
  }
}
