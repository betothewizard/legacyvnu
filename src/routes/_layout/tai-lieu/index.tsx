import { createFileRoute } from "@tanstack/react-router";
import { styles } from "~/src/styles";

export const Route = createFileRoute("/_layout/tai-lieu/")({
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>Documents</div>
    </div>
  );
}
