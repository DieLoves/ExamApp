"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"

interface ConfirmExamFinishProps {
  isFinish: boolean
  onConfirm?: () => void
}

export function ConfirmExamFinish({ isFinish, onConfirm }: ConfirmExamFinishProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-30 h-10 text-xl">Закончить</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
          {!isFinish && <AlertDialogDescription>Вы еще не ответили на все вопросы</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отменить</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Закончить тестирование</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

