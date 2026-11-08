import {ordered} from './core.js';

// This is a weekday-aligned photo calendar; the title's compact dot map stays separate.
export function photoCalendarMonth(records,month,{compact=false}={}){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw new RangeError('Invalid calendar month');
  const first=new Date(`${month}-01T12:00:00Z`);
  const end=new Date(first);end.setUTCMonth(end.getUTCMonth()+1,0);
  const offset=(first.getUTCDay()+6)%7;
  const days=Array.from({length:end.getUTCDate()},(_,i)=>({day:i+1,date:`${month}-${String(i+1).padStart(2,'0')}`,records:[]}));
  for(const record of ordered(records)){
    if(record.date.slice(0,7)!==month)continue;
    const day=days[Number(record.date.slice(8,10))-1];
    if(day&&record.date.slice(0,10)===day.date)day.records.push(record);
  }
  const cells=[...Array(offset).fill(null),...days];
  while(cells.length%7)cells.push(null);
  const visibleCells=compact?Array.from({length:cells.length/7},(_,week)=>cells.slice(week*7,week*7+7)).filter(week=>week.some(day=>day?.records.length)).flat():cells;
  return {month,offset,cells:visibleCells};
}
