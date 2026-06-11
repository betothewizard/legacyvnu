import { createFileRoute } from "@tanstack/react-router";
import { getDocuments, getDocumentTags } from "~/src/services/documents";
import { DocumentsPage } from "~/src/components/documents-page";

export const Route = createFileRoute("/_layout/tai-lieu/")({
  staleTime: Infinity,
  gcTime: Infinity,
  loader: async () => {
    const [docsRes, tags] = await Promise.all([
      getDocuments({ data: { page: 0 } }),
      getDocumentTags(),
    ]);
    return { docsRes, tags };
  },
  component: DocumentsPageRoute,
});

function DocumentsPageRoute() {
  const { docsRes, tags } = Route.useLoaderData();
  return <DocumentsPage docsRes={docsRes} tags={tags} initialPage={0} />;
}
