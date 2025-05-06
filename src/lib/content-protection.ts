import { isTauri } from "./tauri-store"

// Функция для предотвращения копирования контента
export function preventContentCopy() {
  if (typeof document === "undefined") return

  // Запрет контекстного меню
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault()
    return false
  })

  // Запрет копирования, вырезания и вставки
  document.addEventListener("copy", (e) => {
    e.preventDefault()
    return false
  })

  document.addEventListener("cut", (e) => {
    e.preventDefault()
    return false
  })

  document.addEventListener("paste", (e) => {
    e.preventDefault()
    return false
  })

  // Запрет перетаскивания
  document.addEventListener("dragstart", (e) => {
    e.preventDefault()
    return false
  })

  // Запрет выделения текста через CSS
  const style = document.createElement("style")
  style.innerHTML = `
    * {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
    
    input, textarea {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `
  document.head.appendChild(style)
}

// Функция для предотвращения скриншотов на мобильных устройствах
// export async function preventScreenshots() {
//   if (typeof window === "undefined" || !isTauri()) return

//   try {
//     // Проверяем, работаем ли на Android
//     const { platform } = await import("@tauri-apps/plugin-os")
//     const platformType = await platform()

//     if (platformType === "android") {
//       try {
//         // Используем Tauri API для получения текущего окна
//         const { getCurrentWindow } = await import("@tauri-apps/api/window")
//         const currentWindow = getCurrentWindow()

//         // На Android можно использовать метод setSecure
//         if (typeof currentWindow.setSecure === "function") {
//           currentWindow.setSecure(true)
//           console.log("Secure flag set successfully on Android")
//         } else {
//           console.warn("setSecure method not available on this platform")
//         }
//       } catch (error) {
//         console.error("Error setting secure flag:", error)
//       }
//     }
//   } catch (error) {
//     console.error("Error detecting platform:", error)
//   }
// }

// Обновляем функцию для управления защитой контента
export async function setContentProtection(enabled: boolean): Promise<boolean> {
  if (!isTauri()) return false

  try {
    // Используем Tauri API для получения текущего окна
    const { getCurrentWindow } = await import("@tauri-apps/api/window")
    const currentWindow = getCurrentWindow()

    // Устанавливаем защиту контента
    currentWindow.setContentProtected(enabled)
    console.log(`Content protection ${enabled ? "enabled" : "disabled"}`)
    return true
  } catch (error) {
    console.error("Error setting content protection:", error)
    return false
  }
}

// Функция для защиты от модификации через DevTools
export function preventDevToolsModification() {
  if (typeof document === "undefined") return

  // Сохраняем оригинальное состояние важных элементов
  const originalState = new Map<Element, string>()

  // Функция для сохранения состояния элемента
  const saveElementState = (element: Element) => {
    originalState.set(element, element.outerHTML)
  }

  // Функция для проверки и восстановления элемента
  const checkAndRestoreElement = (element: Element) => {
    const original = originalState.get(element)
    if (original && element.outerHTML !== original) {
      // Элемент был изменен, восстанавливаем его
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = original
      const originalElement = tempDiv.firstElementChild
      if (originalElement && element.parentNode) {
        element.parentNode.replaceChild(originalElement, element)
        saveElementState(originalElement)
      }
    }
  }

  // Сохраняем состояние важных элементов
  const saveImportantElements = () => {
    const importantElements = document.querySelectorAll(".exam-question, .exam-answer, .exam-result")
    importantElements.forEach(saveElementState)
  }

  // Периодически проверяем и восстанавливаем элементы
  const startMonitoring = () => {
    saveImportantElements()

    setInterval(() => {
      originalState.forEach((_, element) => {
        checkAndRestoreElement(element)
      })

      // Обновляем состояние элементов, которые могли быть добавлены
      saveImportantElements()
    }, 1000)
  }

  // Используем MutationObserver для отслеживания изменений в DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" || mutation.type === "childList") {
        const target = mutation.target as Element
        if (originalState.has(target)) {
          checkAndRestoreElement(target)
        }
      }
    })
  })

  // Начинаем мониторинг после загрузки страницы
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startMonitoring)
  } else {
    startMonitoring()
  }

  // Запускаем наблюдатель для всего документа
  observer.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  })

  // Дополнительная защита от DevTools
  function detectDevTools() {
    const widthThreshold = window.outerWidth - window.innerWidth > 160
    const heightThreshold = window.outerHeight - window.innerHeight > 160

    if (widthThreshold || heightThreshold) {
      // DevTools, вероятно, открыты
      // Можно добавить дополнительные действия, например, перезагрузку страницы
      console.warn("DevTools detected, some features may be disabled")
    }
  }

  window.addEventListener("resize", detectDevTools)
  setInterval(detectDevTools, 1000)
}
