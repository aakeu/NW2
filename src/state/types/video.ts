interface User {
    id: number,
    name: string,
    email: string,
    password: string
    provider: string
    status: string
    socialId: string | null,
    createdAt: string,
    hash: string | null,
    updatedAt: string,
    picture: string
    subscriptionState: string
    subscriptionType: string
    subscriptionDuration: string
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePaymentId: null,
    isSubscribed: false,
    subscriptionExpiry: null,
    activationExpiry: string
    incognitoLoginExpiry: string | null,
    coin: number,
    deletedAt: string | null,
    previousPassword: string
}

export interface Video {
    id: number,
    videoUrl: string
    parentFolderName: string
    videoFolderName: string
    source: string
    deletedAt: null,
    user: User
}

export interface VideosState {
    videos: Video[]; 
    loading: boolean;
    error: string | null
}