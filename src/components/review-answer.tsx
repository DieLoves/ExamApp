import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

interface ReviewAnswerProps {
	index: number;
	text: string;
	isSelected: boolean;
	isCorrect: boolean;
}

export function ReviewAnswer({
	index,
	text,
	isSelected,
	isCorrect,
}: ReviewAnswerProps) {
	let bgColor = '';
	if (isSelected && isCorrect) bgColor = 'bg-green-100 dark:bg-green-900/30';
	else if (isSelected && !isCorrect) bgColor = 'bg-red-100 dark:bg-red-900/30';
	else if (!isSelected && isCorrect)
		bgColor = 'bg-green-50 dark:bg-green-900/20';

	return (
		<div
			className={cn(
				'flex items-center p-3 rounded-md border',
				bgColor,
				isSelected && 'border-2',
				isSelected && isCorrect
					? 'border-green-500'
					: isSelected && !isCorrect
					? 'border-red-500'
					: !isSelected && isCorrect
					? 'border-green-300'
					: 'border-gray-200'
			)}
		>
			<div className='mr-3'>
				<div
					className={cn(
						'h-6 w-6 rounded-full flex items-center justify-center',
						isSelected && isCorrect
							? 'bg-green-500 text-white'
							: isSelected && !isCorrect
							? 'bg-red-500 text-white'
							: !isSelected && isCorrect
							? 'bg-green-200 text-green-800'
							: 'border-2 border-muted-foreground'
					)}
				>
					{index + 1}
				</div>
			</div>
			<div className='flex-1 text-base sm:text-lg'>{text}</div>
			<div className='ml-2'>
				{isSelected && isCorrect && (
					<CheckCircle className='h-5 w-5 text-green-500' />
				)}
				{isSelected && !isCorrect && (
					<XCircle className='h-5 w-5 text-red-500' />
				)}
				{!isSelected && isCorrect && (
					<CheckCircle className='h-5 w-5 text-green-500 opacity-50' />
				)}
			</div>
		</div>
	);
}
