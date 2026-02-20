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
