export function recordYears(records){
  return [...new Set(records.map(row=>Number(row.date.slice(0,4))))].filter(Number.isInteger).sort((a,b)=>b-a);
}
export function recordCalendar(records,year){
  const months=Array.from({length:12},(_,month)=>({month:month+1,days:Array.from({length:new Date(Date.UTC(year,month+1,0)).getUTCDate()},(_,i)=>({day:i+1,count:0}))}));
  for(const row of records){
    const [recordYear,month,day]=row.date.slice(0,10).split('-').map(Number);
    if(recordYear===Number(year)&&months[month-1]?.days[day-1])months[month-1].days[day-1].count++;
  }
  return months;
}
export function calendarMarkup(months,{mini=false,year}={}){
  return `<span class="record-year-grid ${mini?'mini-year-grid':''}" aria-hidden="true">${months.map(month=>`<span class="record-month ${month.days.some(d=>d.count)?'has-records':''}"><span class="record-month-name">${month.month}月</span><span class="record-day-grid">${month.days.map(day=>`<span class="record-day ${day.count?'has-record':''} ${day.count>1?'multiple-records':''}" data-date="${year}-${String(month.month).padStart(2,'0')}-${String(day.day).padStart(2,'0')}" data-count="${day.count}"><i></i></span>`).join('')}</span></span>`).join('')}</span>`;
}
