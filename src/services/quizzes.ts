import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";

const WORKER_URL = process.env.VITE_WORKER_URL;

export const getQuestions = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .inputValidator((data: { subjectCode: string; page: number }) => data)
  .handler(async ({ data }) => {
    const { subjectCode, page } = data;
    const response = await fetch(
      `${WORKER_URL}/api/subject/${subjectCode}/quizzes?page=${page}`,
    );
    return response.json();
  });

export const getQuizzesMetadata = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const response = await fetch(`${WORKER_URL}/api/quizzes/metadata`);
    return response.json();
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
    const response = await fetch(
      `${WORKER_URL}/api/subject/${subjectCode}/submit`,
      {
        method: "POST",
        body: JSON.stringify(submission),
      },
    );
    return response.json();
  });
