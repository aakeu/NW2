import React, { useState, useEffect } from 'react'

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const [lastCall, setLastCall] = useState(0)

  useEffect(() => {
    const now = Date.now()
    if (now - lastCall >= limit) {
      setThrottledValue(value)
      setLastCall(now)
    }
  }, [value, limit, lastCall])

  return throttledValue
}
