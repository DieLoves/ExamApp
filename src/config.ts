'use client';

// Конфигурационный файл для выбора версии приложения
import { isTauri } from './lib/tauri-store';

// Function to get app version from URL query parameter or environment variable
function getAppVersion(): string {
	// Default version from environment variable
	const defaultVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'tech';

	// Check if we're in a browser environment (not Tauri) and on the client side
	if (typeof window !== 'undefined' && !isTauri()) {
		try {
			// Get the URL query parameters
			const urlParams = new URLSearchParams(window.location.search);
			// Check if 'version' parameter exists
			const versionParam = urlParams.get('version');

			// If version parameter exists and is valid, use it
			if (versionParam && ['tech', 'human'].includes(versionParam)) {
				return versionParam;
			}
		} catch (error) {
			console.error('Error parsing URL parameters:', error);
		}
	}

	// Fall back to environment variable or default
	return defaultVersion;
}

// Export the app version
export const APP_VERSION = getAppVersion();

// Export other config values based on app version
export const APP_NAME =
	APP_VERSION === 'tech' ? 'Техник версия' : 'Гуманитарная версия';
export const DATA_FILE = APP_VERSION === 'tech' ? '/tech.json' : '/human.json';
export const APP_CODE_VERSION = '1.0.0';

// Export the function to check if we're running in a browser
export function isWebVersion(): boolean {
	// More reliable check for web environment (not Tauri)
	if (typeof window === 'undefined') return false;

	// Explicitly check for Tauri environment
	return !isTauri();
}

// Add a function to detect Tauri environment using async API
export async function checkIsTauriEnvironment(): Promise<boolean> {
	if (typeof window === 'undefined') return false;

	try {
		// Try to import Tauri API - this will fail in web environments
		const tauriApp = await import('@tauri-apps/api/app');
		// If we can get the app name, we're definitely in Tauri
		await tauriApp.getName();
		return true;
	} catch (error) {
		// If import fails or API call fails, we're not in Tauri
		return false;
	}
}
