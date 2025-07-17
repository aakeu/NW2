import { getSecureToken } from './auth.ts'

export async function create_bookmark(
  imgUrl,
  snippet,
  title,
  url,
  source,
  folderName,
  description,
) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const bookmarkUrl = new URL(`${QAPI}/bookmarks/create-bookmark`)

  try {
    const req = await fetch(bookmarkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imgUrl,
        snippet,
        title,
        url,
        source,
        folderName,
        description,
      }),
    })

    if (req.status === 409) {
      const errorMessage = "Bookmark already exists"
      return { success: false, message: errorMessage }
    }

    const data = await req.json()
    return {
      success: true,
      message: 'Bookmark created successfully',
      data,
    }
  } catch (error) {
    // console.error('Failed to create bookmark', error)
    return {
      success: false,
      message: 'Failed to create bookmark. Please try again.',
    }
  }
}

export async function get_all_bookmarks() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/bookmarks/retrieve-bookmarks`)

  try {
    const req = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 200) throw new Error('error retrieving bookmarks')
    const data = await req.json()
    return data
  } catch (error) {
    // console.error('error retrieving bookmarks', error)
  }
}

export async function get_all_favorites() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/favorite`)

  try {
    const req = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 200) throw new Error('error retrieving favorites')
    const data = await req.json()
    return data
  } catch (error) {
    // console.error('error retrieving favorites', error)
  }
}

export async function delete_bookmark(id) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/bookmarks/${id}`)

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
      message: 'bookmark deleted successfully',
    }
  } catch (error) {
    // console.error('Failed to delete bookmark', error)
    return {
      success: false,
      message: 'Failed to delete bookmark. Please try again.',
    }
  }
}

export async function delete_favorite(id) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/favorite/${id}`)

  try {
    const req = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 200) {
      const errorMessage = req.statusText
      return { success: false, message: errorMessage }
    }

    return {
      success: true,
      message: 'favorite deleted successfully',
    }
  } catch (error) {
    // console.error('Failed to delete favorite', error)
    return {
      success: false,
      message: 'Failed to delete favorite. Please try again.',
    }
  }
}
