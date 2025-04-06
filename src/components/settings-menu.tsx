'use client';

import { useSettings } from '@/contexts/settings-context';
import { Monitor, Moon, Settings, Sun, Type } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function SettingsMenu() {
	const { setTheme } = useTheme();
	const { fontSize, setFontSize } = useSettings();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='icon' className='rounded-full'>
					<Settings className='h-5 w-5' />
					<span className='sr-only'>Настройки</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56' align='end'>
				<DropdownMenuLabel>Настройки приложения</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<Sun className='mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
							<Moon className='absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
							<span>Тема</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuItem onClick={() => setTheme('light')}>
									<Sun className='mr-2 h-4 w-4' />
									<span>Светлая</span>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme('dark')}>
									<Moon className='mr-2 h-4 w-4' />
									<span>Темная</span>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme('system')}>
									<Monitor className='mr-2 h-4 w-4' />
									<span>Системная</span>
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<Type className='mr-2 h-4 w-4' />
							<span>Размер шрифта</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuRadioGroup
									value={fontSize}
									onValueChange={value => setFontSize(value as any)}
								>
									<DropdownMenuRadioItem value='small'>
										Маленький
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value='medium'>
										Средний
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value='large'>
										Большой
									</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
