"use client"

import type React from "react"

import { isTauri } from "@/lib/tauri-store"
import { useState } from "react"

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function ExternalLink({ href, children, className = "" }: ExternalLinkProps) {
  const [isOpening, setIsOpening] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (isOpening) return
    setIsOpening(true)

    try {
      if (isTauri()) {
        // Use Tauri API to open link in default browser
        const { open } = await import("@tauri-apps/plugin-shell")
        await open(href)
      } else {
        // For web version, open in new tab
        window.open(href, "_blank")
      }
    } catch (error) {
      console.error("Error opening link:", error)
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <a className={`cursor-pointer ${className}`} onClick={handleClick}>
      {children}
    </a>
  )
}

