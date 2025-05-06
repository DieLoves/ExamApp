'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { IExamFileQuestions, IExamModule } from '@/types/exam.types';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ModuleQuestionRange {
	moduleId: number;
	startQuestion: number;
	endQuestion: number;
	count: number;
}

interface ModuleSelectorProps {
	modules: IExamModule[];
	questions: IExamFileQuestions[];
	selectedModules: number[];
	onChange: (selectedModules: number[]) => void;
}

export function ModuleSelector({
	modules,
	questions,
	selectedModules,
	onChange,
}: ModuleSelectorProps) {
	const [selected, setSelected] = useState<number[]>(selectedModules);
	const [moduleRanges, setModuleRanges] = useState<
		Record<number, ModuleQuestionRange>
	>({});

	// Обновляем локальное состояние при изменении пропсов
	useEffect(() => {
		setSelected(selectedModules);
	}, [selectedModules]);

	// Вычисляем диапазоны вопросов для каждого модуля
	useEffect(() => {
		if (!questions || questions.length === 0) return;

		const ranges: Record<number, ModuleQuestionRange> = {};

		// Инициализируем объект для каждого модуля
		modules.forEach(module => {
			ranges[module.id] = {
				moduleId: module.id,
				startQuestion: Number.POSITIVE_INFINITY,
				endQuestion: -1,
				count: 0,
			};
		});

		// Проходим по всем вопросам и обновляем диапазоны
		questions.forEach((question, index) => {
			const questionNumber = index + 1;
			const moduleId = question.moduleId;

			if (ranges[moduleId]) {
				// Обновляем начальный вопрос (минимальный номер)
				if (questionNumber < ranges[moduleId].startQuestion) {
					ranges[moduleId].startQuestion = questionNumber;
				}

				// Обновляем конечный вопрос (максимальный номер)
				if (questionNumber > ranges[moduleId].endQuestion) {
					ranges[moduleId].endQuestion = questionNumber;
				}

				// Увеличиваем счетчик вопросов для этого модуля
				ranges[moduleId].count++;
			}
		});

		setModuleRanges(ranges);
	}, [modules, questions]);

	// Обработчик изменения выбора модуля
	const handleModuleToggle = (e: React.MouseEvent, moduleId: number) => {
		// Предотвращаем всплытие события, чтобы не срабатывала отправка формы
		e.preventDefault();
		e.stopPropagation();

		const newSelected = selected.includes(moduleId)
			? selected.filter(id => id !== moduleId)
			: [...selected, moduleId];

		setSelected(newSelected);
		onChange(newSelected);
	};

	// Выбрать все модули
	const selectAll = (e: React.MouseEvent) => {
		e.preventDefault();
		const allModuleIds = modules.map(module => module.id);
		setSelected(allModuleIds);
		onChange(allModuleIds);
	};

	// Снять выбор со всех модулей
	const deselectAll = (e: React.MouseEvent) => {
		e.preventDefault();
		setSelected([]);
		onChange([]);
	};

	// Получаем общее количество вопросов для выбранных модулей
	const getSelectedQuestionsCount = () => {
		return selected.reduce((total, moduleId) => {
			return total + (moduleRanges[moduleId]?.count || 0);
		}, 0);
	};

	return (
		<Card className='w-full'>
			<CardHeader>
				<CardTitle>Выбор модулей</CardTitle>
				<CardDescription>
					Выберите модули, которые будут включены в тестирование
					{selected.length > 0 && (
						<div className='mt-2 text-sm font-medium'>
							Выбрано вопросов: {getSelectedQuestionsCount()} из{' '}
							{questions.length}
						</div>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
					{modules.map(module => {
						const range = moduleRanges[module.id];
						const hasRange =
							range &&
							range.startQuestion !== Number.POSITIVE_INFINITY &&
							range.endQuestion !== -1;
						const isSelected = selected.includes(module.id);

						return (
							<div
								key={module.id}
								className={cn(
									'flex items-center w-full p-3 rounded-md border text-left transition-all cursor-pointer',
									isSelected
										? 'bg-primary/10 border-primary/50 border-2'
										: 'hover:bg-secondary/50 border-border'
								)}
								onClick={e => handleModuleToggle(e, module.id)}
								role='button'
								tabIndex={0}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ') {
										handleModuleToggle(
											e as unknown as React.MouseEvent,
											module.id
										);
									}
								}}
							>
								<div className='mr-3'>
									{isSelected ? (
										<div className='h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground'>
											{module.id + 1}
										</div>
									) : (
										<div className='h-6 w-6 rounded-full border-2 border-muted-foreground flex items-center justify-center'>
											{module.id + 1}
										</div>
									)}
								</div>
								<div className='flex-1'>
									<div className='text-base sm:text-lg font-medium'>
										Модуль {module.id + 1}. {module.title}
									</div>
									{hasRange && (
										<div className='text-sm text-muted-foreground mt-1'>
											Вопросы {range.startQuestion}-{range.endQuestion} (
											{range.count} шт.)
										</div>
									)}
								</div>
								<div className='ml-2'>
									{isSelected && (
										<CheckCircle className='h-5 w-5 fill-primary stroke-primary-foreground' />
									)}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
			<CardFooter className='flex justify-between'>
				<Button
					type='button'
					variant='outline'
					onClick={deselectAll}
					disabled={selected.length === 0}
				>
					Снять выбор
				</Button>
				<Button
					type='button'
					variant='outline'
					onClick={selectAll}
					disabled={selected.length === modules.length}
				>
					Выбрать все
				</Button>
			</CardFooter>
		</Card>
	);
}
