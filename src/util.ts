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
