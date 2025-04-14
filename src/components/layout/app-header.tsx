'use client';

import { APP_CODE_VERSION, APP_NAME } from '@/config';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SettingsButton } from '../settings-button';
import { Button } from '../ui/button';

interface AppHeaderProps {
	title?: string;
	showBackButton?: boolean;
	showVersion?: boolean;
	onBackClick?: () => void;
}

export function AppHeader({
	title,
	showBackButton = false,
	showVersion = true,
	onBackClick,
}: AppHeaderProps) {
	const router = useRouter();

	const handleBackClick = () => {
		if (onBackClick) {
			onBackClick();
		} else {
			router.push('/');
		}
	};

	return (
		<header className='sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4 flex justify-between items-center'>
			<div className='flex items-center'>
				{showBackButton && (
					<Button
						variant='ghost'
						size='icon'
						className='mr-2'
						onClick={handleBackClick}
					>
						<ArrowLeft className='h-5 w-5' />
					</Button>
				)}
				<h1 className='text-xl font-semibold'>
					{title || 'Exam App'}{' '}
					{showVersion && (
						<span className='text-sm text-muted-foreground font-normal'>
							{APP_NAME}
						</span>
					)}
				</h1>
			</div>
			<div className='flex items-center gap-2'>
				{showVersion && (
					<span className='text-sm text-muted-foreground mr-2'>
						v.{APP_CODE_VERSION}
					</span>
				)}
				<SettingsButton />
			</div>
		</header>
	);
}
