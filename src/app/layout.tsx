import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type React from 'react';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Система тестирования',
	description: 'Приложение для проведения тестирования',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='ru' suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased font-size-medium`}
			>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<SettingsProvider>{children}</SettingsProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
