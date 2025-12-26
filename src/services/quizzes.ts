import { getEnv } from "./../lib/utils";
import type { IQuizMetadata } from "~/src/types/quizzes";

export const getQuestions = async (subjectCode: string, page: number) => {
  const response = await fetch(
    `${import.meta.env.VITE_WORKER_URL}/api/subject/${subjectCode}/quizzes?page=${page}`,
    {
      method: "GET",
    }
  );
  const data = await response.json();
  return data;
};

export const getQuizzesMetadata = async (): Promise<IQuizMetadata[]> => {
  const response = await fetch(
    `${getEnv("VITE_WORKER_URL")}/api/quizzes/metadata`,
    {
      method: "GET",
    }
  );
  const data = await response.json();
  return data;
};

export const submitQuiz = async (
  submission: {
    id: number;
    selectedAnswerIndex: number;
  }[],
  subjectCode: string
) => {
  const response = await fetch(
    `${import.meta.env.VITE_WORKER_URL}/api/subject/${subjectCode}/submit`,
    {
      method: "POST",
      body: JSON.stringify(submission),
    }
  );

  return response.json();
};
