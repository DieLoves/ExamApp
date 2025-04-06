import { cn } from '@/lib/utils';
import { Calendar, Clock, User, XCircle } from 'lucide-react';
import { formatElapsedTime } from '../timer';
import { Progress } from '../ui/progress';

interface ExamResultsProps {
	studentName: string;
	examDate: Date | null;
	timeSpent: number;
	terminationReason: string | null;
	finalScore: number;
	pointsScore: number;
	gradeScore: number;
	correctAnswers: number;
	totalQuestions: number;
	selectedAnswers: Record<number, number>;
	isAnswerCorrect: (index: number) => boolean;
}

export function ExamResults({
	studentName,
	examDate,
	timeSpent,
	terminationReason,
	finalScore,
	pointsScore,
	gradeScore,
	correctAnswers,
	totalQuestions,
	selectedAnswers,
	isAnswerCorrect,
}: ExamResultsProps) {
	return (
		<div className='space-y-6'>
			<div className='flex flex-col gap-2 mt-2 text-base'>
				<div className='flex items-center gap-2'>
					<User className='h-4 w-4' />
					<span>Студент: {studentName}</span>
				</div>
				<div className='flex items-center gap-2'>
					<Calendar className='h-4 w-4' />
					<span>
						Дата:{' '}
						{examDate
							? new Intl.DateTimeFormat('ru-RU', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
							  }).format(examDate)
							: 'Не указана'}
					</span>
				</div>
				<div className='flex items-center gap-2'>
					<Clock className='h-4 w-4' />
					<span>Время выполнения: {formatElapsedTime(timeSpent)}</span>
				</div>
				{terminationReason && (
					<div className='flex items-center gap-2 text-red-500'>
						<XCircle className='h-4 w-4' />
						<span>Причина завершения: {terminationReason}</span>
					</div>
				)}
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-6'>
				<div className='flex flex-col items-center p-3 border rounded-lg'>
					<div className='text-base font-medium mb-1'>Процент</div>
					<div className='text-2xl sm:text-3xl font-bold'>
						{finalScore.toFixed(1)}%
					</div>
				</div>
				<div className='flex flex-col items-center p-3 border rounded-lg'>
					<div className='text-base font-medium mb-1'>Баллы</div>
					<div className='text-2xl sm:text-3xl font-bold'>
						{pointsScore}/100
					</div>
				</div>
				<div className='flex flex-col items-center p-3 border rounded-lg'>
					<div className='text-base font-medium mb-1'>Оценка</div>
					<div className='text-2xl sm:text-3xl font-bold'>{gradeScore}/5</div>
				</div>
			</div>

			<div className='text-lg sm:text-xl mt-6'>
				Правильных ответов: {correctAnswers} из {totalQuestions}
			</div>
			<Progress value={finalScore} className='w-full h-3 mt-2' />

			<div className='w-full mt-6'>
				<h3 className='text-base sm:text-lg mb-2'>Результаты по вопросам:</h3>
				<div className='flex flex-wrap gap-2 justify-center'>
					{Array.from({ length: totalQuestions }).map((_, index) => {
						const isAnswered = selectedAnswers[index] !== undefined;
						const isCorrect = isAnswerCorrect(index);

						return (
							<div
								key={`result-${index}`}
								className={cn(
									'h-8 w-8 rounded-full text-sm flex items-center justify-center',
									isAnswered && isCorrect
										? 'bg-green-500 text-white'
										: isAnswered && !isCorrect
										? 'bg-red-500 text-white'
										: 'bg-yellow-500 text-white'
								)}
								title={
									isAnswered
										? isCorrect
											? 'Правильно'
											: 'Неправильно'
										: 'Не отвечено'
								}
							>
								{index + 1}
							</div>
						);
					})}
				</div>
			</div>

			<div className='text-base sm:text-lg mt-6 text-center'>
				{gradeScore >= 4
					? 'Отличный результат! Вы хорошо подготовлены.'
					: gradeScore >= 3
					? 'Хороший результат! Есть некоторые области для улучшения.'
					: 'Вам стоит повторить материал и попробовать снова.'}
			</div>
		</div>
	);
}
