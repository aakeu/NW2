export interface GoogleSearchResult {
  kind: string
  title: string
  htmlTitle: string
  link: string
  displayLink: string
  snippet: string
  htmlSnippet: string
  formattedUrl: string
  htmlFormattedUrl: string
  pagemap: any
}

export interface GoogleScholarSearchResult {
  position: number
  title: string
  result_id: string
  type: string
  link: string
  snippet: string
  publication_info?: any
  resources?: any
  inline_links?: any
}
