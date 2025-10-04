"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

type RunnerStatus = "idle" | "loading" | "ready" | "error" | "missing"

interface ThreeRunnerProps {
  code?: string
  stepKey: string | number
}

export function ThreeRunner({ code, stepKey }: ThreeRunnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [status, setStatus] = useState<RunnerStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  // Ensure everything is torn down when component unmounts
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
      if (containerRef.current) {
        containerRef.current.replaceChildren()
      }
      delete (window as any).SYI
      delete (window as any).SYIHost
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    cleanupRef.current?.()
    cleanupRef.current = null
    setError(null)

    if (!container) {
      setStatus("error")
      setError("Viewer container not ready")
      return
    }

    container.replaceChildren()

    if (!code) {
      setStatus("missing")
      return
    }

    setStatus("loading")

    try {
      ;(window as any).SYI = undefined
      ;(window as any).SYIHost = { THREE, container }
      const runner = new Function("THREE", "container", `'use strict'\n${code}`)
      runner(THREE, container)

      const syiGlobal = (window as any).SYI
      if (syiGlobal && typeof syiGlobal.cleanup === "function") {
        cleanupRef.current = () => {
          try {
            syiGlobal.cleanup()
          } catch (cleanupError) {
            console.warn("SYI cleanup failed", cleanupError)
          }
        }
      } else {
        cleanupRef.current = () => {
          container.replaceChildren()
        }
      }

      setStatus("ready")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      setStatus("error")
      cleanupRef.current = () => {
        container.replaceChildren()
      }
    } finally {
      delete (window as any).SYIHost
    }

    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
      container.replaceChildren()
      delete (window as any).SYI
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, stepKey])

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {(status === "loading" || status === "missing" || status === "error") && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-center text-sm text-muted-foreground">
          {status === "loading" && <span>Loading interactive preview…</span>}
          {status === "missing" && <span>No 3D code available for this step yet.</span>}
          {status === "error" && (
            <>
              <span>Something went wrong running the 3D code.</span>
              {error && <span className="text-xs text-destructive">{error}</span>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
