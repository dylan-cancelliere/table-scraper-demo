import { useEffect, useState } from "react";
import "./App.css";
import "@mantine/core/styles.css";
import {
  Button,
  Loader,
  LoadingOverlay,
  Select,
  Stack,
  Title,
} from "@mantine/core";
import { deleteWithinParens, formatRaceNames, titlecase } from "./util";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ElectionTable } from "./ElectionTable";

type ElectionDataRow = {
  cid: number;
  cnm: string; // Race
  vfr: number;
  gid: number;
  lid: number;
  bnm: string; // Candidate
  dtx: unknown;
  pty: string;
  vct: number;
  pct: number;
  prt: number;
  ptl: number;
  evc: number;
  ovc: number;
  avc: number;
  pvc: number;
  col: string;
  ogl: string;
  ref: number;
};

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

function parseData(data: { [key: string]: string }[]): ElectionDataRow[] {
  return data.map((row) => ({
    cid: parseInt(row["cid"]),
    cnm: formatRaceNames(titlecase(deleteWithinParens(titlecase(row["cnm"])))),
    vfr: parseInt(row["vfr"]),
    gid: parseInt(row["gid"]),
    lid: parseInt(row["lid"]),
    bnm: row["bnm"]
      .replaceAll("(Miscellaneous)", "")
      .replaceAll("(Write-In)", "")
      .trim(),
    dtx: row["dtx"],
    pty: row["pty"],
    vct: parseInt(row["vct"]),
    pct: parseFloat(row["pct"]),
    prt: parseInt(row["prt"]),
    ptl: parseInt(row["ptl"]),
    evc: parseInt(row["evc"]),
    ovc: parseInt(row["ovc"]),
    avc: parseInt(row["avc"]),
    pvc: parseInt(row["pvc"]),
    col: row["col"],
    ogl: row["ogl"],
    ref: parseInt(row["ref"]),
  }));
}

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
        .then(parseData),
    enabled: !electionQueryDisabled,
  });

  const [candidateSearch, setCandidateSearch] = useState<string | null>(null);
  const [electionSearch, setElectionSearch] = useState<string | null>(null);
  const [results, setResults] = useState<ElectionDataRow[]>();

  useEffect(() => {
    console.log("RESULTS", results);
  }, [results]);

  return (
    <Stack mt="xl">
      <form>
        <Stack maw={400} mx="auto">
          <Title order={1}>Election Table Generator</Title>
          <Select
            label="Pick county/state"
            data={countyQuery.data.map((c, idx) => ({
              label: c.cnm,
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              let res = electionQuery.data;
              if (res == undefined) return;
              if (candidateSearch?.trim())
                res = res.filter((it) =>
                  it["bnm"]
                    .toLowerCase()
                    .includes(candidateSearch.trim().toLowerCase()),
                );
              if (electionSearch?.trim())
                res = res.filter((it) =>
                  it["cnm"]
                    .toLowerCase()
                    .includes(electionSearch.trim().toLowerCase()),
                );
              setResults(res);
            }}
          >
            Search
          </Button>
          <Button color="green">Generate </Button>
        </Stack>
      </form>
      {results && (
        <>
          <Title order={2} size="h5">
            Results:
          </Title>
          <Stack mx="auto">
            <LoadingOverlay visible={electionQuery.isLoading} />
            <ElectionTable data={results} />
          </Stack>
        </>
      )}
    </Stack>
  );
}

export default App;
