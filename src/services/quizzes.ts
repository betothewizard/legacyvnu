import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { IQuizMetadata } from "~/src/types/quizzes";
import { apiFetch } from "~/src/lib/api";

export interface IBackendQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  type?: number;
}

export interface IQuestionsResponse {
  questions: IBackendQuestion[];
  meta: {
    page: number;
    totalPages: number;
  };
}

export const getQuestions = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .inputValidator((data: { subjectCode: string; page: number }) => data)
  .handler(async ({ data }) => {
    const { subjectCode, page } = data;
    const response = await apiFetch(
      `/api/subject/${subjectCode}/quizzes?page=${page}`,
    );
    return response.json() as Promise<IQuestionsResponse>;
  });

export const getQuizzesMetadata = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const response = await apiFetch(`/api/quizzes/metadata`);
    return response.json() as Promise<IQuizMetadata[]>;
  });

export const submitQuiz = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      submission: { id: number; selectedAnswerIndex: number }[];
      subjectCode: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { submission, subjectCode } = data;
    const response = await apiFetch(
      `/api/subject/${subjectCode}/submit`,
      {
        method: "POST",
        body: JSON.stringify(submission),
      },
    );
    return response.json() as Promise<{ message: string }>;
  });
