export interface Favorite {
    id: number,
    imgUrl: string
    title: string
    description: string | null
    url: string
    authors: string | null,
    citations:string |  null,
    cite_link: string | null,
    resource_link: string | null,
    resource_title: string | null,
    engine: string
    deleteDate: string | null,
    updateDate: string
}

export interface FavoritesState {
    favorites: Favorite[]; 
    loading: boolean;
    error: string | null
    successMessage: string | null
}