import { useState } from "react";
import "./App.css";

import {
  ActionIcon,
  Button,
  Code,
  CopyButton,
  Group,
  Loader,
  LoadingOverlay,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { filterElectionData, parseElectionData, titlecase } from "./util";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { type ElectionDataRow } from "./ElectionTable";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { GroupedTables } from "./routes/table";

type County = {
  bct: number;
  bpt: string;
  cid: number;
  cnm: string;
  imp: string;
  ppt: string;
  prt: number;
  ptl: number;
  rtl: number;
  sub: string;
  tle: string;
  vwp: string;
};

function App() {
  const [countyIndex, setCountyIndex] = useState<number>();

  const countyQuery = useSuspenseQuery<County[]>({
    queryKey: ["counties"],
    queryFn: () =>
      fetch("https://er.ncsbe.gov/enr/20260303/data/county.txt").then((res) =>
        res.json(),
      ),
  });

  const electionQueryDisabled = countyIndex == undefined;
  const electionQuery = useQuery<ElectionDataRow[]>({
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
    enabled: !electionQueryDisabled,
  });

  const [candidateSearch, setCandidateSearch] = useState<string | null>(null);
  const [electionSearch, setElectionSearch] = useState<string | null>(null);
  const [results, setResults] = useState<ElectionDataRow[]>();
  const [liveLink, setLiveLink] = useState<string>();

  return (
    <Stack mt="xl">
      <form>
        <Stack maw={400} mx="auto">
          <Title order={1}>Election Table Generator</Title>
          <Select
            label="Pick county/state"
            data={countyQuery.data.map((c, idx) => ({
              label: titlecase(c.cnm),
              value: idx.toString(),
            }))}
            searchable
            placeholder="Select a county or state-wide"
            clearable
            onChange={(idx) =>
              setCountyIndex(idx != null ? parseInt(idx) : undefined)
            }
          />
          <Title order={2} size="h5">
            Enter one or both
          </Title>
          <Select
            label="Candidate Name"
            onChange={(c) => setCandidateSearch(c)}
            data={
              electionQuery.data == undefined
                ? []
                : Array.from(
                    new Set(
                      electionQuery.data.map((it) => {
                        return it.bnm;
                      }),
                    ),
                  )
            }
            placeholder="Pick a candidate"
            rightSection={electionQuery.isLoading ? <Loader size={16} /> : null}
            disabled={electionQueryDisabled}
            searchable
            clearable
          />
          <Select
            label="Election Name"
            onChange={(e) => setElectionSearch(e)}
            data={
              electionQuery.data == undefined
                ? []
                : Array.from(new Set(electionQuery.data.map((it) => it.cnm)))
            }
            placeholder="Pick an election"
            rightSection={
              electionQuery.isLoading == true ? <Loader size={16} /> : null
            }
            disabled={electionQueryDisabled}
            searchable
            clearable
          />
          <Button
            loading={electionQuery.isLoading}
            type="submit"
            disabled={electionQueryDisabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              setLiveLink(undefined);

              setResults(
                filterElectionData({
                  electionData: electionQuery.data ?? [],
                  electionSearch: electionSearch ?? "",
                  candidateSearch: candidateSearch ?? "",
                }),
              );
            }}
          >
            Search
          </Button>
          {results?.length && (
            <Button
              color="green"
              onClick={() =>
                setLiveLink(
                  encodeURI(
                    `http://localhost:5173/table?countyIndex=${countyIndex}&electionSearch=${electionSearch}&candidateSearch=${candidateSearch}`,
                  ),
                )
              }
            >
              Generate Table View (Live Data)
            </Button>
          )}
          {liveLink && (
            <CopyButton value={liveLink}>
              {({ copied, copy }) => (
                <>
                  <Code>
                    <Group wrap="nowrap">
                      <Text lineClamp={1}>{liveLink}</Text>
                      <ActionIcon variant="transparent" onClick={copy}>
                        {copied ? <IconCheck /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Group>
                  </Code>
                </>
              )}
            </CopyButton>
          )}
        </Stack>
      </form>
      {results && (
        <>
          <Title order={2} size="h5">
            Results:
          </Title>
          <Stack mx="auto">
            <LoadingOverlay visible={electionQuery.isLoading} />
            <GroupedTables data={results} />
          </Stack>
        </>
      )}
    </Stack>
  );
}

export default App;
