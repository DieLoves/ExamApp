export interface IExamFile {
	modules: IExamFileModules[];
	questions: IExamFileQuestions[];
}

export interface IExamFileModules {
	id: number;
	name: string;
}

export interface IExamFileQuestions {
	id: number;
	moduleId: number;
	title: string;
	difficulty: number;
	answers: QuestionAnswer[];
}

export interface QuestionAnswer {
	text: string;
	isCorrect: boolean;
}
