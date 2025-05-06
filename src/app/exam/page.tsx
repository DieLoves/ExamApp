"use client"

import { AnswerOption } from "@/components/answer-option"
import { ConfirmExamFinish } from "@/components/confirm-exam-end"
import { ExamProgress } from "@/components/exam/exam-progress"
import { ExamResults } from "@/components/exam/exam-results"
import { AppFooter } from "@/components/layout/app-footer"
import { AppLayout } from "@/components/layout/app-layout"
import { Pagination } from "@/components/pagination"
import { QuestionTitle } from "@/components/question-title"
import { ReviewAnswer } from "@/components/review-answer"
import { Timer } from "@/components/timer"
import { Button } from "@/components/ui/button"
import { useExam } from "@/hooks/use-exam"
import { User } from "lucide-react"

export default function ExamPage() {
  const exam = useExam()

  // Управляем защитой контента в зависимости от состояния экзамена
  // useEffect(() => {
  //   // Обновляем защиту контента только в Tauri
  //   const updateProtection = () => {
  //     try {
  //       // Включаем защиту только во время активного экзамена
  //       // Отключаем при просмотре результатов или ответов
  //       const shouldProtect = !exam.isFinished || (!exam.showResults && !exam.showReview)
  //       setContentProtection(shouldProtect)
  //     } catch (error) {
  //       console.error("Error updating content protection:", error)
  //     }
  //   }

  //   updateProtection()

  //   // Отключаем защиту при размонтировании компонента
  //   return () => {
  //     setContentProtection(false)
  //   }
  // }, [exam.isFinished, exam.showResults, exam.showReview])

  // Если экзамен в режиме просмотра ответов
  if (exam.showReview) {
    const currentReviewQuestion = exam.questions[exam.reviewQuestion]
    const userAnswerIndex = exam.selectedAnswers[exam.reviewQuestion]
    const userAnswerStatus = exam.getUserAnswerStatus(exam.reviewQuestion)
    const statusColor =
      userAnswerStatus === "Правильно"
        ? "text-green-500"
        : userAnswerStatus === "Неправильно"
          ? "text-red-500"
          : "text-yellow-500"

    const reviewFooter = (
      <AppFooter>
        <Button
          variant="outline"
          className="h-10 text-base"
          onClick={exam.handlePrevReviewQuestion}
          disabled={exam.reviewQuestion === 0}
        >
          Назад
        </Button>
        <Button variant="outline" className="h-10 text-base" onClick={exam.handleBackToResults}>
          К результатам
        </Button>
        <Button
          className="h-10 text-base"
          onClick={exam.handleNextReviewQuestion}
          disabled={exam.reviewQuestion === exam.questions.length - 1}
        >
          Далее
        </Button>
      </AppFooter>
    )

    return (
      <AppLayout headerTitle={`Просмотр ответов - ${exam.disciplineName}`} footer={reviewFooter}>


        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-2">
          <span className="text-base">
            Вопрос {exam.reviewQuestion + 1} из {exam.questions.length}
          </span>
          <span className={`text-base font-medium flex items-center gap-2 ${statusColor}`}>{userAnswerStatus}</span>
        </div>

        <ExamProgress
          currentQuestion={exam.reviewQuestion}
          totalQuestions={exam.questions.length}
          progressPercentage={((exam.reviewQuestion + 1) / exam.questions.length) * 100}
        />

        <Pagination
          currentIndex={exam.reviewQuestion}
          totalItems={exam.questions.length}
          onSelect={exam.handleJumpToReviewQuestion}
          selectedItems={exam.selectedAnswers}
          isReview={true}
          isAnswerCorrect={exam.isAnswerCorrect}
        />

        <div className="mt-6">
          <h3 className="text-lg sm:text-xl mb-4">
            <QuestionTitle title={currentReviewQuestion.title} />
          </h3>
          <div className="mt-4 space-y-3">
            {currentReviewQuestion.answers.map((answer, i) => (
              <ReviewAnswer
                key={`review-answer-${i}`}
                index={i}
                text={answer.text}
                isSelected={userAnswerIndex === i}
                isCorrect={answer.isCorrect}
              />
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  // Если экзамен завершен и показываются результаты
  if (exam.showResults) {
    const resultsFooter = (
      <AppFooter>
        <Button className="h-10 text-base" onClick={exam.handleReturnHome}>
          На главную
        </Button>
        <Button className="h-10 text-base" onClick={exam.handleShowReview}>
          Просмотр ответов
        </Button>
      </AppFooter>
    )

    return (
      <AppLayout headerTitle={`Результаты тестирования - ${exam.disciplineName}`} footer={resultsFooter}>

        {exam.settings && (
          <ExamResults
            studentName={exam.settings.studentName}
            examDate={exam.endTime}
            timeSpent={exam.timeSpent}
            terminationReason={exam.terminationReason}
            finalScore={exam.finalScore}
            pointsScore={exam.pointsScore}
            gradeScore={exam.gradeScore}
            correctAnswers={Math.round((exam.finalScore / 100) * exam.questions.length)}
            totalQuestions={exam.questions.length}
            selectedAnswers={exam.selectedAnswers}
            isAnswerCorrect={exam.isAnswerCorrect}
            disciplineName={exam.disciplineName}
          />
        )}
      </AppLayout>
    )
  }

  // Если экзамен загружается
  if (exam.isLoading || !exam.settings) {
    return <AppLayout isLoading={true} />
  }

  // Основной режим экзамена
  const examFooter = (
    <AppFooter>
      <Button
        variant="outline"
        className="h-10 text-base"
        onClick={exam.handlePrevQuestion}
        disabled={exam.currentQuestion < 1}
      >
        Назад
      </Button>
      <ConfirmExamFinish
        isFinish={Object.keys(exam.selectedAnswers).length === exam.questions.length}
        onConfirm={exam.handleFinishExam}
      />
      {exam.currentQuestion < exam.questions.length - 1 ? (
        <Button className="h-10 text-base" onClick={exam.handleNextQuestion}>
          Далее
        </Button>
      ) : (
        <Button className="h-10 text-base" onClick={exam.handleFinishExam}>
          Завершить
        </Button>
      )}
    </AppFooter>
  )

  return (
    <AppLayout headerTitle={`Тестирование - ${exam.disciplineName}`} footer={examFooter}>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="text-base">{exam.settings.studentName}</span>
        </div>
        <Timer initialMinutes={exam.settings.timeTaken} onTimeUp={exam.handleTimeUp} className="text-base" />
      </div>

      <ExamProgress
        currentQuestion={exam.currentQuestion}
        totalQuestions={exam.questions.length}
        progressPercentage={exam.progress}
      />

      <Pagination
        currentIndex={exam.currentQuestion}
        totalItems={exam.questions.length}
        onSelect={exam.handleJumpToQuestion}
        selectedItems={exam.selectedAnswers}
      />

      <div className="mt-6">
        <h3 className="text-lg sm:text-xl mb-4">
          <QuestionTitle title={exam.questions[exam.currentQuestion].title} />
        </h3>
        <div className="text-sm text-muted-foreground mb-2">
          {exam.selectedAnswers[exam.currentQuestion] !== undefined
            ? `Выбран ответ: ${exam.selectedAnswers[exam.currentQuestion] + 1}`
            : "Ответ не выбран"}
        </div>
        <div className="mt-4 space-y-3">
          {exam.questions[exam.currentQuestion].answers.map((answer, i) => (
            <AnswerOption
              key={`answer-${i}`}
              index={i}
              text={answer.text}
              isSelected={exam.selectedAnswers[exam.currentQuestion] === i}
              onClick={() => exam.handleAnswerSelect(i)}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
