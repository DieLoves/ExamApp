'use client';

import { ExternalLink } from '@/components/external-link';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { VersionSwitcher } from '@/components/version-switcher';
import { APP_VERSION, checkIsTauriEnvironment } from '@/config';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
	const router = useRouter();
	const [appVersion, setAppVersion] = useState('');
	const [isWeb, setIsWeb] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	// Initialize state after component mounts to avoid hydration mismatch
	useEffect(() => {
		const initApp = async () => {
			setAppVersion(APP_VERSION);

			// Use the async function to reliably detect Tauri
			const isTauriEnv = await checkIsTauriEnvironment();
			setIsWeb(!isTauriEnv);
			setIsLoaded(true);
		};

		initApp();
	}, []);

	const handleStartExam = () => {
		router.push('/exam/settings');
	};

	// Function to switch version in web mode
	const switchVersion = (version: string) => {
		if (isWeb) {
			window.location.href = `?version=${version}`;
		}
	};

	return (
		<AppLayout isLoading={!isLoaded} centerContent={true}>
			<div className='text-center w-full max-w-md'>
				<h1 className='text-4xl sm:text-6xl font-bold mb-4'>Привет.</h1>
				<h2 className='text-2xl sm:text-4xl mb-8'>Готов к тестированию?</h2>
				<Button
					className='h-14 px-8 text-xl sm:text-2xl mb-4'
					onClick={handleStartExam}
				>
					Начать!
				</Button>

				{/* Show version switcher only in web version */}
				{isWeb && (
					<VersionSwitcher
						currentVersion={appVersion}
						onSwitchVersion={switchVersion}
					/>
				)}

				<p className='text-gray-400 mt-4'>
					Обновления приложения (Версия на IOS):{' '}
					<ExternalLink
						href='https://t.me/+Att5GS3hnLsyMjJi'
						className='text-blue-500'
					>
						Телеграм
					</ExternalLink>
				</p>
			</div>
		</AppLayout>
	);
}
