'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSettings } from '@/contexts/settings-context';
import { clearAllData } from '@/lib/tauri-store';
import { useTheme } from 'next-themes';
import { useState } from 'react';

interface SettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
	const { fontSize, setFontSize } = useSettings();
	const { theme, setTheme } = useTheme();
	const [showClearDataAlert, setShowClearDataAlert] = useState(false);

	const handleClearAllData = async () => {
		try {
			await clearAllData();
			setShowClearDataAlert(false);
			alert('Все данные успешно удалены');

			// Перезагрузка страницы для применения изменений
			window.location.reload();
		} catch (error) {
			console.error('Ошибка при очистке данных:', error);
			alert('Произошла ошибка при удалении данных');
		}
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Настройки приложения</DialogTitle>
						<DialogDescription>
							Настройте внешний вид и поведение приложения
						</DialogDescription>
					</DialogHeader>

					<div className='py-4 space-y-6'>
						<div className='space-y-3'>
							<Label className='text-lg'>Размер шрифта</Label>
							<RadioGroup
								value={fontSize}
								onValueChange={value => setFontSize(value as any)}
								className='flex flex-col space-y-2'
							>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='small' id='small' />
									<Label htmlFor='small' className='text-base'>
										Маленький
									</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='medium' id='medium' />
									<Label htmlFor='medium' className='text-base'>
										Средний
									</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='large' id='large' />
									<Label htmlFor='large' className='text-base'>
										Большой
									</Label>
								</div>
							</RadioGroup>
						</div>

						<div className='space-y-3'>
							<Label className='text-lg'>Тема оформления</Label>
							<RadioGroup
								value={theme || 'system'}
								onValueChange={setTheme}
								className='flex flex-col space-y-2'
							>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='light' id='light' />
									<Label htmlFor='light' className='text-base'>
										Светлая
									</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='dark' id='dark' />
									<Label htmlFor='dark' className='text-base'>
										Темная
									</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='system' id='system' />
									<Label htmlFor='system' className='text-base'>
										Системная (рекомендуется)
									</Label>
								</div>
							</RadioGroup>
						</div>

						<div className='pt-4 border-t'>
							<h3 className='text-lg font-medium mb-2'>Управление данными</h3>
							<p className='text-sm text-muted-foreground mb-4'>
								Вы можете удалить все сохраненные данные приложения, включая
								настройки и результаты тестов.
							</p>
							<Button
								variant='destructive'
								onClick={() => setShowClearDataAlert(true)}
								className='w-full'
							>
								Удалить все данные
							</Button>
						</div>
					</div>

					<DialogFooter>
						<Button onClick={() => onOpenChange(false)}>Закрыть</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={showClearDataAlert}
				onOpenChange={setShowClearDataAlert}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Удаление всех данных</AlertDialogTitle>
						<AlertDialogDescription>
							Вы уверены, что хотите удалить все сохраненные данные? Это
							действие нельзя отменить.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Отмена</AlertDialogCancel>
						<AlertDialogAction onClick={handleClearAllData}>
							Удалить
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
