"use client"

import { useContentProtection } from "@/hooks/use-content-protection"

interface ContentProtectionProps {
  enabled?: boolean
}

export function ContentProtection({ enabled = true }: ContentProtectionProps) {
  // Используем хук для защиты контента
  useContentProtection({ enabled })

  // Компонент не рендерит ничего видимого
  return null
}
