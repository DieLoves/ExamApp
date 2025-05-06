"use client"

import {
	preventContentCopy,
	preventDevToolsModification,
	setContentProtection,
} from "@/lib/content-protection"
import { isTauri } from "@/lib/tauri-store"
import { useEffect, useState } from "react"

interface ContentProtectionOptions {
  enabled?: boolean
}

export function useContentProtection(options: ContentProtectionOptions = {}) {
  const { enabled = true } = options
  const [isProtected, setIsProtected] = useState(false)
  const [isTauriEnv, setIsTauriEnv] = useState(false)

  // Проверяем, работаем ли в Tauri
  useEffect(() => {
    const checkTauri = async () => {
      setIsTauriEnv(isTauri())
    }

    checkTauri()
  }, [])

  // Включение/отключение защиты контента
  const toggleProtection = async (enable: boolean) => {
    if (!isTauriEnv) return
    if (enable === isProtected) return

    try {
      const success = await setContentProtection(enable)
      if (success) {
        setIsProtected(enable)
        console.log(`Protection ${enable ? "enabled" : "disabled"}`)
      }
    } catch (error) {
      console.error("Error toggling protection:", error)
    }
  }

  useEffect(() => {
    // Применяем базовую защиту контента независимо от параметра enabled
    preventContentCopy()
    preventDevToolsModification()

    // Применяем защиту контента Tauri в зависимости от параметра enabled
    if (isTauriEnv) {
      toggleProtection(enabled)
    }

    // Дополнительная защита от F12 и других комбинаций клавиш
    const handleKeyDown = (e: KeyboardEvent) => {
      // Блокировка F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault()
        return false
      }

      // Блокировка Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")
      ) {
        e.preventDefault()
        return false
      }

      // Блокировка Ctrl+U (просмотр исходного кода)
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      // Отключаем защиту при размонтировании компонента
      if (isTauriEnv) {
        toggleProtection(false)
      }
    }
  }, [enabled, isTauriEnv])

  return { isProtected, toggleProtection }
}
