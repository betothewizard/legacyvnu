import { createFileRoute, Link } from "@tanstack/react-router";
import { styles } from "../../styles";
import { Button } from "~/src/components/ui/button";

export const Route = createFileRoute("/_layout/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className={`${styles.flexStart} ${styles.paddingY}`}>
      <div className={`${styles.boxWidth}`}>
        <div className={`${styles.flexStart} flex-1 flex-col px-6 sm:px-16`}>
          <h1 className="sm:mt-0 sm:max-w-full font-serif text-3xl md:text-3xl lg:text-4xl">
            Nơi sinh viên VNU cùng chia sẻ tài liệu, đề thi và kinh nghiệm học
            tập.
          </h1>
          <div className="mt-10 flex flex-row items-center gap-5">
            <Button asChild>
              <Link to="/tai-lieu">Tìm tài liệu</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/trac-nghiem">Ôn tập trắc nghiệm</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
