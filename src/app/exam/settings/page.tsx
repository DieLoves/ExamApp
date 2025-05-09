"use client"

import type React from "react"

import { DisciplineSelector } from "@/components/discipline-selector"
import { AppFooter } from "@/components/layout/app-footer"
import { AppLayout } from "@/components/layout/app-layout"
import { ModuleSelector } from "@/components/module-selector"
import { SliderDemo } from "@/components/slide"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_NAME, DISCIPLINES, getDefaultDisciplineId } from "@/config"
import { loadExamSettings, saveExamSettings } from "@/lib/tauri-store"
import { cn } from "@/lib/utils"
import type { IExamFileQuestions, IExamModule } from "@/types/exam.types"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

interface ExamSettings {
  studentName: string
  tasksCount: number
  timeTaken: number
  selectedModules: number[]
  disciplineId: string
}

// Интерфейс для кешированных данных дисциплины
interface DisciplineData {
  modules: IExamModule[]
  questions: IExamFileQuestions[]
  disciplineId: string
  selectedModules: number[]
}

export default function ExamSetting() {
  const router = useRouter()
  const [studentName, setStudentName] = useState("")
  const [tasksCount, setTasksCount] = useState(30)
  const [timeTaken, setTimeTaken] = useState(40)
  const [nameError, setNameError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [appName, setAppName] = useState("")
  const [modules, setModules] = useState<IExamModule[]>([])
  const [questions, setQuestions] = useState<IExamFileQuestions[]>([])
  const [selectedModules, setSelectedModules] = useState<number[]>([])
  const [disciplineId, setDisciplineId] = useState<string>(getDefaultDisciplineId())

  // Кеш данных дисциплин
  const [disciplineCache, setDisciplineCache] = useState<Record<string, DisciplineData>>({})

  // Вычисляем количество вопросов в выбранных модулях
  const selectedQuestionsCount = useMemo(() => {
    if (!questions.length || !selectedModules.length) return 0

    return questions.filter((q) => selectedModules.includes(q.moduleId)).length
  }, [questions, selectedModules])

  // Вычисляем максимальное значение для слайдера (не более 50 и не более количества выбранных вопросов)
  const maxTasksCount = useMemo(() => {
    return Math.min(50, Math.max(10, selectedQuestionsCount))
  }, [selectedQuestionsCount])

  // Определяем шаг слайдера в зависимости от максимального количества вопросов
  const sliderStep = useMemo(() => {
    if (maxTasksCount <= 20) return 1
    if (maxTasksCount <= 30) return 2
    if (maxTasksCount <= 40) return 5
    return 10
  }, [maxTasksCount])

  // Генерируем метки для слайдера в зависимости от максимального значения и шага
  const sliderMarks = useMemo(() => {
    const marks = []
    const minValue = Math.min(10, maxTasksCount)

    // Добавляем минимальное значение
    marks.push(minValue)

    // Добавляем промежуточные значения
    if (maxTasksCount > minValue) {
      const range = maxTasksCount - minValue
      const markCount = Math.min(5, Math.floor(range / sliderStep)) // Не более 5 промежуточных меток

      if (markCount > 1) {
        const step = Math.floor(range / (markCount - 1))
        for (let i = 1; i < markCount; i++) {
          const value = minValue + i * step
          if (value < maxTasksCount) {
            marks.push(value)
          }
        }
      }
    }

    // Добавляем максимальное значение, если его еще нет
    if (marks[marks.length - 1] !== maxTasksCount) {
      marks.push(maxTasksCount)
    }

    return marks
  }, [maxTasksCount, sliderStep])

  // Обновляем tasksCount, если текущее значение больше нового максимума
  useEffect(() => {
    if (tasksCount > maxTasksCount) {
      setTasksCount(maxTasksCount)
    } else if (maxTasksCount >= 30 && tasksCount !== 30) {
      // Если возможно, выставляем 30 вопросов
      setTasksCount(30)
    } else {
      // Округляем до ближайшего значения, кратного шагу
      const roundedValue = Math.round(tasksCount / sliderStep) * sliderStep
      if (roundedValue !== tasksCount) {
        setTasksCount(roundedValue)
      }
    }
  }, [maxTasksCount, tasksCount, sliderStep])

  // Обработчик изменения выбранных модулей
  const handleModulesChange = (newSelectedModules: number[]) => {
    setSelectedModules(newSelectedModules)
  }

  // Обработчик изменения дисциплины
  const handleDisciplineChange = (newDisciplineId: string) => {
    setDisciplineId(newDisciplineId)

    // Загружаем данные для выбранной дисциплины (из кеша или с сервера)
    loadDisciplineData(newDisciplineId)
  }

  // Функция для загрузки данных дисциплины (с использованием кеша)
  const loadDisciplineData = async (disciplineId: string) => {
    try {
      setIsLoading(true)

      // Проверяем, есть ли данные в кеше
      if (disciplineCache[disciplineId]) {
        console.log(`Using cached data for discipline: ${disciplineId}`)
        const cachedData = disciplineCache[disciplineId]

        setModules(cachedData.modules)
        setQuestions(cachedData.questions)

        // Если есть сохраненные выбранные модули для этой дисциплины, используем их
        if (cachedData.selectedModules && cachedData.selectedModules.length > 0) {
          setSelectedModules(cachedData.selectedModules)
        } else {
          setSelectedModules(cachedData.modules.map((module) => module.id))
        }

        setIsLoading(false)
        return
      }

      // Если данных нет в кеше, загружаем их
      // Находим дисциплину по ID
      const discipline = DISCIPLINES.find((d) => d.id === disciplineId) || DISCIPLINES[0]

      // Загружаем модули и вопросы из файла дисциплины
      // console.log(`Loading data for discipline: ${disciplineId} from ${discipline.file}`)
      const { default: examData } = await import(`@/exams/${discipline.id}.ts`)
      const availableModules = examData.modules || []
      const availableQuestions = examData.questions || []

      // Выбираем все модули по умолчанию
      const allModuleIds = availableModules.map((module: IExamModule) => module.id)

      // Сохраняем данные в кеш
      setDisciplineCache((prevCache) => ({
        ...prevCache,
        [disciplineId]: {
          modules: availableModules,
          questions: availableQuestions,
          disciplineId,
          selectedModules: allModuleIds,
        },
      }))

      setModules(availableModules)
      setQuestions(availableQuestions)

      // По умолчанию выбираем все модули
      setSelectedModules(allModuleIds)
    } catch (error) {
      console.error(`Error loading discipline data for ${disciplineId}:`, error)
      setModules([])
      setQuestions([])
      setSelectedModules([])
    } finally {
      setIsLoading(false)
    }
  }

  // Обновляем кеш при изменении выбранных модулей
  useEffect(() => {
    if (disciplineId && modules.length > 0) {
      setDisciplineCache((prevCache) => ({
        ...prevCache,
        [disciplineId]: {
          ...(prevCache[disciplineId] || { modules, questions, disciplineId }),
          selectedModules,
        },
      }))
    }
  }, [disciplineId, selectedModules, modules, questions])

  // Load previous settings and modules when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Загружаем сохраненные настройки
        const savedSettings = await loadExamSettings()

        if (savedSettings) {
          setStudentName(savedSettings.studentName || "")
          setTimeTaken(savedSettings.timeTaken || 40)

          // Если есть сохраненная дисциплина, используем ее
          if (savedSettings.disciplineId) {
            setDisciplineId(savedSettings.disciplineId)
          }

          // Загружаем данные для выбранной дисциплины
          await loadDisciplineData(savedSettings.disciplineId || getDefaultDisciplineId())

          // Если в настройках есть выбранные модули, используем их
          if (savedSettings.selectedModules && savedSettings.selectedModules.length > 0) {
            setSelectedModules(savedSettings.selectedModules)
          }

          // Устанавливаем количество заданий после того, как выбраны модули
          setTimeout(() => {
            setTasksCount(savedSettings.tasksCount || 30)
          }, 0)
        } else {
          // Загружаем данные для дисциплины по умолчанию
          await loadDisciplineData(getDefaultDisciplineId())
        }

        // Set app name after component mounts to avoid hydration issues
        setAppName(APP_NAME)
      } catch (error) {
        console.error("Error loading exam settings or modules:", error)
        // Если не удалось загрузить модули, создаем пустой массив
        setModules([])
        setQuestions([])
        setSelectedModules([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentName.trim()) {
      setNameError(true)
      return
    }

    // Проверяем, что выбран хотя бы один модуль
    if (selectedModules.length === 0) {
      alert("Пожалуйста, выберите хотя бы один модуль")
      return
    }

    const settings: ExamSettings = {
      studentName,
      tasksCount,
      timeTaken,
      selectedModules,
      disciplineId,
    }

    // Save settings
    try {
      await saveExamSettings(settings)
      router.push("/exam")
    } catch (error) {
      console.error("Error saving exam settings:", error)
      // Fallback to localStorage and continue
      localStorage.setItem("examSettings", JSON.stringify(settings))
      router.push("/exam")
    }
  }

  const footer = (
    <AppFooter>
      <Button type="button" variant="outline" onClick={() => router.push("/")} className="h-10">
        Назад
      </Button>
      <Button type="button" onClick={handleSubmit} className="h-10">
        Начать
      </Button>
    </AppFooter>
  )

  return (
    <AppLayout isLoading={isLoading} headerTitle="Настройки тестирования" showVersion={true} footer={footer}>
      <div className="w-full">
        {appName && (
          <div className="mb-4 text-center">
            <h2 className="text-lg font-medium">{appName}</h2>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 w-full">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-lg" htmlFor="name">
              Имя {nameError && <span className="text-red-600 text-sm">Заполните это поле</span>}
            </Label>
            <Input
              id="name"
              placeholder="Ваше имя"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value)
                setNameError(false)
              }}
              className={cn("h-12 text-base w-full", nameError && "border-red-600 focus-visible:ring-red-600")}
              required
            />
          </div>

          {/* Добавляем селектор дисциплины */}
          <div className="flex flex-col space-y-3 w-full">
            <DisciplineSelector selectedDiscipline={disciplineId} onChange={handleDisciplineChange} />
          </div>

          {/* Добавляем селектор модулей */}
          {modules.length > 0 && (
            <div className="flex flex-col space-y-3 w-full">
              <ModuleSelector
                modules={modules}
                questions={questions}
                selectedModules={selectedModules}
                onChange={handleModulesChange}
              />
            </div>
          )}

          <div className="flex flex-col space-y-3 w-full">
            <Label className="text-lg" htmlFor="tasksCount">
              Количество заданий: {tasksCount}
              {selectedQuestionsCount > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  (доступно: {selectedQuestionsCount}, шаг: {sliderStep})
                </span>
              )}
            </Label>
            <SliderDemo
              defaultValue={[tasksCount]}
              max={maxTasksCount}
              min={Math.min(10, maxTasksCount)}
              step={sliderStep}
              value={[tasksCount]}
              onValueChange={(value) => setTasksCount(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground px-1 w-full">
              {sliderMarks.map((mark, index) => (
                <span key={index}>{mark}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-3 w-full">
            <Label className="text-lg" htmlFor="timeTaken">
              Время на тестирование: {timeTaken} минут
            </Label>
            <SliderDemo
              defaultValue={[timeTaken]}
              max={60}
              min={10}
              step={5}
              value={[timeTaken]}
              onValueChange={(value) => setTimeTaken(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground px-1 w-full">
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
              <span>50</span>
              <span>60</span>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
