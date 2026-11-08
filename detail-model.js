import {ordered} from './core.js';
// Store record IDs rather than array indices so imports and date edits keep a custom pair intact.
export function resolvePair(records, choice) {
  const rows=ordered(records);
  if(rows.length<2)return rows;
  const chosen=choice?.map(id=>rows.find(r=>r.id===id));
  if(chosen?.length===2&&chosen.every(Boolean)&&chosen[0].id!==chosen[1].id)return ordered(chosen);
  return [rows[0],rows.at(-1)];
}
export function recordMonths(records,year) {
  return [...new Set(records.filter(r=>r.date.slice(0,4)===String(year)).map(r=>r.date.slice(0,7)))].sort();
}
