'use client';

import { Analytics } from '@vercel/analytics/next';
import type { ReactNode } from 'react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { AppHeader } from './app-header';

interface AppLayoutProps {
	children?: ReactNode;
	isLoading?: boolean;
	headerTitle?: string;
	showVersion?: boolean;
	footer?: ReactNode;
	centerContent?: boolean;
}

export function AppLayout({
	children,
	isLoading = false,
	headerTitle,
	showVersion = true,
	footer,
	centerContent = false,
}: AppLayoutProps) {
	if (isLoading) {
		return <LoadingSpinner message='Загрузка...' />;
	}

	return (
		<div className='min-h-screen flex flex-col bg-background'>
			<AppHeader title={headerTitle} showVersion={showVersion} />
			<main
				className={`flex-1 p-4 ${
					centerContent ? 'flex flex-col justify-center items-center' : ''
				}`}
			>
				{children}
			</main>
			<Analytics />
			{footer}
		</div>
	);
}
