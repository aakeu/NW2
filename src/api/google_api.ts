import { getSecureToken } from './auth'

const getPhase = (phase:number) => phase * 5 - 4

export async function google_search(query:string, phase:number) {
  const GAPI_KEY = process.env.EXT_PUBLIC_GAPI_KEY
  const GSearch_ID = process.env.EXT_PUBLIC_GSearch_ID
  const startIndex = getPhase(phase)
  const URL = `https://www.googleapis.com/customsearch/v1?key=${GAPI_KEY}&cx=${GSearch_ID}&q=${encodeURIComponent(
    query,
  )}&start=${startIndex}&num=5`

  try {
    const response = await fetch(URL)

    if (!response.ok) throw new Error(`HTTP error, status = ${response.status}`)

    const data = await response.json()

    if (data.items && data.items.length > 0) return data.items
    return []
  } catch (err:any) {
    throw new Error(err)
  }
}

export async function google_scholar(query:string, phase:number, ext = false) {
  console.log({ query, phase })
  const origin = process.env.REACT_APP_QAPI_URL

  const params = new URLSearchParams({
    query: query,
    page: phase.toString(),
  })

  if (ext) {
    params.append('ext', 'true')
  }

  const URL = `${origin}/search-google-scholar?${params.toString()}`

  try {
    const response = await fetch(URL)

    if (!response.ok) {
      throw new Error(`HTTP error, status = ${response.status}`)
    }

    const text = await response.text() // Fetch the raw response as text
    // console.log('Raw Response:', text);  // Log the raw response

    if (!text) {
      throw new Error('Empty response from server') // Handle empty responses
    }

    let data
    try {
      data = JSON.parse(text) // Parse the JSON manually
    } catch (err) {
      // console.error('Error parsing JSON:', err);
      throw new Error('Invalid JSON response')
    }

    return data.length > 0 ? data : []
  } catch (err) {
    // console.error(err);
    throw new Error('Failed to fetch Google Scholar data')
  }
}

export async function web_summary(url:string) {
  const origin = process.env.REACT_APP_QAPI_URL
  const URL = `${origin}/summarize?url=${encodeURIComponent(url)}`
  const token = await getSecureToken('token')
  try {
    const req = await fetch(URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 200) throw new Error('error retrieving web summary')
    const data = await req.json()
    return data.summary
  } catch (error) {
    console.error(error)
    return 'Please try again'
  }
}

export function getFavicon(url:string) {
  try {
    const urlObj = new URL(url)
    return `${urlObj.origin}/favicon.ico`
  } catch {
    return 'localhost:3011/favicon.ico'
  }
}
