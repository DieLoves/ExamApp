import { Progress } from '../ui/progress';

interface ExamProgressProps {
	currentQuestion: number;
	totalQuestions: number;
	progressPercentage: number;
}

export function ExamProgress({
	currentQuestion,
	totalQuestions,
	progressPercentage,
}: ExamProgressProps) {
	return (
		<div className='mt-4'>
			<div className='flex justify-between items-center mb-1'>
				<span className='text-base'>
					Вопрос {currentQuestion + 1} из {totalQuestions}
				</span>
				<span className='text-sm text-muted-foreground'>
					Прогресс: {Math.round(progressPercentage)}%
				</span>
			</div>
			<Progress value={progressPercentage} className='h-2' />
		</div>
	);
}
