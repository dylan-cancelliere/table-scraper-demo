import { Table, type TableProps } from "@mantine/core";
import { numberWithCommas } from "./util";

export type ElectionDataRow = {
  cid: number;
  cnm: string; // Race
  vfr: number;
  gid: number;
  lid: number;
  bnm: string; // Candidate
  dtx: unknown;
  pty: string; // Party
  vct: number; // Vote count
  pct: number; // Vote percentage
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

export const ElectionTable = ({
  data,
  tableProps,
}: {
  data: ElectionDataRow[];
  tableProps?: TableProps;
}) => {
  const rows = data.map((r) => {
    return (
      <Table.Tr key={r["cnm"] + r["bnm"]}>
        <Table.Td>{r.cnm}</Table.Td>
        <Table.Td>{r["bnm"]}</Table.Td>
        <Table.Td>
          {r["pty"]
            .replace("DEM", "🔵 Democrat")
            .replace("REP", "🔴 Republican")}
        </Table.Td>
        <Table.Td>{numberWithCommas(r["vct"])}</Table.Td>
        <Table.Td>{`${(r["pct"] * 100).toFixed(1)}%`}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table ta="left" tabularNums striped {...tableProps}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Election</Table.Th>
          <Table.Th>Candidate</Table.Th>
          <Table.Th>Party</Table.Th>
          <Table.Th>Vote Count</Table.Th>
          <Table.Th>Percentage</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
