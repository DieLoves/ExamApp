/**
 * Утилиты для работы с Tauri Store API
 */

// Типы для настроек
export interface AppSettings {
	fontSize: 'small' | 'medium' | 'large';
	theme: string | null;
	// isKeepScreenOn: boolean;
}

export interface ExamSettings {
	studentName: string;
	tasksCount: number;
	timeTaken: number;
	selectedModules: number[]; // Добавляем массив ID выбранных модулей
}

// Update the ExamResult interface to include terminationReason
export interface ExamResult {
	studentName: string;
	date: string;
	score: number;
	pointsScore: number;
	gradeScore: number;
	timeSpent: number;
	questionsCount: number;
	correctAnswers: number;
	terminationReason?: string | null; // Add this field
}

export interface ExamProgress {
	currentQuestion: number;
	selectedAnswers: Record<number, number>;
	selectedOriginalAnswers: Record<number, number>;
	startTime: string;
	progress: number;
	questions: any[]; // Тип для вопросов с перемешанными ответами
}

/**
 * Проверяет, запущено ли приложение в Tauri
 */
export function isTauri(): boolean {
	// More reliable check for Tauri environment
	return (
		typeof window !== 'undefined' &&
		(window.__TAURI__ !== undefined ||
			// Check for Tauri's global object
			'__TAURI_METADATA__' in window ||
			// Check for Tauri IPC
			navigator.userAgent.includes('Tauri'))
	);
}

/**
 * Получает экземпляр хранилища Tauri
 */
async function getStore(name: string) {
	try {
		if (isTauri()) {
			const { load } = await import('@tauri-apps/plugin-store');
			return await load(name);
		}
		return null;
	} catch (error) {
		console.error(`Ошибка при получении хранилища ${name}:`, error);
		return null;
	}
}

/**
 * Сохраняет настройки приложения
 */
export async function saveAppSettings(settings: AppSettings): Promise<void> {
	try {
		if (isTauri()) {
			const store = await getStore('settings.dat');
			if (store) {
				await store.set('appSettings', settings);
				await store.save();
				return;
			}
		}

		// Fallback для веб-версии
		localStorage.setItem('appSettings', JSON.stringify(settings));
	} catch (error) {
		console.error('Ошибка при сохранении настроек приложения:', error);
		// Fallback для веб-версии
		localStorage.setItem('appSettings', JSON.stringify(settings));
	}
}

/**
 * Загружает настройки приложения
 */
export async function loadAppSettings(): Promise<AppSettings | null> {
	try {
		if (isTauri()) {
			const store = await getStore('settings.dat');
			if (store) {
				return (await store.get('appSettings')) as AppSettings | null;
			}
		}

		// Fallback для веб-версии
		const settings = localStorage.getItem('appSettings');
		return settings ? JSON.parse(settings) : null;
	} catch (error) {
		console.error('Ошибка при загрузке настроек приложения:', error);
		// Fallback для веб-версии
		const settings = localStorage.getItem('appSettings');
		return settings ? JSON.parse(settings) : null;
	}
}

/**
 * Сохраняет настройки экзамена
 */
export async function saveExamSettings(settings: ExamSettings): Promise<void> {
	try {
		if (isTauri()) {
			const store = await getStore('exam-settings.dat');
			if (store) {
				await store.set('examSettings', settings);
				await store.save();
				return;
			}
		}

		// Fallback для веб-версии
		localStorage.setItem('examSettings', JSON.stringify(settings));
	} catch (error) {
		console.error('Ошибка при сохранении настроек экзамена:', error);
		// Fallback для веб-версии
		localStorage.setItem('examSettings', JSON.stringify(settings));
	}
}

/**
 * Загружает настройки экзамена
 */
export async function loadExamSettings(): Promise<ExamSettings | null> {
	try {
		if (isTauri()) {
			const store = await getStore('exam-settings.dat');
			if (store) {
				return (await store.get('examSettings')) as ExamSettings | null;
			}
		}

		// Fallback для веб-версии
		const settings = localStorage.getItem('examSettings');
		return settings ? JSON.parse(settings) : null;
	} catch (error) {
		console.error('Ошибка при загрузке настроек экзамена:', error);
		// Fallback для веб-версии
		const settings = localStorage.getItem('examSettings');
		return settings ? JSON.parse(settings) : null;
	}
}

/**
 * Сохраняет результаты экзамена
 */
