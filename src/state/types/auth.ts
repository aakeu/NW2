export interface AuthUser {
  id: number
  name: string
  email: string
  password: string
  provider: string
  status: string
  socialId: string | null
  createdAt: string
  hash: string | null
  updatedAt: string
  picture: string
  subscriptionState: string
  subscriptionType: string
  subscriptionDuration: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePaymentId: string | null
  isSubscribed: boolean
  subscriptionExpiry: string | null
  activationExpiry: string | null
  coin: number
  deletedAt: string | null
  previousPassword: string | null
}

export interface AuthState {
  token: string | null
  refreshToken: string | null
  tokenExpires: number | null
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  isOnboarding: boolean
}

export interface SignUpDetails {
  email: string
  password: string
  name: string
}

export interface SignInDetails {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  refreshToken?: string
  tokenExpires?: number
  user?: AuthUser
  isOnboarding?: boolean
}
