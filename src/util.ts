import type { ElectionDataRow } from "./ElectionTable";

export function titlecase(s: string) {
  return s
    .split(/\s/)
    .map(
      (each) =>
        each.at(0)?.toLocaleUpperCase() + each.slice(1).toLocaleLowerCase(),
    )
    .join(" ");
}

export function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function deleteWithinParens(str: string) {
  return str.replace(/ *\([^)]*\) */g, "");
}

export function formatRaceNames(race: string) {
  return race
    .replaceAll("Us Senate", "US Senate")
    .replaceAll("Us House", "US House")
    .replaceAll("Nc Court", "NC Court")
    .replaceAll("Nc State", "NC State")
    .replaceAll("Nc House", "NC House")
    .replaceAll("Nc District", "NC District")
    .replaceAll(" Of ", " of ")
    .replaceAll(" - Rep", " - Republican Primary")
    .replaceAll(" - Dem", " - Democrat Primary");
}

export function parseElectionData(
  data: { [key: string]: string }[],
): ElectionDataRow[] {
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

export function filterElectionData(props: {
  electionData: ElectionDataRow[];
  candidateSearch: string;
  electionSearch: string;
}) {
  let res = props.electionData;
  if (props.candidateSearch.trim())
    res = res.filter((it) =>
      it["bnm"]
        .toLowerCase()
        .includes(props.candidateSearch.trim().toLowerCase()),
    );
  if (props.electionSearch.trim())
    res = res.filter((it) =>
      it["cnm"]
        .toLowerCase()
        .includes(props.electionSearch.trim().toLowerCase()),
    );
  return res;
}
