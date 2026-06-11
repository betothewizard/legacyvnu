import { createFileRoute } from "@tanstack/react-router";
import { getQuestions } from "~/src/services/quizzes";
import { QuizPage } from "./$subjectCode.$page";

function SubjectQuizIndexRouteComponent() {
  const { subjectCode, currentPage, questionData } = Route.useLoaderData();
  return (
    <QuizPage
      key={`${subjectCode}-${currentPage}`}
      subjectCode={subjectCode}
      currentPage={currentPage}
      questionData={questionData}
    />
  );
}

export const Route = createFileRoute("/_layout/trac-nghiem/$subjectCode/")({
  staleTime: Infinity,
  gcTime: Infinity,
  loader: async ({ params }) => {
    const { subjectCode } = params;
    const currentPage = 0;
    const questionData = await getQuestions({
      data: { subjectCode, page: currentPage },
    });
    return { currentPage, subjectCode, questionData };
  },
  component: SubjectQuizIndexRouteComponent,
});
