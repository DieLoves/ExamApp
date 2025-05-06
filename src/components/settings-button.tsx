'use client';

import { Settings } from 'lucide-react';
import { useState } from 'react';
import { SettingsDialog } from './settings-dialog';
import { Button } from './ui/button';

export function SettingsButton() {
	const [showSettings, setShowSettings] = useState(false);

	return (
		<>
			<Button
				variant='ghost'
				size='icon'
				className='rounded-full'
				onClick={() => setShowSettings(true)}
			>
				<Settings className='h-5 w-5' />
				<span className='sr-only'>Настройки</span>
			</Button>

			<SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
		</>
	);
}
