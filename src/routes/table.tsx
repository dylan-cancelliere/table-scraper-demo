import { createFileRoute } from "@tanstack/react-router";
import { ElectionTable, type ElectionDataRow } from "../ElectionTable";
import { useSuspenseQuery } from "@tanstack/react-query";
import { filterElectionData, parseElectionData } from "../util";
import { Stack } from "@mantine/core";

const TableContainer = () => {
  const { countyIndex, electionSearch, candidateSearch } = Route.useSearch();

  const electionQuery = useSuspenseQuery<ElectionDataRow[]>({
    queryKey: ["election", countyIndex],
    queryFn: () =>
      fetch(
        `https://er.ncsbe.gov/enr/20260303/data/results_${countyIndex}.txt?v=22-14-57`,
      )
        .then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
        })
        .then(parseElectionData),
  });

  return (
    <Stack w="100vw" mx="auto">
      <ElectionTable
        data={filterElectionData({
          electionData: electionQuery.data,
          electionSearch: electionSearch ?? "",
          candidateSearch: candidateSearch ?? "",
        })}
      />
    </Stack>
  );
};

export const Route = createFileRoute("/table")({
  component: TableContainer,
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    countyIndex?: number;
    electionSearch?: string;
    candidateSearch?: string;
  } => {
    // validate and parse the search params into a typed state
    return {
      countyIndex: Number(search.countyIndex ?? 0),
      electionSearch: (search.electionSearch as string) || "",
      candidateSearch: (search.candidateSearch as string) || "",
    };
  },
});
