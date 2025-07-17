// GPT type

export interface StoredGpt {
  id: number
  title: string
  updatedAt?: Date
}

export interface GPTHistoryType {
  today: StoredGpt[]
  p7days: StoredGpt[]
  pmonth: StoredGpt[]
  old: StoredGpt[]
}

export interface GPTSliceType {
  history: GPTHistoryType
  section: 'MainChat'|'OCR'|'Translator';
  activeChat: StoredGpt
  ranQuery: number;
  loading:boolean;
  error:boolean;
  chatLoading:boolean;
  chatError:boolean;
}

export interface gptStoreData {
  query: string
  id?: number
  isNew?:boolean;
  response: string
}

export interface ChatHistoryData {
  messages: {
    role: string
    content: string
    timestamp: string
  }[]
}

export interface GPTResponse {
  id: number;
  result: gptStoreData[];
  title: string;
  lastId: number;
  updatedAt?: string; // ISO date string
  deleteAt?: string | null; // Can be null
}

export interface gptQuery {
  query: string
  file?: File
}

export interface perplexityQuery {
  query: string
  model: string
  file?: File
}

export interface GPTResult {
  id?: number
  query: string
  response: string
  date?: Date
  isNew?: boolean
}
