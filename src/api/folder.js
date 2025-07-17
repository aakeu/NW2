import { getSecureToken } from './auth.ts'

export async function get_all_folders() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/folders/retrieve-folders`)

  try {
    const req = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 200) throw new Error('error retrieving folders')
    const data = await req.json()
    return data
  } catch (error) {
    // console.error('error retrieving folders', error)
  }
}

export async function create_folder(name, parentFolder) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/folders/create-folder`)

  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, parentFolder }),
    })

    if (req.status !== 201) {
      const errorMessage = req.statusText
      return { success: false, message: errorMessage }
    }

    const data = await req.json()
    return {
      success: true,
      message: 'Folder created successfully',
      data,
    }
  } catch (error) {
    // console.error('Failed to create a folder', error)
    return {
      success: false,
      message: 'Failed to create folder. Please try again.',
    }
  }
}

export async function update_folder(id, parentFolder, name) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/folders/${id}`)

  try {
    const req = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ parentFolder, name }),
    })

    if (req.status !== 200) {
      const errorMessage = req.statusText
      return { success: false, message: errorMessage }
    }

    const data = await req.json()
    return {
      success: true,
      message: 'Folder updated successfully',
    }
  } catch (error) {
    // console.error('Failed to update folder', error)
    return {
      success: false,
      message: 'Failed to update folder. Please try again.',
    }
  }
}

export async function delete_folder(id) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/folders/${id}`)

  try {
    const req = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 204) {
      const errorMessage = req.statusText
      return { success: false, message: errorMessage }
    }

    return {
      success: true,
      message: 'Folder deleted successfully',
    }
  } catch (error) {
    // console.error('Failed to delete folder', error)
    return {
      success: false,
      message: 'Failed to delete folder. Please try again.',
    }
  }
}
