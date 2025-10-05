"use client"

import { useState, useEffect } from 'react'

/**
 * Hook to detect if we're running on the client side
 * Prevents hydration mismatches and SSR issues
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}