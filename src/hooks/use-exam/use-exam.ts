'use client';

import { DATA_FILE } from '@/config';
import {
	clearExamProgress,
	loadExamSettings,
	saveExamProgress,
	saveExamResult,
	type ExamProgress,
} from '@/lib/tauri-store';
import { shuffle } from '@/lib/utils';
import type { IExamFileQuestions } from '@/types/exam.types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { ExamState, ShuffledQuestion } from './types';

export function useExam() {
	const router = useRouter();
	const [state, setState] = useState<ExamState>({
		settings: null,
		questions: [],
		currentQuestion: 0,
		selectedAnswers: {},
		selectedOriginalAnswers: {},
		isFinished: false,
		finalScore: 0,
		pointsScore: 0,
		gradeScore: 0,
		showResults: false,
		showReview: false,
		progress: 0,
		reviewQuestion: 0,
		startTime: null,
		endTime: null,
		timeSpent: 0,
		isLoading: true,
		examDate: null,
		terminationReason: null,
	});

	// Функция для обновления состояния
	const updateState = useCallback((newState: Partial<ExamState>) => {
		setState(prevState => ({ ...prevState, ...newState }));
	}, []);

	// Инициализация экзамена
	const initExam = useCallback(async () => {
		updateState({ isLoading: true });

		try {
			// Загружаем настройки и инициализируем новый экзамен
			const savedSettings = await loadExamSettings();
			if (!savedSettings) {
				router.push('/exam/settings');
				return;
			}

			// Устанавливаем время начала
			const now = new Date();
			const examDate = now.toISOString();

			// Загружаем вопросы из выбранного файла
			const questionsData = await fetch(DATA_FILE).then(res => res.json());

			// Загружаем и перемешиваем вопросы на основе настроек
			const questionCount = savedSettings.tasksCount || 30;
			const originalQuestions = shuffle<IExamFileQuestions>(
				questionsData.questions
			).slice(0, questionCount);

			// Перемешиваем ответы и отслеживаем оригинальные индексы
			const questionsWithShuffledAnswers: ShuffledQuestion[] =
				originalQuestions.map(q => {
					const answersWithIndices = q.answers.map((answer, index) => ({
						...answer,
						originalIndex: index,
					}));

					return {
						...q,
						answers: shuffle(answersWithIndices),
					};
				});

			updateState({
				settings: savedSettings,
				questions: questionsWithShuffledAnswers,
				startTime: now,
				examDate,
				progress: 0,
				isLoading: false,
			});
		} catch (error) {
			console.error('Error initializing exam:', error);
			router.push('/exam/settings');
		}
	}, [router, updateState]);

	// Выбор ответа
	const handleAnswerSelect = useCallback((answerIndex: number) => {
		setState(prevState => {
			const originalIndex =
				prevState.questions[prevState.currentQuestion].answers[answerIndex]
					.originalIndex;

			const newSelectedAnswers = {
				...prevState.selectedAnswers,
				[prevState.currentQuestion]: answerIndex,
			};

			const newSelectedOriginalAnswers = {
				...prevState.selectedOriginalAnswers,
				[prevState.currentQuestion]: originalIndex,
			};

			// Обновляем прогресс
			const answeredCount = Object.keys(newSelectedAnswers).length;
			const progressValue = (answeredCount / prevState.questions.length) * 100;
			const newProgress = isNaN(progressValue) ? 0 : progressValue;

			return {
				...prevState,
				selectedAnswers: newSelectedAnswers,
				selectedOriginalAnswers: newSelectedOriginalAnswers,
				progress: newProgress,
			};
		});
	}, []);

	// Расчет прогресса
	const calculateProgressValue = useCallback(() => {
		return setState(prevState => {
			if (prevState.questions.length === 0) {
				return { ...prevState, progress: 0 };
			}

			const answeredCount = Object.keys(prevState.selectedAnswers).length;
			const progressValue = (answeredCount / prevState.questions.length) * 100;
			return {
				...prevState,
				progress: isNaN(progressValue) ? 0 : progressValue,
			};
		});
	}, []);

	// Навигация по вопросам
	const handleNextQuestion = useCallback(() => {
		setState(prevState => {
			if (prevState.currentQuestion < prevState.questions.length - 1) {
				return { ...prevState, currentQuestion: prevState.currentQuestion + 1 };
			}
			return prevState;
		});
	}, []);

	const handlePrevQuestion = useCallback(() => {
		setState(prevState => {
			if (prevState.currentQuestion > 0) {
				return { ...prevState, currentQuestion: prevState.currentQuestion - 1 };
			}
			return prevState;
		});
	}, []);

	const handleJumpToQuestion = useCallback(
		(index: number) => {
			updateState({ currentQuestion: index });
		},
		[updateState]
	);

	// Навигация по вопросам в режиме просмотра
	const handleNextReviewQuestion = useCallback(() => {
		setState(prevState => {
			if (prevState.reviewQuestion < prevState.questions.length - 1) {
				return { ...prevState, reviewQuestion: prevState.reviewQuestion + 1 };
			}
			return prevState;
		});
	}, []);

	const handlePrevReviewQuestion = useCallback(() => {
		setState(prevState => {
			if (prevState.reviewQuestion > 0) {
				return { ...prevState, reviewQuestion: prevState.reviewQuestion - 1 };
			}
			return prevState;
		});
	}, []);

	const handleJumpToReviewQuestion = useCallback(
		(index: number) => {
			updateState({ reviewQuestion: index });
		},
		[updateState]
	);

	// Раннее завершение экзамена
	const handleEarlyTermination = useCallback(async (reason: string) => {
		setState(prevState => {
			if (!prevState.isFinished) {
				return { ...prevState, terminationReason: reason };
			}
			return prevState;
		});

		await handleFinishExam();
	}, []);

	// Расчет результатов
	const calculateScore = useCallback(() => {
		setState(prevState => {
			let score = 0;
			Object.entries(prevState.selectedOriginalAnswers).forEach(
				([questionIdx, originalAnswerIdx]) => {
					const question = prevState.questions[Number.parseInt(questionIdx)];
					const originalAnswers = question.answers.filter(
						a => a.originalIndex === originalAnswerIdx
					);
					if (originalAnswers.length > 0 && originalAnswers[0].isCorrect) {
						score++;
					}
				}
			);

			const percentage =
				prevState.questions.length > 0
					? (score / prevState.questions.length) * 100
					: 0;

			// Расчет баллов из 100
			const pointsOutOf100 = Math.round(percentage);

			// Расчет оценки по 5-балльной шкале
			let grade = 2; // Оценка по умолчанию
			if (percentage >= 90) grade = 5;
			else if (percentage >= 75) grade = 4;
			else if (percentage >= 60) grade = 3;

			return {
				...prevState,
				finalScore: percentage,
				pointsScore: pointsOutOf100,
				gradeScore: grade,
			};
		});
	}, []);

	// Завершение экзамена
	const handleFinishExam = useCallback(async () => {
		setState(prevState => {
			if (prevState.isFinished) return prevState;

			const now = new Date();
			let timeElapsed = 0;

			if (prevState.startTime) {
				timeElapsed = Math.floor(
					(now.getTime() - prevState.startTime.getTime()) / 1000
				);
			}

			return {
				...prevState,
				isFinished: true,
				endTime: now,
				timeSpent: timeElapsed,
			};
		});

		// Расчет результатов
		calculateScore();

		updateState({ showResults: true });

		// Очищаем сохраненный прогресс
		await clearExamProgress();

		// Сохраняем результаты экзамена
		setState(prevState => {
			if (prevState.settings) {
				const now = new Date();
				const correctAnswers = Math.round(
					(prevState.finalScore / 100) * prevState.questions.length
				);

				saveExamResult({
					studentName: prevState.settings.studentName,
					date: prevState.examDate || now.toISOString(),
					score: prevState.finalScore,
					pointsScore: prevState.pointsScore,
					gradeScore: prevState.gradeScore,
					timeSpent: prevState.timeSpent,
					questionsCount: prevState.questions.length,
					correctAnswers,
					terminationReason: prevState.terminationReason,
				}).catch(error => {
					console.error('Error saving exam results:', error);
				});
			}

			return prevState;
		});
	}, [calculateScore, updateState]);

	// Обработка истечения времени
	const handleTimeUp = useCallback(() => {
		setState(prevState => {
			if (!prevState.isFinished) {
				handleFinishExam();
			}
			return prevState;
		});
	}, [handleFinishExam]);

	// Переход на главную
	const handleReturnHome = useCallback(() => {
		router.push('/');
	}, [router]);

	// Переключение между результатами и просмотром
	const handleShowReview = useCallback(() => {
		updateState({
			showResults: false,
			showReview: true,
			reviewQuestion: 0,
		});
	}, [updateState]);

	const handleBackToResults = useCallback(() => {
		updateState({
			showReview: false,
			showResults: true,
		});
	}, [updateState]);

	// Проверка правильности ответа
	const isAnswerCorrect = useCallback(
		(questionIndex: number): boolean => {
			if (state.selectedOriginalAnswers[questionIndex] === undefined) {
				return false;
			}

			const originalAnswerIdx = state.selectedOriginalAnswers[questionIndex];
			const question = state.questions[questionIndex];
			const originalAnswers = question.answers.filter(
				a => a.originalIndex === originalAnswerIdx
			);

			return originalAnswers.length > 0 && originalAnswers[0].isCorrect;
		},
		[state.questions, state.selectedOriginalAnswers]
	);

	// Получение статуса ответа пользователя
	const getUserAnswerStatus = useCallback(
		(questionIndex: number): string => {
			if (state.selectedAnswers[questionIndex] === undefined) {
				return 'Не отвечено';
			}

			return isAnswerCorrect(questionIndex) ? 'Правильно' : 'Неправильно';
		},
		[state.selectedAnswers, isAnswerCorrect]
	);

	// Сохранение прогресса при уходе со страницы
	useEffect(() => {
		const saveProgress = async () => {
			if (state.questions.length === 0 || state.isFinished) return;

			const progress: ExamProgress = {
				currentQuestion: state.currentQuestion,
				selectedAnswers: state.selectedAnswers,
				selectedOriginalAnswers: state.selectedOriginalAnswers,
				startTime: state.startTime
					? state.startTime.toISOString()
					: new Date().toISOString(),
				progress: state.progress,
				questions: state.questions,
			};

			await saveExamProgress(progress);
		};

		// Сохраняем прогресс при уходе со страницы
		const handleBeforeUnload = () => {
			saveProgress();
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		// Сохраняем прогресс каждые 10 секунд
		const intervalId = setInterval(() => {
			saveProgress();
		}, 10000);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			clearInterval(intervalId);
			saveProgress();
		};
	}, [
		state.questions,
		state.currentQuestion,
		state.selectedAnswers,
		state.selectedOriginalAnswers,
		state.startTime,
		state.isFinished,
		state.progress,
	]);

	// Добавляем слушатели для изменений видимости приложения
	useEffect(() => {
		if (state.isFinished || state.isLoading || !state.settings) return;

		const handleVisibilityChange = () => {
			if (document.hidden) {
				handleEarlyTermination('Приложение было свернуто или переключено');
			}
		};

		const setupTauriListeners = async () => {
			try {
				// Используем правильный Tauri API для событий окна
				const { getCurrentWindow } = await import('@tauri-apps/api/window');
				const window = getCurrentWindow();

				// Слушаем события окна с использованием доступного API
				const unlisten = await window.listen('tauri://close-requested', () => {
					handleEarlyTermination(
						'Попытка закрыть приложение во время экзамена'
					);
				});

				return () => {
					unlisten();
				};
			} catch (error) {
				console.error('Error setting up Tauri listeners:', error);
			}
		};

		// Настраиваем API видимости браузера
		document.addEventListener('visibilitychange', handleVisibilityChange);

		// Настраиваем специфичные для Tauri слушат��ли
		const cleanupPromise = setupTauriListeners();

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			// Очищаем слушатели Tauri, если они были установлены
			cleanupPromise?.then(cleanup => {
				if (cleanup) cleanup();
			});
		};
	}, [
		state.isFinished,
		state.isLoading,
		state.settings,
		handleEarlyTermination,
	]);

	// Инициализация экзамена при монтировании компонента
	useEffect(() => {
		initExam();
	}, [initExam]);

	return {
		...state,
		handleAnswerSelect,
		handleNextQuestion,
		handlePrevQuestion,
		handleJumpToQuestion,
		handleNextReviewQuestion,
		handlePrevReviewQuestion,
		handleJumpToReviewQuestion,
		handleFinishExam,
		handleTimeUp,
		handleReturnHome,
		handleShowReview,
		handleBackToResults,
		isAnswerCorrect,
		getUserAnswerStatus,
		calculateProgressValue,
	};
}