export async function saveExamResult(result: ExamResult): Promise<void> {
	try {
		if (isTauri()) {
			const store = await getStore('exam-results.dat');
			if (store) {
				// Получаем существующие результаты
				const existingResults =
					((await store.get('examResults')) as ExamResult[] | null) || [];

				// Добавляем новый результат
				const updatedResults = [...existingResults, result];

				// Сохраняем обновленный список
				await store.set('examResults', updatedResults);

				// Сохраняем последний результат отдельно
				await store.set('lastExamResult', result);
				await store.save();
				return;
			}
		}

		// Fallback для веб-версии
		const existingResults = localStorage.getItem('examResults');
		const results = existingResults
			? (JSON.parse(existingResults) as ExamResult[])
			: [];
		results.push(result);
		localStorage.setItem('examResults', JSON.stringify(results));
		localStorage.setItem('lastExamResult', JSON.stringify(result));
	} catch (error) {
		console.error('Ошибка при сохранении результатов экзамена:', error);
		// Fallback для веб-версии
		const existingResults = localStorage.getItem('examResults');
		const results = existingResults
			? (JSON.parse(existingResults) as ExamResult[])
			: [];
		results.push(result);
		localStorage.setItem('examResults', JSON.stringify(results));
		localStorage.setItem('lastExamResult', JSON.stringify(result));
	}
}

/**
 * Сохраняет прогресс экзамена
 */
export async function saveExamProgress(progress: ExamProgress): Promise<void> {
	try {
		if (isTauri()) {
			const store = await getStore('exam-progress.dat');
			if (store) {
				await store.set('examProgress', progress);
				await store.save();
				return;
			}
		}

		// Fallback для веб-версии
		sessionStorage.setItem('examProgress', JSON.stringify(progress));
	} catch (error) {
		console.error('Ошибка при сохранении прогресса экзамена:', error);
		// Fallback для веб-версии
		sessionStorage.setItem('examProgress', JSON.stringify(progress));
	}
}

/**
 * Загружает прогресс экзамена
 */
export async function loadExamProgress(): Promise<ExamProgress | null> {
	try {
		if (isTauri()) {
			const store = await getStore('exam-progress.dat');
			if (store) {
				return (await store.get('examProgress')) as ExamProgress | null;
			}
		}

		// Fallback для веб-версии
		const progress = sessionStorage.getItem('examProgress');
		return progress ? JSON.parse(progress) : null;
	} catch (error) {
		console.error('Ошибка при загрузке прогресса экзамена:', error);
		// Fallback для веб-версии
		const progress = sessionStorage.getItem('examProgress');
		return progress ? JSON.parse(progress) : null;
	}
}

/**
 * Очищает прогресс экзамена
 */
export async function clearExamProgress(): Promise<void> {
	try {
		if (isTauri()) {
			const store = await getStore('exam-progress.dat');
			if (store) {
				await store.delete('examProgress');
				await store.save();
				return;
			}
		}

		// Fallback для веб-версии
		sessionStorage.removeItem('examProgress');
	} catch (error) {
		console.error('Ошибка при очистке прогресса экзамена:', error);
		// Fallback для веб-версии
		sessionStorage.removeItem('examProgress');
	}
}

/**
 * Очищает все сохраненные данные
 */
export async function clearAllData(): Promise<void> {
	try {
		if (isTauri()) {
			// Очистка настроек приложения
			const settingsStore = await getStore('settings.dat');
			if (settingsStore) {
				await settingsStore.clear();
				await settingsStore.save();
			}

			// Очистка настроек экзамена
			const examSettingsStore = await getStore('exam-settings.dat');
			if (examSettingsStore) {
				await examSettingsStore.clear();
				await examSettingsStore.save();
			}

			// Очистка результатов экзамена
			const examResultsStore = await getStore('exam-results.dat');
			if (examResultsStore) {
				await examResultsStore.clear();
				await examResultsStore.save();
			}

			// Очистка прогресса экзамена
			const examProgressStore = await getStore('exam-progress.dat');
			if (examProgressStore) {
				await examProgressStore.clear();
				await examProgressStore.save();
			}

			return;
		}

		// Fallback для веб-версии
		localStorage.clear();
		sessionStorage.clear();
	} catch (error) {
		console.error('Ошибка при очистке данных:', error);
		// Fallback для веб-версии
		localStorage.clear();
		sessionStorage.clear();
	}
}

// Add a function to detect if we're running on mobile using Tauri
/**
 * Определяет, запущено ли приложение на мобильном устройстве
 */
export async function isMobileDevice(): Promise<boolean> {
	try {
		if (isTauri()) {
			const { platform } = await import('@tauri-apps/plugin-os');
			const platformType = platform();
			// Tauri 2.0 platform returns "android" or "ios" for mobile
			return platformType === 'android' || platformType === 'ios';
		}

		// Fallback for web - check window width
		return typeof window !== 'undefined' && window.innerWidth < 768;
	} catch (error) {
		console.error('Ошибка при определении устройства:', error);
		// Fallback to window size check
		return typeof window !== 'undefined' && window.innerWidth < 768;
	}
}
