import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { apiFetch } from "~/src/lib/api";
import type {
  MessageResponse,
  QuestionsResponse,
  QuizMetadata,
  QuizSubmissionInput,
} from "@legacyvnu/shared";

export type {
  BackendQuestion as IBackendQuestion,
  QuestionsResponse as IQuestionsResponse,
  QuizMetadata as IQuizMetadata,
} from "@legacyvnu/shared";

export const getQuestions = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .inputValidator((data: { subjectCode: string; page: number }) => data)
  .handler(async ({ data }) => {
    const { subjectCode, page } = data;
    const response = await apiFetch(
      `/api/subject/${subjectCode}/quizzes?page=${page}`,
    );
    return response.json() as Promise<QuestionsResponse>;
  });

export const getQuizzesMetadata = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const response = await apiFetch(`/api/quizzes/metadata`);
    return response.json() as Promise<QuizMetadata[]>;
  });

export const submitQuiz = createServerFn({ method: "POST" })
  .inputValidator(
    (data: QuizSubmissionInput) => data,
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
    return response.json() as Promise<MessageResponse>;
  });
