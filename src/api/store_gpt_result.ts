import { getSecureToken } from './auth'

export async function storeGptResult(dataToStore:any) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')||''
  const url = `${QAPI}/stored-gpt/save`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToStore),
    })

    if (!response.ok) {
      const errorDetails = await response.json()
      throw new Error(
        `Error saving GPT result: ${
          errorDetails.message || response.statusText
        }`,
      )
    }

    const data = await response.json()
    return data
    // console.log('stored gpt result successfully', data)
  } catch (error) {
    // console.error('Error saving GPT result:', error.message || error)
    // throw error
  }
}

export async function getGptHistory() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')||''
  const url = `${QAPI}/stored-gpt/history`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorDetails = await response.json()
      throw new Error(
        `Error getting gpt history: ${
          errorDetails.message || response.statusText
        }`,
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    // console.error('Error saving GPT result:', error.message || error)
    // throw error
  }
}

export async function getLatestGptResult(id:number) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')||''
  const url = `${QAPI}/stored-gpt/latest`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    })

    if (!response.ok) {
      const errorDetails = await response.json()
      throw new Error(
        `Error getting latest gpt result: ${
          errorDetails.message || response.statusText
        }`,
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    // console.error('Error saving GPT result:', error.message || error)
    // throw error
  }
}

export async function delete_gpt(id:number) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/stored-gpt/deleteGpt`)

  try {
    const req = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    })

    if (req.status !== 204) {
      const errorMessage = req.statusText
      return { success: false, message: errorMessage }
    }

    return {
      success: true,
      message: 'Gpt chat deleted successfully',
    }
  } catch (error) {
    // console.error('Failed to delete bookmark', error)
    return {
      success: false,
      message: 'Failed to delete Gpt chat. Please try again.',
    }
  }
}

export async function delete_gpt_query(id:number, queryId:number) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/stored-gpt/deleteGptQuery`)

  try {
    const req = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, queryId }),
    })

    if (req.status !== 204) {
      const errorMessage = req.statusText
      return { success: false, message: errorMessage }
    }

    return {
      success: true,
      message: 'Gpt Query deleted successfully',
    }
  } catch (error) {
    // console.error('Failed to delete bookmark', error)
    return {
      success: false,
      message: 'Failed to delete Gpt chat. Please try again.',
    }
  }
}