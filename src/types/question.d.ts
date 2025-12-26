export interface QuestionType {
  id: number;
  question: string;
  answers: { id: number; content: string }[];
  correctAnswer: string;
  selectedAnswerIndex: number | undefined;
}
