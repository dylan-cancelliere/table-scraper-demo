import { createFileRoute } from "@tanstack/react-router";
import { ElectionTable, type ElectionDataRow } from "../ElectionTable";
import { useSuspenseQuery } from "@tanstack/react-query";
import { filterElectionData, insertBetween, parseElectionData } from "../util";
import { Divider, Stack } from "@mantine/core";

export const GroupedTables = (props: { data: ElectionDataRow[] }) => {
  const filteredData = Object.groupBy(props.data, ({ cnm }) => cnm);

  const tables = Object.entries(filteredData).map(([key, value]) => (
    <ElectionTable data={value ?? []} title={key} />
  ));

  return (
    <Stack w="100vw">
      <Stack m="lg">{insertBetween(<Divider my="xs" mx="xs" />, tables)}</Stack>
    </Stack>
  );
};

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
    <GroupedTables
      data={filterElectionData({
        electionData: electionQuery.data,
        electionSearch: electionSearch ?? "",
        candidateSearch: candidateSearch ?? "",
      })}
    />
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
