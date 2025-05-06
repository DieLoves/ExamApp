export interface IExamFile {
	modules: IExamModule[];
	questions: IExamFileQuestions[];
}

export interface IExamModule {
	id: number;
	title: string;
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
