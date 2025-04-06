import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function shuffle<T>(array: T[]): T[] {
	const currentIndex = array.length;
	const randomValues = new Uint32Array(currentIndex);

	// Генерируем криптографически безопасные случайные числа
	crypto.getRandomValues(randomValues);

	for (let i = currentIndex - 1; i > 0; i--) {
		// Нормализуем случайное число в диапазоне [0, i]
		const randomIndex = Math.floor(
			(randomValues[i] / (0xffffffff + 1)) * (i + 1)
		);

		// Меняем местами элементы
		[array[i], array[randomIndex]] = [array[randomIndex], array[i]];
	}

	return array;
}
