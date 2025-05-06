"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DISCIPLINES } from "@/config"
import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface DisciplineSelectorProps {
  selectedDiscipline: string
  onChange: (disciplineId: string) => void
}

export function DisciplineSelector({ selectedDiscipline, onChange }: DisciplineSelectorProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Выбор дисциплины</CardTitle>
        <CardDescription>Выберите дисциплину для тестирования</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DISCIPLINES.filter(d => d.isAvaliable).map((discipline) => {
            const isSelected = selectedDiscipline === discipline.id

            return (
              <div
                key={discipline.id}
                className={cn(
                  "flex items-center w-full p-3 rounded-md border text-left transition-all cursor-pointer",
                  isSelected ? "bg-primary/10 border-primary/50 border-2" : "hover:bg-secondary/50 border-border",
                )}
                onClick={() => onChange(discipline.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onChange(discipline.id)
                  }
                }}
              >
                <div className="flex-1">
                  <div className="text-base sm:text-lg font-medium">{discipline.name}</div>
                </div>
                <div className="ml-2">
                  {isSelected && <CheckCircle className="h-5 w-5 fill-primary stroke-primary-foreground" />}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
