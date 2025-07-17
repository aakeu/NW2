
import { createAsyncThunk } from '@reduxjs/toolkit';
import { loadAuthData } from '../authSlice';
import { ChatHistoryData, GPTHistoryType,gptQuery, GPTResponse, gptStoreData, perplexityQuery  } from '../../types/gpt';


export const fetchHistory = createAsyncThunk<GPTHistoryType, void,{rejectValue:string}>('gpt/fetchHistory',async (_,{rejectWithValue})=>{  
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await loadAuthData()
  const url = new URL(`${QAPI}/stored-gpt/history`)

  try{
    const gpt_history = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.token}`,
      },
    })

    if (gpt_history.status !== 200) throw new Error('An error occurred')
    const data = await gpt_history.json()
    return data
  } catch(err:any) {
    return rejectWithValue(err.message||'Failed to fetch images')
  }
})

export async function storeGptResult(gptStoreData: gptStoreData) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await loadAuthData()
  const url = new URL(`${QAPI}/stored-gpt/save`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.token}`,
    },
    body: JSON.stringify(gptStoreData),
  })

  if (!response.ok) {
    const errorDetails = await response.json()
    throw new Error(
      `Error saving GPT result: ${errorDetails.message || response.statusText}`
    )
  }

  const data = await response.json()
  return data
}

export async function saveToChatHistory(chatHistoryData: ChatHistoryData) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await loadAuthData()
  const url = new URL(`${QAPI}/chat-history/save`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.token}`,
    },
    body: JSON.stringify(chatHistoryData),
  })

  if (!response.ok) {
    const errorDetails = await response.json()
    throw new Error(
      `Error saving to chat history : ${errorDetails.message || response.statusText}`
    )
  }

  const data = await response.json()
  return data
}

export const getLatestGptResult = async (id:number) => {
    try {
      const QAPI = process.env.REACT_APP_QAPI_URL;
      const token = await loadAuthData();
      const url = new URL(`${QAPI}/stored-gpt/latest`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        return false
      }

      const data = await response.json();
      return data || { result: [] };
    } catch (error:any) {
      return false
    }
  }


export async function delete_gpt(id: number) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await loadAuthData()
  const url = new URL(`${QAPI}/stored-gpt/deleteGpt`)

  const req = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.token}`,
    },
    body: JSON.stringify({ id }),
  })

  if (req.status !== 204) {
    const errorMessage =
      req.statusText || 'Failed to delete Gpt chat. Please try again.'
    return { success: false, message: errorMessage }
  }

  return {
    success: true,
    message: 'Gpt chat deleted successfully',
  }
}

export async function delete_gpt_query(id: number, queryId: number) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await loadAuthData()
  const url = new URL(`${QAPI}/stored-gpt/deleteGptQuery`)

  const req = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.token}`,
    },
    body: JSON.stringify({ id, queryId }),
  })

  if (req.status !== 204) {
    const errorMessage =
      req.statusText || 'Failed to delete Gpt chat. Please try again.'
    return { success: false, message: errorMessage }
  }

  return {
    success: true,
    message: 'Gpt Query deleted successfully',
  }
}

export async function queryGPT(req: gptQuery, Yield: (arg: string) => void) {
  try {
    const formData = new FormData()
    const QAPI = process.env.REACT_APP_QAPI_URL
    const url = new URL(`${QAPI}/gpts/stream-gpt`)
    const token = await loadAuthData()
    formData.append('query', req.query)
    if (req.file) formData.append('file', req.file)

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const errorMessage =
        errorData?.message || 'Something went wrong. Please try again later.'
      throw new Error(errorMessage)
    }

    if (!res.body) {
      throw new Error('Stream response body is null.')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')

    let responseData = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      responseData += chunk

      Yield(responseData)
    }
    return true
  } catch {
    return false
  }
}

export async function queryDeepSeek(req: perplexityQuery, Yield: (arg: string) => void) {
  try {
    const formData = new FormData()
    const QAPI = process.env.REACT_APP_QAPI_URL
    const url = new URL(`${QAPI}/deepseek/stream-deepseek`)
    const token = await loadAuthData()
    formData.append('query', req.query)
    formData.append('model', req.model);
    if (req.file) formData.append('file', req.file)

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const errorMessage =
        errorData?.message || 'Something went wrong. Please try again later.'
      throw new Error(errorMessage)
    }

    if (!res.body) {
      throw new Error('Stream response body is null.')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')

    let responseData = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      responseData += chunk

      Yield(responseData)
    }
    return true
  } catch {
    return false
  }
}

export async function queryPerplexity(req: perplexityQuery, Yield: (arg: string) => void) {
  try {
    const formData = new FormData();
    const QAPI = process.env.REACT_APP_QAPI_URL;
    const url = new URL(`${QAPI}/perplexity-ai/stream`);
    const token = await loadAuthData();
    formData.append('query', req.query);
    formData.append('model', req.model);
    if (req.file) formData.append('file', req.file);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const errorMessage = errorData?.message || 'Something went wrong. Please try again later.';
      throw new Error(errorMessage);
    }

    if (!res.body) {
      throw new Error('Stream response body is null.');
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')

    let responseData = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      responseData += chunk

      Yield(responseData)
    }
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Perplexity streaming error:', errorMessage);
    Yield(`<p class="error">Error: ${errorMessage}</p>`); // Yield error as HTML
    return false;
  }
}