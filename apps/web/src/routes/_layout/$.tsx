import { createFileRoute, Link } from "@tanstack/react-router";
import { styles } from "../../styles";

export const Route = createFileRoute("/_layout/$")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className={`${styles.paddingX} ${styles.flexCenter} min-h-72`}>
      <div
        className={`${styles.boxWidth} flex flex-grow flex-col items-center justify-center gap-5`}
      >
        <h1 className="text-4xl font-bold">404 - Không tìm thấy trang</h1>
        <Link to="/" className="font-bold text-yellow-500 underline">
          Trở lại trang chủ
        </Link>
      </div>
    </div>
  );
}
