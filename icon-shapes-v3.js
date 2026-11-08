// Smooth, optically balanced 24px glyphs. Curved silhouettes, rounded joins,
// and restrained personality details; no improvised diagonals or jagged fills.
const p=(d,attrs='')=>`<path d="${d}" ${attrs}/>`;
const line=d=>p(d);
const fill=d=>p(d,'fill="currentColor" stroke="none"');
const hole=d=>p(d,'fill="currentColor" stroke="none" fill-rule="evenodd"');
const circle=(x,y,r,attrs='')=>`<circle cx="${x}" cy="${y}" r="${r}" ${attrs}/>`;
const dot=(x,y,r=.8)=>circle(x,y,r,'fill="currentColor" stroke="none"');
const box=(x,y,w,h,r=3)=>`M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`;
const roundCircle=(x,y,r)=>`M${x-r} ${y}a${r} ${r} 0 1 0 ${r*2} 0a${r} ${r} 0 1 0 ${-r*2} 0Z`;
const frame=box(3,3,18,18,3.5);
const camera='M6 7H7.8C8.5 7 8.8 6.5 9.1 5.7L9.5 4.8C9.8 4.3 10.2 4 10.9 4H13.1C13.8 4 14.2 4.3 14.5 4.8L14.9 5.7C15.2 6.5 15.5 7 16.2 7H18Q21.5 7 21.5 10.5V17Q21.5 20.5 18 20.5H6Q2.5 20.5 2.5 17V10.5Q2.5 7 6 7Z';
const lens=roundCircle(12,13.5,3.5);
const back=line('M5.5 18.5H5Q2.5 18.5 2.5 16V6Q2.5 3.5 5 3.5H15Q17.5 3.5 17.5 6V6.5');
const front=box(6.5,7,15,14,3);
const photoInside=line('M7 16l3-3 3.2 3.2 2-2L18 17');
const bell='M6.5 10C6.5 6.7 8.5 4.5 12 4.5S17.5 6.7 17.5 10V12.5C17.5 14.2 18.2 15.6 19.2 16.7Q20 18 18.5 18H5.5Q4 18 4.8 16.7C5.8 15.6 6.5 14.2 6.5 12.5Z';
const bellFoot=line('M10 21q2 1.2 4 0M12 2.5v2');
const play='M8 4.8Q7 4.2 7 5.4V18.6Q7 19.8 8 19.2L19 12.8Q20.2 12 19 11.2Z';
const flash='M13.2 3.2 5.3 12.5Q4.5 13.5 5.8 13.5H11L10.3 20.2Q10.2 21.3 11 20.4L18.9 11.2Q19.7 10.2 18.4 10.2H13.2L14 3.4Q14.1 2.2 13.2 3.2Z';
const compareA=box(2.5,4.5,8,15,2.5),compareB=box(13.5,4.5,8,15,2.5);
const arrowDown=(x,y,end)=>line(`M${x} ${y}V${end}m-3-3 3 3 3-3`);
const s=(body,filled)=>({body,filled});
export const shapes={
  camera:s(p(camera)+p(lens)+dot(17.5,10,.7),hole(camera+' '+lens)+dot(17.5,10,.7).replace('currentColor','var(--icon-cutout,#f6f4f1)')),
  projects:s(back+p(front)+line('M10 14.5q3.5 3 7 0'),back+hole(front+' '+box(10,15,7,1.5,.75))),
  add:s(line('M12 4v16M4 12h16')),
  search:s(circle(10.5,10.5,7)+line('M16 16l5 5')),
  review:s(p(frame)+line('M8 10a5 5 0 1 1 .5 5M8 6.5V10h3.5')),
  compare:s(p(compareA)+p(compareB)+line('M6.5 9v6M17.5 9v6'),hole(compareA+' '+box(5.75,9,1.5,6,.75))+hole(compareB+' '+box(16.75,9,1.5,6,.75))),
  play:s(p(play),fill(play)),
  shutter:s(circle(12,12,9)+circle(12,12,6)),
  'camera-flip':s(p(camera)+line('M8.5 12.5q3.5-4 7-.5m-2.5-2H16v3M15.5 15q-3.5 4-7 .5m2.5 2H8v-3')),
  flash:s(p(flash),fill(flash)),
  'flash-off':s(line('M13.5 3.5 9.5 8M16 10.5h3L16 14M6.5 11 5 13h6l-.5 7.5 3.5-4M3 3l18 18')),
  'flash-auto':s(p('M9 3 3 12h4l-.5 8 6-9H9Z')+line('M15 12l3.5-9L22 12M16.2 9h4.6')),
  overlay:s(back+p(front)+line('M10 16l3-3 5 5')+dot(11,10.5,.65)),
  'overlay-off':s(back+p(front)+line('M3 3l18 18')),
  opacity:s(circle(12,12,9)+line('M12 3v18')+line('M15.5 6.5v11M18.5 9v6')),
  align:s(line('M3 8V6q0-3 3-3h2M16 3h2q3 0 3 3v2M21 16v2q0 3-3 3h-2M8 21H6q-3 0-3-3v-2M9 12h6M12 9v6')),
  'grid-guide':s(p(frame)+line('M9 3v18M15 3v18M3 9h18M3 15h18')),
  retake:s(p('M6 10H8l1.2-2.5Q9.5 7 10.2 7h3.6q.7 0 1 .5L16 10h2q3.5 0 3.5 3.5V18q0 3.5-3.5 3.5H6q-3.5 0-3.5-3.5v-4.5Q2.5 10 6 10Z')+circle(12,15.5,3)+line('M20 5.5Q17.5 3.5 13 3.5H5M8 1.5 5 3.5 8 5.5')),
  exposure:s(circle(12,12,4)+line('M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M17.5 6.5 19 5M5 19l1.5-1.5')),
  photo:s(p(frame)+photoInside+dot(8,8.5,.85)),
  'switch-photo':s(line('M4 8h16m-3-3 3 3-3 3M20 16H4m3-3-3 3 3 3')),
  import:s(line('M12 4H7Q3 4 3 8v9q0 4 4 4h10q4 0 4-4v-3')+line('M3.5 17l4.5-4 4 3.5 2.5-2 3 2.5')+dot(8,8.5,.75)+arrowDown(18,2.5,11)),
  'batch-import':s(line('M2.5 8v10q0 3.5 3.5 3.5H16M13 3.5H9Q5.5 3.5 5.5 7v7.5Q5.5 18 9 18h8.5q3.5 0 3.5-3.5V12')+line('M6 14l4-3.5 3.5 3 2-1.5 2 1.5')+arrowDown(18,2,9)),
  'add-photo':s(line('M12 3H7Q3 3 3 7v10q0 4 4 4h10q4 0 4-4v-5')+photoInside+dot(8,8.5,.8)+line('M18 2v6M15 5h6')),
  stack:s(line('M3.5 7V6Q3.5 3.5 6 3.5h9Q17.5 3.5 17.5 6M2.5 12v6q0 3.5 3.5 3.5H16')+p(box(6.5,7,15,11,3))),
  cards:s(p(box(3,3.5,18,7,2.5))+p(box(3,13.5,18,7,2.5))),
  tiles:s(p(box(3,3,7,7,2))+p(box(14,3,7,7,2))+p(box(3,14,7,7,2))+p(box(14,14,7,7,2))),
  edit:s(p('M4 15.5 15.5 4Q17.5 2 19.5 4l.5.5q2 2 0 4L8.5 20l-5 1q-.5.1-.5-.5Z')+line('M14 5.5l4.5 4.5')),
  rename:s(line('M3 6V4h12v2M9 4v16M5.5 20h7M17 13h5M19.5 13v8M17 21h5')),
  note:s(p(frame)+line('M7 8h10M7 12h10M7 16h6')),
  delete:s(p('M5.5 8l.8 10q.2 3 3.2 3h5q3 0 3.2-3l.8-10')+line('M3.5 5.5h17M8.5 5.5V4Q8.5 2.5 10 2.5h4q1.5 0 1.5 1.5v1.5M10 10v7M14 10v7')),
  select:s(p(frame)+line('M7 12l3.2 3.2 6.8-7'),hole(frame+' M6 12l1.3-1.3 2.9 2.9L16.4 7l1.4 1.3-7.6 8Z')),
  pause:s(p(box(5,4,4,16,1.5))+p(box(15,4,4,16,1.5)),fill(box(5,4,4,16,1.5))+fill(box(15,4,4,16,1.5))),
  replay:s(line('M5 7a9 9 0 1 1-1.5 9M5 3v4h4')+p('M10 8.5q-.5-.3-.5.4v6.2q0 .7.5.4l5-3q.7-.5 0-1Z')),
  previous:s(line('M4 5v14')+p('M18.5 5.5q1-.6 1 .6v11.8q0 1.2-1 .6L7.5 12.8q-1.2-.8 0-1.6Z')),
  next:s(line('M20 5v14')+p('M5.5 5.5q-1-.6-1 .6v11.8q0 1.2 1 .6l11-5.7q1.2-.8 0-1.6Z')),
  'side-by-side':s(p(frame)+line('M12 3v18M6.5 9h2M15.5 15h2')),
  'split-compare':s(line('M8 4H6q-3 0-3 3v10q0 3 3 3h2M16 4h2q3 0 3 3v10q0 3-3 3h-2M12 2v20M8 10l-2 2 2 2M16 10l2 2-2 2')),
  pan:s(line('M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3')),
  'zoom-in':s(circle(10.5,10.5,7)+line('M16 16l5 5M7.5 10.5h6M10.5 7.5v6')),
  'zoom-out':s(circle(10.5,10.5,7)+line('M16 16l5 5M7.5 10.5h6')),
  fit:s(line('M3 8V6q0-3 3-3h2M16 3h2q3 0 3 3v2M21 16v2q0 3-3 3h-2M8 21H6q-3 0-3-3v-2M7 7l3 3M14 10l3-3M14 14l3 3M7 17l3-3')),
  'reset-position':s(line('M5 7a9 9 0 1 1-1.5 9M5 3v4h4M9 12h6M12 9v6')),
  scrub:s(p(box(9,4,6,16,2.5))+line('M2.5 12H6m-2-2-2 2 2 2M18 12h3.5m-2-2 2 2-2 2')),
  calendar:s(p(box(3,5,18,16,3))+line('M7 2.5v5M17 2.5v5M3 10h18')+dot(7,14)+dot(12,14)+dot(17,14)+dot(7,18)+dot(12,18)),
  clock:s(circle(12,12,9)+line('M12 7v5l3.5 2')),
  'date-edit':s(line('M11 21H6Q3 21 3 18V8q0-3 3-3h12q3 0 3 3v2M7 2.5v5M17 2.5v5M3 10h13')+p('M13.5 17l5-5q.7-.7 1.4 0l1.6 1.6q.7.7 0 1.4l-5 5-3.8 1Z')),
  'date-unknown':s(line('M11 21H6Q3 21 3 18V8q0-3 3-3h12q3 0 3 3v2M7 2.5v5M17 2.5v5M3 10h13M15 15q0-2.5 2.5-2.5T20 15q0 1.3-2 2.5')+dot(18,21)),
  reminder:s(p(bell)+bellFoot,fill(bell)+bellFoot),
  'reminder-off':s(line('M11 4.5q6.5-.5 6.5 5.5v2M6.5 10v2.5q0 2.5-1.7 4.2Q4 18 5.5 18H15M10 21q2 1.2 4 0M12 2.5v2M3 3l18 18')),
  repeat:s(line('M4 10V8q0-4 4-4h12m-3-3 3 3-3 3M20 14v2q0 4-4 4H4m3-3-3 3 3 3')),
  elapsed:s(line('M5 3h14M5 21h14')+p('M7 3v3q0 3 5 6-5 3-5 6v3M17 3v3q0 3-5 6 5 3 5 6v3')),
  back:s(line('M15 5l-7 7 7 7')),
  forward:s(line('M9 5l7 7-7 7')),
  close:s(line('M6 6l12 12M18 6 6 18')),
  check:s(line('M4.5 12l5 5L20 6')),
  more:s(dot(5,12,1.4)+dot(12,12,1.4)+dot(19,12,1.4)),
  settings:s(line('M3 7h4M13 7h8M3 17h8M17 17h4')+circle(10,7,3)+circle(14,17,3)),
  info:s(circle(12,12,9)+line('M12 11v6')+dot(12,7.5,.85)),
  private:s(p(box(5,10,14,11,3))+p('M8 10V7q0-4.5 4-4.5T16 7v3')+line('M12 15v2')),
  help:s(circle(12,12,9)+line('M9 8.5q0-3 3-3t3 3q0 1.5-3 3.5')+dot(12,17,.85)),
  warning:s(p('M10.3 4.5q1.7-3 3.4 0L21.5 18q1.7 3-1.7 3H4.2q-3.4 0-1.7-3Z')+line('M12 9v5')+dot(12,17.5,.85)),
  loading:s(line('M12 3a9 9 0 1 1-9 9')),
  'empty-photo':s(p(frame)+line('M7 16l3-3 3.2 3.2 2-2L18 17')+circle(8,8.5,.85)),
};
export const brandMark=`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" fill="none"><rect width="128" height="128" rx="28" fill="#e7e6f3"/><path d="M33 89h-2q-13 0-13-13V36q0-13 13-13h47q13 0 13 13v2" stroke="#282533" stroke-width="5.5" stroke-linecap="round"/><rect x="36" y="40" width="73" height="67" rx="17" fill="#282533"/><path d="M53 73C61 63 83 63 92 73C83 85 62 85 53 73Z" fill="#f6f4f1"/><circle cx="73" cy="73" r="7" fill="#282533"/><circle cx="76" cy="70" r="2" fill="#f6f4f1"/></svg>`;
