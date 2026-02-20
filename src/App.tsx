/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import "./App.css";
import "@mantine/core/styles.css";
import { Button, Loader, Select, Stack, Table, Title } from "@mantine/core";
import { numberWithCommas, deleteWithinParens, titlecase } from "./util";

type ElectionDataRow = {
  cid: number;
  cnm: string;
  vfr: number;
  gid: number;
  lid: number;
  bnm: string;
  dtx: unknown;
  pty: unknown;
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

function parseData(data: { [key: string]: string }[]): ElectionDataRow[] {
  return data.map((row) => ({
    cid: parseInt(row["cid"]),
    cnm: deleteWithinParens(titlecase(row["cnm"])),
    vfr: parseInt(row["vfr"]),
    gid: parseInt(row["gid"]),
    lid: parseInt(row["lid"]),
    bnm: row["bnm"],
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

const ElectionTable = ({ data }: { data: ElectionDataRow[] }) => {
  const rows = data.map((r) => {
    return (
      <Table.Tr key={r["cnm"] + r["vct"]}>
        <Table.Td>{r.cnm}</Table.Td>
        <Table.Td>{r["bnm"]}</Table.Td>
        <Table.Td>{numberWithCommas(r["vct"])}</Table.Td>
        <Table.Td>{`${(r["pct"] * 100).toFixed(1)}%`}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table ta="left" tabularNums>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Election</Table.Th>
          <Table.Th>Candidate</Table.Th>
          <Table.Th>Vote Count</Table.Th>
          <Table.Th>Percentage</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState<boolean | ElectionDataRow[]>(true);

  async function recurse(
    index: number,
    accumulator: { [keys: string]: string }[],
  ) {
    const url = `https://er.ncsbe.gov/enr/20251104/data/results_${index}.txt`;
    const data = await fetch(url).then((res) => {
      if (!res.ok) return false;
      return res.json();
    });

    if (data == false) return accumulator;
    return recurse(index + 1, accumulator.concat(data));
  }

  useEffect(() => {
    recurse(0, []).then((data) => setIsLoading(parseData(data)));
  }, []);

  const [candidateSearch, setCandidateSearch] = useState<string | null>(null);
  const [electionSearch, setElectionSearch] = useState<string | null>(null);
  const [results, setResults] = useState<ElectionDataRow[]>();

  return (
    <Stack mt="xl">
      <form>
        <Stack maw={400} mx="auto">
          <Title order={1} size="h5">
            Enter one or both
          </Title>
          <Select
            label="Candidate Name"
            onChange={(c) => setCandidateSearch(c)}
            data={
              typeof isLoading == "boolean"
                ? []
                : Array.from(
                    new Set(
                      isLoading.map((it) => {
                        return it.bnm
                          .replaceAll("(Miscellaneous)", "")
                          .replaceAll("(Write-In)", "")
                          .trim();
                      }),
                    ),
                  )
            }
            placeholder="Pick an Election"
            rightSection={isLoading == true ? <Loader /> : null}
            searchable
            clearable
          />
          <Select
            label="Election Name"
            onChange={(e) => setElectionSearch(e)}
            data={
              typeof isLoading == "boolean"
                ? []
                : Array.from(new Set(isLoading.map((it) => it.cnm)))
            }
            placeholder="Pick an Election"
            rightSection={isLoading == true ? <Loader /> : null}
            searchable
            clearable
          />
          <Button
            loading={isLoading == true}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              let res = isLoading;
              if (typeof res == "boolean") return;
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
        </Stack>
      </form>
      {results && (
        <>
          <Title order={2} size="h5">
            Results:
          </Title>
          <Stack mx="auto">
            <ElectionTable data={results} />
          </Stack>
        </>
      )}
    </Stack>
  );
}

export default App;

/*

"cid": "0",
		"cnm": "CITY OF DURHAM MAYOR (VOTE FOR 1)",
		"vfr": "1",
		"gid": "320005",
		"lid": "320005",
		"bnm": "Anjanee Bell",
		"dtx": "",
		"pty": " ",
		"vct": "19290",
		"pct": "0.4205",
		"prt": "61",
		"ptl": "61",
		"evc": "13180",
		"ovc": "5687",
		"avc": "142",
		"pvc": "281",
		"col": "FA6900",
		"ogl": "CCL",
		"ref": "0"

*/
