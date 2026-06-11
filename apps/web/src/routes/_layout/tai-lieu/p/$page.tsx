import { createFileRoute } from "@tanstack/react-router";
import { getDocuments, getDocumentTags } from "~/src/services/documents";
import { DocumentsPage } from "~/src/components/documents-page";

export const Route = createFileRoute("/_layout/tai-lieu/p/$page")({
  staleTime: Infinity,
  gcTime: Infinity,
  loader: async ({ params }) => {
    const page = Math.max(0, Number(params.page) || 0);
    const [docsRes, tags] = await Promise.all([
      getDocuments({ data: { page } }),
      getDocumentTags(),
    ]);
    return { docsRes, tags, page };
  },
  component: DocumentsPageRoute,
});

function DocumentsPageRoute() {
  const { docsRes, tags, page } = Route.useLoaderData();
  return <DocumentsPage docsRes={docsRes} tags={tags} initialPage={page} />;
}
