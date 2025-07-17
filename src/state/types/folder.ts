interface User {
  id: number
  name?: string
  email?: string
  status: string
}

export interface Folder {
  id: number
  parentFolder: string
  name: string
  deletedAt: string | null
  user: User
}

export interface ChildFolder {
  id: number
  name: string
  dateAdded: string | null
}

export interface FoldersState {
  folders: Folder[]
  collectionFolders: ChildFolder[],
  collectionAncestorFolders: string[],
  loading: boolean
  error: string | null
  successMessage: string | null
}
