import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../state'
import { initializeAuth } from '../state/slice/authSlice'

interface AuthInitializerProps {
  children: React.ReactNode
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}

export default AuthInitializer
