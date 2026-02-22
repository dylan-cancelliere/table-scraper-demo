import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/table")({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    countyIndex?: number;
    electionSearch?: string;
    candidateSearch?: string;
  } => {
    // validate and parse the search params into a typed state
    return {
      countyIndex: Number(search.countyIndex ?? 1),
      electionSearch: (search.electionSearch as string) || "",
      candidateSearch: (search.candidateSearch as string) || "",
    };
  },
});

function RouteComponent() {
  return <div>Hello "/table"!</div>;
}
