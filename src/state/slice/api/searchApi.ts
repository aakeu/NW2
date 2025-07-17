const getPhase = (phase: number): number => phase * 5 - 4

export async function google_search(
  query: string,
  phase: number,
): Promise<any[]> {
  const GAPI_KEY: string | undefined = process.env.EXT_PUBLIC_GAPI_KEY
  const GSearch_ID: string | undefined = process.env.EXT_PUBLIC_GSearch_ID

  if (!GAPI_KEY || !GSearch_ID) {
    throw new Error('Google API key or Search ID is missing')
  }

  const startIndex = getPhase(phase)
  const URL = `https://www.googleapis.com/customsearch/v1?key=${GAPI_KEY}&cx=${GSearch_ID}&q=${encodeURIComponent(
    query,
  )}&start=${startIndex}&num=5`

  try {
    const response = await fetch(URL)

    if (!response.ok) {
      throw new Error(`HTTP error, status = ${response.status}`)
    }

    const data = await response.json()

    return data.items && data.items.length > 0 ? data.items : []
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Unknown error occurred',
    )
  }
}

export async function google_scholar(
  query: string,
  phase: number,
  ext: boolean = false,
): Promise<any[]> {
  console.log({ query, phase })
  const origin: string | undefined = process.env.REACT_APP_QAPI_URL

  if (!origin) {
    throw new Error('Google Scholar API URL is missing')
  }

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

    const text = await response.text()

    if (!text) {
      throw new Error('Empty response from server')
    }

    let data
    try {
      data = JSON.parse(text)
    } catch (err) {
      throw new Error('Invalid JSON response')
    }

    return Array.isArray(data) && data.length > 0 ? data : []
  } catch (err) {
    throw new Error('Failed to fetch Google Scholar data')
  }
}
