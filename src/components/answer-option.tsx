'use client';

import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

interface AnswerOptionProps {
	index: number;
	text: string;
	isSelected: boolean;
	onClick: () => void;
}

export function AnswerOption({
	index,
	text,
	isSelected,
	onClick,
}: AnswerOptionProps) {
	return (
		<button
			className={cn(
				'flex items-center w-full p-3 rounded-md border text-left transition-all',
				isSelected
					? 'bg-primary/10 border-primary/50 border-2'
					: 'hover:bg-secondary/50 border-border'
			)}
			onClick={onClick}
		>
			<div className='mr-3'>
				{isSelected ? (
					<div className='h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground'>
						{index + 1}
					</div>
				) : (
					<div className='h-6 w-6 rounded-full border-2 border-muted-foreground flex items-center justify-center'>
						{index + 1}
					</div>
				)}
			</div>
			<div className='flex-1 text-base sm:text-lg'>{text}</div>
			<div className='ml-2'>
				{isSelected && (
					<Circle className='h-5 w-5 fill-primary stroke-primary-foreground' />
				)}
			</div>
		</button>
	);
}
