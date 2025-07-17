import { getSecureToken } from './auth'

export async function update_user(id:number, formData:FormData) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/users/${id}`)

  try {
    const req = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (req.status !== 200) {
      const errorMessage = req.statusText
      return { success: false, message: errorMessage }
    }

    const data = await req.json()
    return {
      success: true,
      message: 'User updated successfully!',
      data,
    }
  } catch (error) {
    // console.error('Failed to update user', error)
    return {
      success: false,
      message: 'Failed to update user. Please try again.',
    }
  }
}

export async function get_user_status() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/auth/status`)

  try {
    const req = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 200) throw new Error('Error retrieving user status')
    const data = await req.json()
    return data
  } catch (error) {
    // console.error('error retrieving user status', error)
  }
}

export async function change_password(
  currentPassword:string,
  newPassword:string,
  confirmNewPassword:string,
) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = `${QAPI}/users/change-password`

  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    })

    const result = await req.json()

    if (req.status === 422) {
      return {
        success: false,
        message: 'Validation failed. Incorrect existing password.',
      }
    }

    if (req.status === 400) {
      return {
        success: false,
        message:
          result.message || 'Confirm password does not match new password!',
      }
    }

    if (req.status === 201) {
      return {
        success: true,
        message: 'Password changed successfully!',
      }
    }

    return {
      success: false,
      message: result.message || 'An unexpected error occurred.',
    }
  } catch (error) {
    // console.error('Failed to change password:', error)
    return {
      success: false,
      message: 'Failed to change password. Please try again later.',
    }
  }
}

export async function get_tracking_record() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/tracking`)

  try {
    const req = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 200) {
      // console.log("Error retrieving tracking record")
    }
    const data = await req.json()
    return data
  } catch (error) {
    // console.error('error retrieving tracking record', error)
  }
}
