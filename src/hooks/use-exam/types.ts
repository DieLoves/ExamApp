import type { IExamFileQuestions, QuestionAnswer } from "@/types/exam.types"

// Интерфейс для перемешанных вопросов с оригинальными индексами ответов
export interface ShuffledQuestion extends Omit<IExamFileQuestions, "answers"> {
  answers: (QuestionAnswer & { originalIndex: number })[]
}

export interface ExamSettings {
  studentName: string
  tasksCount: number
  timeTaken: number
  selectedModules: number[]
  disciplineId: string // Добавляем ID выбранной дисциплины
}

export interface ExamState {
  settings: ExamSettings | null
  questions: ShuffledQuestion[]
  currentQuestion: number
  selectedAnswers: Record<number, number>
  selectedOriginalAnswers: Record<number, number>
  isFinished: boolean
  finalScore: number
  pointsScore: number
  gradeScore: number
  showResults: boolean
  showReview: boolean
  progress: number
  reviewQuestion: number
  startTime: Date | null
  endTime: Date | null
  timeSpent: number
  isLoading: boolean
  examDate: string | null
  terminationReason: string | null
  disciplineName: string // Добавляем название дисциплины
}

export interface ExamResult {
  studentName: string
  date: string
  score: number
  pointsScore: number
  gradeScore: number
  timeSpent: number
  questionsCount: number
  correctAnswers: number
  terminationReason?: string | null
  disciplineName?: string // Добавляем название дисциплины
}
