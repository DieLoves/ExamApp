'use client';

import type React from 'react';

import { AppFooter } from '@/components/layout/app-footer';
import { AppLayout } from '@/components/layout/app-layout';
import { SliderDemo } from '@/components/slide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APP_NAME } from '@/config';
import { loadExamSettings, saveExamSettings } from '@/lib/tauri-store';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/next';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ExamSettings {
	studentName: string;
	tasksCount: number;
	timeTaken: number;
}

export default function ExamSetting() {
	const router = useRouter();
	const [studentName, setStudentName] = useState('');
	const [tasksCount, setTasksCount] = useState(30);
	const [timeTaken, setTimeTaken] = useState(40);
	const [nameError, setNameError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [appName, setAppName] = useState('');

	// Load previous settings when component mounts
	useEffect(() => {
		const loadSettings = async () => {
			try {
				const savedSettings = await loadExamSettings();

				if (savedSettings) {
					setStudentName(savedSettings.studentName || '');
					setTasksCount(savedSettings.tasksCount || 30);
					setTimeTaken(savedSettings.timeTaken || 40);
				}

				// Set app name after component mounts to avoid hydration issues
				setAppName(APP_NAME);
			} catch (error) {
				console.error('Error loading exam settings:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadSettings();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!studentName.trim()) {
			setNameError(true);
			return;
		}

		const settings: ExamSettings = {
			studentName,
			tasksCount,
			timeTaken,
		};

		// Save settings
		try {
			await saveExamSettings(settings);
			router.push('/exam');
		} catch (error) {
			console.error('Error saving exam settings:', error);
			// Fallback to localStorage and continue
			localStorage.setItem('examSettings', JSON.stringify(settings));
			router.push('/exam');
		}
	};

	const footer = (
		<AppFooter>
			<Button
				type='button'
				variant='outline'
				onClick={() => router.push('/')}
				className='h-10'
			>
				Назад
			</Button>
			<Button type='submit' className='h-10' onClick={handleSubmit}>
				Начать
			</Button>
		</AppFooter>
	);

	return (
		<AppLayout
			isLoading={isLoading}
			headerTitle='Настройки тестирования'
			showVersion={true}
			footer={footer}
		>
			<div className='w-full'>
				{appName && (
					<div className='mb-4 text-center'>
						<h2 className='text-lg font-medium'>{appName}</h2>
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-6 w-full'>
					<div className='flex flex-col space-y-1.5'>
						<Label className='text-lg' htmlFor='name'>
							Имя{' '}
							{nameError && (
								<span className='text-red-600 text-sm'>Заполните это поле</span>
							)}
						</Label>
						<Input
							id='name'
							placeholder='Ваше имя'
							value={studentName}
							onChange={e => {
								setStudentName(e.target.value);
								setNameError(false);
							}}
							className={cn(
								'h-12 text-base w-full',
								nameError && 'border-red-600 focus-visible:ring-red-600'
							)}
							required
						/>
					</div>

					<div className='flex flex-col space-y-3 w-full'>
						<Label className='text-lg' htmlFor='tasksCount'>
							Количество заданий: {tasksCount}
						</Label>
						<SliderDemo
							defaultValue={[tasksCount]}
							max={50}
							min={10}
							step={10}
							value={[tasksCount]}
							onValueChange={value => setTasksCount(value[0])}
							className='w-full'
						/>
						<div className='flex justify-between text-sm text-muted-foreground px-1 w-full'>
							<span>10</span>
							<span>20</span>
							<span>30</span>
							<span>40</span>
							<span>50</span>
						</div>
					</div>

					<div className='flex flex-col space-y-3 w-full'>
						<Label className='text-lg' htmlFor='timeTaken'>
							Время на тестирование: {timeTaken} минут
						</Label>
						<SliderDemo
							defaultValue={[timeTaken]}
							max={60}
							min={10}
							step={5}
							value={[timeTaken]}
							onValueChange={value => setTimeTaken(value[0])}
							className='w-full'
						/>
						<div className='flex justify-between text-sm text-muted-foreground px-1 w-full'>
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
			<Analytics />
		</AppLayout>
	);
}
