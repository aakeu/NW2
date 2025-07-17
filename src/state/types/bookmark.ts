interface User {
    id: number;
    name: string;
    email: string;
    provider: string;
    status: string;
    socialId: string | null;
    createdAt: string;
    updatedAt: string;
    picture: string | null;
}

export interface Bookmark {
    id: number;
    date: string;
    imgUrl: string;
    snippet: string;
    title: string;
    url: string;
    source: string;
    folderName: string;
    description: string | null;
    from: string | null;
    deleteDate: string | null;
    user: User;
}

export interface BookmarkMinimal {
    id: number | null;
    date: string | null;
    imgUrl: string;
    snippet: string;
    title: string;
    url: string;
    source: string;
    folderName: string;
    description: string | null;
    from: string | null;
    deleteDate: string | null;
    user: {
        id: number | null;
    };
}

export interface ChildBookmarks {
    id: number,
    imgUrl: string,
    title: string,
    url: string,
    source: string,
    date: string | null;
  }
export interface BookmarksState {
    bookmarks: Bookmark[]; 
    bookmark: BookmarkMinimal; 
    bookmarkParentName: string
    collectionBookmarks: ChildBookmarks[];
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}