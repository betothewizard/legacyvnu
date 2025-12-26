import { createFileRoute } from "@tanstack/react-router";
import { styles } from "~/src/styles";

export const Route = createFileRoute("/_layout/tai-lieu/$documentId")({
  component: DocumentPage,
});

function DocumentPage() {
  return (
    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>Document</div>
    </div>
  );
}
