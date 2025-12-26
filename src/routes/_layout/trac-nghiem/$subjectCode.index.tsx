import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/src/components/ui/button";
import { CustomDialog } from "../../../components/custom-dialog";
import { Question } from "../../../components/question-ui";
import { getQuestions, submitQuiz } from "../../../services/quizzes";
import { styles } from "../../../styles";
import type { QuestionType } from "../../../types/question";
import { shuffle } from "../../../lib/random";

const QUESTIONS_PER_PAGE = 10;

export const Route = createFileRoute("/_layout/trac-nghiem/$subjectCode/")({
  // Cache data forever - static content doesn't change
  staleTime: Infinity,
  gcTime: Infinity,
  loader: async ({ params }) => {
    const { subjectCode } = params;
    const currentPage = 0;
    const questionData = await getQuestions(subjectCode, currentPage);
    return { currentPage, subjectCode, questionData };
  },
  component: QuizPage,
});

const getQuestionsAndAnswers = (
  data: any[],
  currentPage: number
): QuestionType[] => {
  return data.map((questionData, id: number) => ({
    id: currentPage * QUESTIONS_PER_PAGE + id,
    question: questionData.question,
    answers: shuffle([
      {
        id: 0,
        content: questionData.correct_answer,
      },
      ...questionData.incorrect_answers.map(
        (content: string, index: number) => ({
          id: index + 1,
          content: content,
        })
      ),
    ]),
    correctAnswer: questionData.correct_answer,
    selectedAnswerIndex: undefined,
  }));
};

function QuizPage() {
  const { currentPage, subjectCode, questionData } = Route.useLoaderData();
  const questions = questionData?.questions || [];
  const meta = questionData?.meta || { totalPages: 1 };

  const [questionsAndAnswers, setQuestionsAndAnswers] = useState<
    QuestionType[]
  >([]);
  const [showResult, setShowResult] = useState<boolean[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (questions.length > 0) {
      setQuestionsAndAnswers(getQuestionsAndAnswers(questions, currentPage));
    }
  }, [questions, currentPage]);

  const onAnswerSelected = (questionId: number, answerIndex: number) => {
    setQuestionsAndAnswers((prevQuestions) => {
      return prevQuestions.map((q) =>
        q.id === questionId ? { ...q, selectedAnswerIndex: answerIndex } : q
      );
    });
  };

  const onCheckAnswer = async () => {
    const notAllSelected = questionsAndAnswers.some(
      (element) => element.selectedAnswerIndex === undefined
    );
    setShowWarning(notAllSelected);
    if (!notAllSelected) {
      setShowResult((prevResult) => {
        const newResult = [...prevResult];
        newResult[currentPage] = true;
        return newResult;
      });

      const submission = questionsAndAnswers.map((question) => ({
        id: question.id,
        selectedAnswerIndex: question.answers[question.selectedAnswerIndex!].id,
      }));

      try {
        await submitQuiz(submission, subjectCode);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>
        {questionsAndAnswers.map((question, index) => (
          <Question
            key={index}
            questionType={question}
            onAnswerSelected={onAnswerSelected}
            showResult={showResult[currentPage]}
          />
        ))}
        {showWarning && (
          <CustomDialog
            showWarning={showWarning}
            setShowWarning={setShowWarning}
            currentQuestionsLength={questionsAndAnswers.length}
          />
        )}
        <div className="flex justify-center space-x-6 mb-8">
          <Link
            to="/trac-nghiem/$subjectCode/$page"
            params={{ subjectCode, page: String(currentPage - 1) }}
            className={`flex items-center justify-center rounded-full border-2 border-zinc-600 px-2 hover:bg-gray-200/50 ${currentPage === 0 ? "pointer-events-none opacity-0" : ""}`}
            aria-disabled={currentPage === 0}
            tabIndex={currentPage === 0 ? -1 : undefined}
          >
            <ArrowLeft />
          </Link>
          <Button onClick={onCheckAnswer}>Kiểm tra</Button>
          <Link
            to="/trac-nghiem/$subjectCode/$page"
            params={{ subjectCode, page: String(currentPage + 1) }}
            className={`flex items-center justify-center rounded-full border-2 border-zinc-600 px-2 hover:bg-gray-200/50 ${currentPage === meta.totalPages - 1 ? "pointer-events-none opacity-0" : ""}`}
            aria-disabled={currentPage === meta.totalPages - 1}
            tabIndex={currentPage === meta.totalPages - 1 ? -1 : undefined}
          >
            <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
