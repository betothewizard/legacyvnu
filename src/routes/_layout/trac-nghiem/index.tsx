import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/src/components/ui/card";
import { styles } from "~/src/styles";
import { getQuizzesMetadata } from "~/src/services/quizzes";
import { Button } from "~/src/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_layout/trac-nghiem/")({
  // Cache data forever - static content doesn't change
  staleTime: Infinity,
  gcTime: Infinity,
  loader: async () => {
    const quizzesMetadata = await getQuizzesMetadata();
    return quizzesMetadata;
  },
  component: Quizzes,
});

function Quizzes() {
  const loaderData = Route.useLoaderData();

  return (
    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>
        {loaderData.map((quizMetadata) => (
          <Card key={quizMetadata.code}>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>{quizMetadata.name}</CardTitle>
                <CardDescription>{quizMetadata.total} câu</CardDescription>
              </div>

              <Button asChild>
                <Link to={`/trac-nghiem/${quizMetadata.code}`}>
                  <ArrowRight />
                </Link>
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
