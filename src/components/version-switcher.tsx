"use client"
import { Button } from "./ui/button"

interface VersionSwitcherProps {
  currentVersion: string
  onSwitchVersion: (version: string) => void
}

export function VersionSwitcher({ currentVersion, onSwitchVersion }: VersionSwitcherProps) {
  return (
    <div className="mt-4 mb-6">
      <p className="text-lg mb-2">Выберите версию тестов:</p>
      <div className="flex justify-center gap-4">
        <Button variant={currentVersion === "tech" ? "default" : "outline"} onClick={() => onSwitchVersion("tech")}>
          Техническая
        </Button>
        <Button variant={currentVersion === "human" ? "default" : "outline"} onClick={() => onSwitchVersion("human")}>
          Гуманитарная
        </Button>
      </div>
    </div>
  )
}

