'use client';

import type React from 'react'

import {
	loadAppSettings,
	saveAppSettings,
} from '@/lib/tauri-store'
import { createContext, useContext, useEffect, useState } from 'react'

type FontSize = 'small' | 'medium' | 'large';

interface SettingsContextType {
	fontSize: FontSize;
	setFontSize: (size: FontSize) => void;
	// setKeepScreenOn: (enabled: boolean) => void;
	loadTauriSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined
);

// Добавим функцию для немедленного применения размера шрифта
// и вызовем её при загрузке настроек

// Добавим функцию applyFontSize
const applyFontSize = (size: FontSize) => {
	const root = document.documentElement;
	const body = document.body;

	// Удаляем все классы размера шрифта
	body.classList.remove(
		'font-size-small',
		'font-size-medium',
		'font-size-large'
	);

	// Добавляем соответствующий класс
	body.classList.add(`font-size-${size}`);

	// Также устанавливаем CSS-переменную для совместимости
	switch (size) {
		case 'small':
			root.style.setProperty('--base-font-size', '16px');
			break;
		case 'medium':
			root.style.setProperty('--base-font-size', '20px');
			break;
		case 'large':
			root.style.setProperty('--base-font-size', '24px');
			break;
	}
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
	const [fontSize, setFontSize] = useState<FontSize>('medium');
	const [initialized, setInitialized] = useState(false);
	// const [keepScreenOn, setKeepScreenOn] = useState(true);

	// Load settings from Tauri Store or localStorage
	// Изменим функцию loadTauriSettings, чтобы она применяла размер шрифта сразу
	const loadTauriSettings = async () => {
		try {
			const settings = await loadAppSettings();

			if (settings?.fontSize) {
				setFontSize(settings.fontSize);
				applyFontSize(settings.fontSize);
			} else {
				// Set default based on device using Tauri API
				const defaultSize = 'small';
				setFontSize(defaultSize);
				applyFontSize(defaultSize);
				await saveAppSettings({
					fontSize: defaultSize,
					theme: null,
					// isKeepScreenOn: keepScreenOn,
				});
			}

			// if (settings?.isKeepScreenOn) {
			// 	setKeepScreenOn(settings.isKeepScreenOn);
			// 	applyScreenKeepOn(settings.isKeepScreenOn);
			// } else {
			// 	setKeepScreenOn(true);
			// 	applyScreenKeepOn(true);
			// 	await saveAppSettings({
			// 		fontSize,
			// 		theme: null,
			// 		isKeepScreenOn: keepScreenOn,
			// 	});
			// }
		} catch (error) {
			console.error('Error loading settings:', error);
			// Fallback to localStorage
			const savedFontSize = localStorage.getItem(
				'appFontSize'
			) as FontSize | null;
			if (savedFontSize) {
				setFontSize(savedFontSize);
				applyFontSize(savedFontSize);
			} else {
				// Use fallback device detection
				const defaultSize = 'small';
				setFontSize(defaultSize);
				applyFontSize(defaultSize);
				localStorage.setItem('appFontSize', defaultSize);
			}
		}

		setInitialized(true);
	};

	// Load settings on mount
	useEffect(() => {
		loadTauriSettings();
	}, []);

	// Apply font size to the document when it changes
	// Изменим useEffect для применения размера шрифта
	useEffect(() => {
		if (!initialized) return;

		// Save to localStorage as fallback
		localStorage.setItem('appFontSize', fontSize);
		// localStorage.setItem('keepScreenOn', `${keepScreenOn}`);

		// Apply font size
		applyFontSize(fontSize);

		// Save to Tauri Store
		saveAppSettings({
			fontSize,
			theme: localStorage.getItem('theme'),
		}).catch(console.error);
	}, [fontSize, initialized]);

	return (
		<SettingsContext.Provider
			value={{ fontSize, setFontSize, loadTauriSettings }}
		>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	const context = useContext(SettingsContext);
	if (context === undefined) {
		throw new Error('useSettings must be used within a SettingsProvider');
	}
	return context;
}

// Add TypeScript declaration for Tauri
declare global {
	interface Window {
		__TAURI__?: {
			invoke: (cmd: string, args?: any) => Promise<any>;
		};
	}
}
