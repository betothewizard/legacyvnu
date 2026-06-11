export const QUIZ_PAGE_SIZE = 10;

export type QuizMetadata = {
  code: string;
  name: string;
  total: number;
};

export type BackendQuestion = {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  type?: number;
};

export type QuestionsResponse = {
  questions: BackendQuestion[];
  meta: {
    page: number;
    totalPages: number;
  };
};

export type QuizSubmissionAnswer = {
  id: number;
  selectedAnswerIndex: number;
};

export type QuizSubmissionInput = {
  submission: QuizSubmissionAnswer[];
  subjectCode: string;
};

export type QuizAnswer = {
  id: number;
  content: string;
};

export type QuizQuestion = {
  id: number;
  question: string;
  answers: QuizAnswer[];
  correctAnswer: string;
  selectedAnswerIndex: number | undefined;
};

export type IQuizMetadata = QuizMetadata;
export type IBackendQuestion = BackendQuestion;
export type IQuestionsResponse = QuestionsResponse;
export type IQuestion = QuizQuestion;
