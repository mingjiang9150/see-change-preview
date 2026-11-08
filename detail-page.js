import {resolvePair,recordMonths} from './detail-model.js';
import {dayGap} from './core.js';
import {recordCalendar,recordYears,calendarMarkup} from './record-calendar.js';
export function createDetailPage(api){
  const {current,records,esc,icon,photo,fmt,time,modal,closeModal,refresh}=api;
  const photoFirst=api.photoFirst===true;
  const choices=new Map(),modes=new Map(),splitPositions=new Map();
  let splitDrag=null;
  const calendarOpen=new Set(),calendarYears=new Map();
  let reviewMode=false,reviewTimer=null;
  let pickerSide=0,pickerYear='',observer=null,viewerIndex=0,viewerPair=[],scale=1,panX=0,panY=0;
  let libraryMonth='',libraryScroll=0,librarySelecting=false,librarySelection=[],viewerFromLibrary=false;
  const pointers=new Map();let gesture=null,pinched=false,restoreFocus=null;
  const pair=()=>{const rows=records(),choice=choices.get(current().id);if(choice?.some(id=>!rows.some(r=>r.id===id)))choices.delete(current().id);return resolvePair(rows,choices.get(current().id));};
  const label=r=>new Date(r.date).toLocaleDateString('zh-CN',{month:'long',day:'numeric'});
  const recordLabel=r=>{const rows=records();return r.id===rows[0]?.id?'首次记录':r.id===rows.at(-1)?.id?'最新记录':'所选记录';};
  const dateControl=(r,side,enabled)=>`<button class="pair-date" data-detail="pick" data-side="${side}" ${enabled?'':'disabled'} aria-label="更换${side===0?'左':'右'}侧照片，${fmt(r.date,true)}"><span>${recordLabel(r)}</span>${enabled?icon('switch-photo'):''}</button>`;
  const stamp=r=>`<span class="photo-timestamp"><time datetime="${esc(r.date)}">${r.date.slice(0,10).replaceAll('-','.')}<span>${time(r.date)}</span></time></span>`;
  const originTag=r=>{if(photoFirst)return '';const rows=records();const text=r.id===rows[0]?.id?'首次记录':r.id===rows.at(-1)?.id?'最新记录':'';return text?`<span class="photo-origin-tag">${text}</span>`:'';};
  const photoDate=(r,side)=>records().length>1&&!photoFirst?`<button class="photo-pick" data-detail="pick" data-side="${side}" aria-label="更换${side===0?'左':'右'}侧照片，${fmt(r.date,true)}"><span class="photo-timestamp"><time datetime="${esc(r.date)}">${r.date.slice(0,10).replaceAll('-','.')}<span>${time(r.date)}</span></time>${icon('switch-photo')}</span></button>`:stamp(r);
  const modeControls=mode=>`<div class="detail-comparison-modes" role="group" aria-label="对比方式"><button data-detail="mode" data-mode="side" aria-pressed="${mode==='side'}" class="${mode==='side'?'active':''}">${icon('side-by-side')}并排</button><button data-detail="mode" data-mode="split" aria-pressed="${mode==='split'}" class="${mode==='split'?'active':''}">${icon('split-compare')}滑动</button></div>`;
  function placePhotoTags(){
    document.querySelectorAll('.pair-photo,.inline-split-photo').forEach(frame=>{
      const image=frame.querySelector('.photo-open img'),tag=frame.querySelector('.photo-origin-tag');
      if(!tag||!image?.naturalWidth)return;
      const scale=Math.min(frame.clientWidth/image.naturalWidth,frame.clientHeight/image.naturalHeight);
      tag.style.top=`${(frame.clientHeight-image.naturalHeight*scale)/2+8}px`;
      const inset=(frame.clientWidth-image.naturalWidth*scale)/2+8;
      if(frame.classList.contains('split-photo-last'))tag.style.right=`${inset}px`;
      else tag.style.left=`${inset}px`;
    });
  }
  function calendarHeader(rows){
    if(!rows.length)return '';
    const p=current(),years=recordYears(rows),chosen=calendarYears.get(p.id);
    const year=years.includes(chosen)?chosen:years[0],months=recordCalendar(rows,year),open=calendarOpen.has(p.id);
    return `<div class="record-calendar-slot"><button class="record-calendar-toggle" data-detail="calendar-toggle" aria-label="${open?'收起':'展开'}记录日历" aria-expanded="${open}" aria-controls="project-record-calendar" title="记录日历">${calendarMarkup(months,{mini:true,year})}</button>${open?`<section class="record-calendar-panel" id="project-record-calendar" aria-label="${year}年记录日历"><div class="record-calendar-head">${years.length>1?`<select id="record-calendar-year" aria-label="记录日历年份">${years.map(y=>`<option value="${y}" ${y===year?'selected':''}>${y} 年</option>`).join('')}</select>`:`<strong>${year}</strong>`}<button data-detail="calendar-close" aria-label="收起记录日历">${icon('close')}</button></div><button class="record-calendar-canvas" data-detail="calendar-close" aria-label="收起记录日历">${calendarMarkup(months,{year})}</button><span class="calendar-accessible">${months.map(m=>`${m.month}月：${m.days.filter(d=>d.count).map(d=>`${d.day}日${d.count}次`).join('、')||'无记录'}`).join('；')}</span></section>`:''}</div>`;
  }
  function toggleCalendar(){const id=current().id;if(calendarOpen.has(id))calendarOpen.delete(id);else calendarOpen.add(id);refresh();(document.querySelector('.record-calendar-head button')||document.querySelector('.record-calendar-toggle'))?.focus();}
  function closeCalendar(){if(!calendarOpen.delete(current()?.id))return;refresh();document.querySelector('.record-calendar-toggle')?.focus();}
  function render(){
    const p=current();if(!p)return '';
    requestAnimationFrame(placePhotoTags);
    const rows=records(),chosen=pair(),first=chosen[0],last=chosen[1];
    const defaultPair=!choices.has(p.id),mode=modes.get(p.id)||'side',position=splitPositions.get(p.id)??50;
    const images=mode==='split'&&last?`
      <div class="inline-split" style="--split:${position}%" aria-label="滑动对比照片">
        <div class="inline-split-photo split-photo-first"><button class="photo-open" data-detail="view" data-side="0" aria-label="放大${fmt(first.date,true)}的照片">${photo(first)}</button>${originTag(first)}${photoDate(first,0)}</div>
        <div class="inline-split-photo split-photo-last"><button class="photo-open" data-detail="view" data-side="1" aria-label="放大${fmt(last.date,true)}的照片">${photo(last)}</button>${originTag(last)}${photoDate(last,1)}</div>
        <div class="inline-split-divider"><button class="inline-split-grip" role="slider" tabindex="0" aria-label="移动对比分割线" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(position)}" aria-valuetext="左侧照片占 ${Math.round(position)}%">${icon('split-compare')}</button></div>
      </div>`:`<div class="pair-photos">${chosen.map((r,i)=>`
        <div class="pair-photo"><button class="photo-open" data-detail="view" data-side="${i}" aria-label="放大${fmt(r.date,true)}的照片">${photo(r)}</button>${originTag(r)}${photoDate(r,i)}</div>`).join('')}</div>`;
    if(photoFirst)return `<div class="detail-shell photo-first">
      <header class="project-nav"><button data-action="home" aria-label="返回项目列表">${icon('back')}</button><span>${p.generated?'AI 示例':p.sample?'示例':''}</span></header>
      <main class="project-detail">
        ${first?`<section class="photo-first-hero ${last?'':'single-record'}" aria-label="${last?'照片对比':'首张记录'}">${images}</section>`:`<div class="detail-empty">${icon('empty-photo')}<p>留下第一张</p></div>`}
        <div class="photo-first-content">
          <div class="project-heading-detail"><div class="project-heading-copy"><h1>${esc(p.name)}</h1><p>记录 ${rows.length} 次${rows.length?`<span>·</span>已经过 ${dayGap(rows[0].date,new Date())} 天`:''}</p></div>${calendarHeader(rows)}</div>
          <div class="photo-first-functions">
            ${last?`<div class="detail-comparison-modes" role="group" aria-label="对比方式"><button data-detail="mode" data-mode="side" aria-pressed="${mode==='side'}" class="${mode==='side'?'active':''}">${icon('side-by-side')}并排</button><button data-detail="mode" data-mode="split" aria-pressed="${mode==='split'}" class="${mode==='split'?'active':''}">${icon('split-compare')}滑动</button></div>`:'<span></span>'}
            <div class="photo-first-tools">${p.sample?`<button data-action="create" aria-label="开始我的记录">${icon('camera')}</button>`:`<button data-action="capture" aria-label="拍摄新照片" title="拍摄新照片">${icon('camera')}</button><button data-action="import" aria-label="从相册导入" title="从相册导入">${icon('import')}</button><button data-detail="library" aria-label="查看全部照片记录">${icon('projects')}</button><button data-action="settings" aria-label="项目设置">${icon('settings')}</button>`}</div>
          </div>
          ${first?`<section class="pair-section ${last?'':'single-record'}" aria-label="选择对比照片"><div class="pair-dates">${chosen.map((r,i)=>`<div>${dateControl(r,i,!!last)}</div>`).join('')}</div>${last?`<div class="pair-distance"><span></span><p>相隔 <b>${dayGap(first.date,last.date)}</b> 天</p><span></span></div>${!defaultPair?'<button class="pair-default" data-detail="reset">回到首次与最新</button>':''}`:'<p class="next-record">留下下一张，再看看变化。</p>'}</section>`:''}
        </div>
      </main>
    </div>`;
    return `<div class="detail-shell">
      <header class="project-nav"><button data-action="home" aria-label="返回项目列表">${icon('back')}</button><span>${p.generated?'AI 示例':p.sample?'示例':''}</span><span class="nav-spacer" aria-hidden="true"></span></header>
      <main class="project-detail">
        <div class="project-heading-detail"><div class="project-heading-copy"><h1>${esc(p.name)}</h1><p>记录 ${rows.length} 次${rows.length?`<span>·</span>已经过 ${dayGap(rows[0].date,new Date())} 天`:''}</p></div>${calendarHeader(rows)}</div>
        ${first?`<section class="pair-section ${last?'':'single-record'}" aria-label="${last?'照片对比':'首张记录'}">
          ${images}
          ${last?`<div class="pair-distance"><span></span><p>相隔 <b>${dayGap(first.date,last.date)}</b> 天</p><span></span></div>${!defaultPair?'<button class="pair-default" data-detail="reset">回到首次与最新</button>':''}`:'<p class="next-record">留下下一张，再看看变化。</p>'}
        </section>`:`<div class="detail-empty">${icon('empty-photo')}<p>留下第一张</p></div>`}
        ${p.sample?'<button class="primary sample-start" data-action="create">开始我的记录</button>':''}
      </main>
      <footer class="detail-dock"><div class="review-dock project-function-dock">${last?modeControls(mode):''}<div class="dock-main-actions" role="group" aria-label="照片记录">${!p.sample?`<button data-action="capture" aria-label="拍摄新照片">${icon('camera')}<span>拍摄</span></button><button data-action="import" aria-label="从相册导入">${icon('import')}<span>导入</span></button>`:''}<button data-detail="library" aria-label="查看全部照片记录">${icon('projects')}<span>全部</span></button></div>${!p.sample?`<button class="dock-project-settings" data-action="settings" aria-label="项目设置">${icon('settings')}<span>设置</span></button>`:''}</div></footer>
    </div>`;
  }
  function setMode(mode){
    if(!['side','split'].includes(mode)||records().length<2)return;
    modes.set(current().id,mode);refresh();
    document.querySelector(`[data-detail="mode"][data-mode="${mode}"]`)?.focus();
  }
  function updateSplit(value){
    const position=Math.max(0,Math.min(100,value));splitPositions.set(current().id,position);
    const root=document.querySelector('.inline-split');if(!root)return;
    root.style.setProperty('--split',`${position}%`);
    const grip=root.querySelector('.inline-split-grip');
    grip.setAttribute('aria-valuenow',String(Math.round(position)));
    grip.setAttribute('aria-valuetext',`左侧照片占 ${Math.round(position)}%`);
  }
  function cleanup(){splitDrag=null;observer?.disconnect();observer=null;clearInterval(reviewTimer);reviewTimer=null;const playbackButton=document.querySelector('[data-detail=playback]');if(playbackButton){playbackButton.innerHTML=icon('play');playbackButton.setAttribute('aria-label','自动播放');}pointers.clear();gesture=null;}
  function sheet(title,body,className){modal(title,body);const overlay=document.querySelector('#modal-root .overlay');overlay.classList.add('detail-overlay');overlay.querySelector('.modal').classList.add(...className.split(/\s+/));}
  function menu(){return library();}
  function rename(){sheet('修改项目名称',`<input id="detail-name" maxlength="40" aria-label="项目名称" value="${esc(current().name)}"><p class="error" id="modal-error"></p><button class="primary rename-save" data-detail="save-name">保存</button>`,'detail-menu-sheet');setTimeout(()=>document.querySelector('#detail-name')?.select(),0);}
  function picker(side){pickerSide=Number(side);const r=pair()[pickerSide];pickerYear=r.date.slice(0,4);drawPicker(r.date.slice(0,7));}
  function drawPicker(month){const rows=records(),chosen=pair(),active=chosen[pickerSide],other=chosen[1-pickerSide],years=[...new Set(rows.map(r=>r.date.slice(0,4)))].sort().reverse(),months=recordMonths(rows,pickerYear);
    cleanup();
    sheet(`更换${pickerSide===0?'左':'右'}侧照片`,`<div class="picker-controls"><label class="picker-year">${icon('calendar')}<select id="picker-year" aria-label="选择年份">${years.map(y=>`<option value="${y}" ${y===pickerYear?'selected':''}>${y} 年</option>`).join('')}</select></label><nav class="picker-months" aria-label="选择月份">${months.map(m=>`<button data-detail="month" data-month="${m}" class="${m===month?'active':''}" aria-pressed="${m===month}">${Number(m.slice(5))} 月</button>`).join('')}</nav></div><div class="picker-scroll">${months.map(m=>`<section class="picker-group" data-month="${m}" id="month-${m}"><h3>${Number(m.slice(5))} 月<span>${m.slice(0,4)}</span></h3><div class="picker-grid">${rows.filter(r=>r.date.startsWith(m)).map(r=>`<button data-detail="choose" data-id="${esc(r.id)}" class="picker-item ${r.id===active.id?'selected':''}" ${r.id===other.id?'disabled':''} aria-label="${fmt(r.date,true)} ${time(r.date)}${r.id===active.id?'，当前选中':r.id===other.id?'，另一张对比照片':''}"><span class="picker-thumb">${photo(r,'loading="lazy"')}${r.id===active.id?`<span class="picker-check">${icon('check')}</span>`:r.id===other.id?'<span class="picker-other">另一张</span>':''}</span><span class="picker-date">${label(r)}</span><small>${time(r.date)}</small></button>`).join('')}</div></section>`).join('')}</div>`,'photo-picker-sheet');
    document.querySelector('.photo-picker-sheet').style.height=`min(80svh,${230+months.reduce((height,m)=>height+46+Math.ceil(rows.filter(r=>r.date.startsWith(m)).length/3)*160,0)}px)`;
    const root=document.querySelector('.picker-scroll');root.querySelector(`#month-${month}`)?.scrollIntoView({block:'start',behavior:'instant'});
    observer=new IntersectionObserver(entries=>{const visible=[...root.querySelectorAll('.picker-group')].filter(el=>{const r=el.getBoundingClientRect(),b=root.getBoundingClientRect();return r.bottom>b.top+20&&r.top<b.bottom});if(visible[0])setMonth(visible[0].dataset.month);},{root,threshold:[0,.1,.5,1]});root.querySelectorAll('.picker-group').forEach(el=>observer.observe(el));setMonth(month);
  }
  function setMonth(month){document.querySelectorAll('.picker-months button').forEach(b=>{b.classList.toggle('active',b.dataset.month===month);b.setAttribute('aria-pressed',String(b.dataset.month===month));});document.querySelector('.picker-months .active')?.scrollIntoView({inline:'nearest',block:'nearest',behavior:'instant'});}
  function choose(id){const chosen=pair();if(chosen[1-pickerSide]?.id===id)return;if(chosen[pickerSide]?.id===id){closeModal();return;}chosen[pickerSide]=records().find(r=>r.id===id);choices.set(current().id,chosen.map(r=>r.id));closeModal();refresh();(document.querySelector('.photo-pick[data-side="'+pair().findIndex(r=>r.id===id)+'"]')||document.querySelector('.pair-date'))?.focus();}
  function library(){librarySelecting=false;librarySelection=[];libraryMonth=records().at(-1)?.date.slice(0,7)||'';libraryScroll=0;drawLibrary();}
  function libraryControls(){const rows=records(),years=[...new Set(rows.map(r=>r.date.slice(0,4)))].sort().reverse(),year=libraryMonth.slice(0,4),months=recordMonths(rows,year).reverse();return `<label class="picker-year">${icon('calendar')}<select id="library-year" aria-label="跳转到年份">${years.map(y=>`<option value="${y}" ${y===year?'selected':''}>${y} 年</option>`).join('')}</select></label><nav class="picker-months" aria-label="跳转到月份">${months.map(m=>`<button data-detail="library-month" data-month="${m}" class="${m===libraryMonth?'active':''}" aria-pressed="${m===libraryMonth}">${Number(m.slice(5))} 月</button>`).join('')}</nav>`;}
  function drawLibrary(restore=false){
    cleanup();viewerFromLibrary=false;
    const rows=records(),months=[...new Set(rows.map(r=>r.date.slice(0,7)))].sort().reverse();
    sheet('全部记录',`<div class="library-heading"><span>${esc(current().name)}</span>${rows.length>1?`<button data-detail="library-select">${librarySelecting?'取消选择':'选照片对比'}</button>`:''}</div>${rows.length?`<div class="picker-controls library-controls">${libraryControls()}</div><div class="picker-scroll library-scroll">${months.map(m=>`<section class="picker-group" data-month="${m}" id="library-${m}"><h3>${Number(m.slice(5))} 月<span>${m.slice(0,4)}</span></h3><div class="picker-grid">${rows.filter(r=>r.date.startsWith(m)).reverse().map(r=>`<button data-detail="${librarySelecting?'library-choose':'library-view'}" data-id="${esc(r.id)}" class="picker-item ${librarySelection.includes(r.id)?'selected':''}" aria-label="${librarySelecting?'选择':'查看'}${fmt(r.date,true)} ${time(r.date)}" ${librarySelecting?`aria-pressed="${librarySelection.includes(r.id)}"`:''}><span class="picker-thumb">${photo(r,'loading="lazy"')}${librarySelecting?`<span class="library-mark ${librarySelection.includes(r.id)?'selected':''}">${librarySelection.includes(r.id)?icon('check'):''}</span>`:''}</span><span class="picker-date">${label(r)}</span><small>${time(r.date)}</small></button>`).join('')}</div></section>`).join('')}</div>${librarySelecting?`<div class="library-selection-bar"><span aria-live="polite">${librarySelection.length===2?'已选 2 张':librarySelection.length===1?'再选 1 张':'选择 2 张照片'}</span><button class="secondary" data-detail="library-compare" ${librarySelection.length!==2?'disabled':''}>对比这两张</button></div>`:''}`:'<div class="library-empty">还没有照片记录</div>'}`,'photo-picker-sheet all-records-sheet');
    const root=document.querySelector('.library-scroll');if(!root)return;
    if(restore)root.scrollTop=libraryScroll;
    observer=new IntersectionObserver(()=>{const bounds=root.getBoundingClientRect(),visible=[...root.querySelectorAll('.picker-group')].find(el=>el.getBoundingClientRect().bottom>bounds.top+24);if(visible&&visible.dataset.month!==libraryMonth){libraryMonth=visible.dataset.month;document.querySelector('.library-controls').innerHTML=libraryControls();}},{root,threshold:[0,.1,.5,1]});root.querySelectorAll('.picker-group').forEach(el=>observer.observe(el));
  }
  function selectLibraryPhoto(id){libraryScroll=document.querySelector('.library-scroll').scrollTop;if(librarySelection.includes(id))librarySelection=librarySelection.filter(x=>x!==id);else if(librarySelection.length<2)librarySelection.push(id);drawLibrary(true);document.querySelector(`[data-detail="library-choose"][data-id="${id}"]`)?.focus();}
  function compareLibrary(){if(librarySelection.length!==2)return;choices.set(current().id,[...librarySelection]);closeModal();refresh();document.querySelector('[data-detail="library"]')?.focus();}
  function viewLibrary(id){libraryScroll=document.querySelector('.library-scroll').scrollTop;cleanup();viewerFromLibrary=true;reviewMode=true;viewerPair=records();viewerIndex=viewerPair.findIndex(r=>r.id===id);scale=1;panX=panY=0;drawViewer();}
  function dismissViewer(){if(!viewerFromLibrary||!document.querySelector('.photo-viewer'))return false;drawLibrary(true);return true;}
  function view(side){viewerFromLibrary=false;reviewMode=false;restoreFocus=document.activeElement;viewerPair=pair();viewerIndex=Number(side);scale=1;panX=panY=0;drawViewer();}
  function drawViewer(){const r=viewerPair[viewerIndex];api.select(r.id);sheet(fmt(r.date,true)+' '+time(r.date),`<div class="viewer-stage" aria-label="照片，可缩放或左右滑动">${photo(r)}<span class="viewer-note">${esc(r.note||'')}</span></div><div class="viewer-footer">${reviewMode?`<div class="viewer-review"><button data-detail="viewer-prev" aria-label="上一张照片" ${viewerIndex===0?'disabled':''}>${icon('previous')}</button><span>${viewerIndex+1} / ${viewerPair.length}</span><button data-detail="viewer-next" aria-label="下一张照片" ${viewerIndex===viewerPair.length-1?'disabled':''}>${icon('next')}</button></div>`:`<div class="viewer-switch" aria-label="切换对比照片">${viewerPair.map((r,i)=>`<button data-detail="viewer-switch" data-side="${i}" class="${i===viewerIndex?'active':''}" aria-label="查看${fmt(r.date,true)}的照片" aria-pressed="${i===viewerIndex}">${label(r)}${viewerPair.filter(x=>x.date.slice(0,10)===r.date.slice(0,10)).length>1?' · '+time(r.date):''}</button>`).join('')}</div>`}<div class="viewer-tools">${reviewMode?`<button data-detail="playback" aria-label="${reviewTimer?'暂停播放':'自动播放'}">${icon(reviewTimer?'pause':'play')}</button>`:''}<button data-detail="zoom" aria-label="${scale>1?'还原照片':'放大照片'}">${icon(scale>1?'fit':'zoom-in')}</button>${!current().sample?`<button data-detail="edit" aria-label="编辑这张记录">${icon('edit')}</button>`:''}</div></div>`,'photo-viewer');applyTransform();}
  function applyTransform(){const media=document.querySelector('.viewer-stage .photo-media');if(media)media.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`;const button=document.querySelector('[data-detail=zoom]');if(button){button.innerHTML=icon(scale>1?'fit':'zoom-in');button.setAttribute('aria-label',scale>1?'还原照片':'放大照片');}}
  function switchViewer(side){viewerIndex=Math.max(0,Math.min(Number(side),viewerPair.length-1));scale=1;panX=panY=0;drawViewer();}
  function playback(){if(reviewTimer){clearInterval(reviewTimer);reviewTimer=null;drawViewer();return;}if(viewerIndex===viewerPair.length-1)viewerIndex=0;reviewTimer=setInterval(()=>{if(viewerIndex>=viewerPair.length-1){clearInterval(reviewTimer);reviewTimer=null;drawViewer();}else switchViewer(viewerIndex+1);},1400);drawViewer();}
  function startReview(){cleanup();viewerFromLibrary=false;reviewMode=true;viewerPair=records();viewerIndex=0;scale=1;panX=panY=0;drawViewer();playback();}
  function toggleZoom(){scale=scale>1?1:2;panX=panY=0;applyTransform();const b=document.querySelector('[data-detail=zoom]');b.innerHTML=icon(scale>1?'fit':'zoom-in');b.setAttribute('aria-label',scale>1?'还原照片':'放大照片');}
  const handlers={'calendar-toggle':toggleCalendar,'calendar-close':closeCalendar,library,'library-select':()=>{libraryScroll=document.querySelector('.library-scroll').scrollTop;librarySelecting=!librarySelecting;librarySelection=[];drawLibrary(true);},'library-choose':el=>selectLibraryPhoto(el.dataset.id),'library-compare':compareLibrary,'library-view':el=>viewLibrary(el.dataset.id),'library-month':el=>{libraryMonth=el.dataset.month;document.querySelector('.library-controls').innerHTML=libraryControls();document.querySelector(`#library-${libraryMonth}`)?.scrollIntoView({block:'start',behavior:'smooth'});},mode:el=>setMode(el.dataset.mode),playback,'viewer-prev':()=>switchViewer(viewerIndex-1),'viewer-next':()=>switchViewer(viewerIndex+1),'save-name':async()=>{const name=document.querySelector('#detail-name').value.trim();if(!name){document.querySelector('#modal-error').textContent='请输入项目名称。';return}if(await api.rename(name)){closeModal();refresh();}},pick:el=>picker(el.dataset.side),month:el=>{document.querySelector(`#month-${el.dataset.month}`)?.scrollIntoView({block:'start',behavior:'smooth'});setMonth(el.dataset.month)},choose:el=>choose(el.dataset.id),reset:()=>{choices.delete(current().id);refresh();},view:el=>view(el.dataset.side),'viewer-switch':el=>switchViewer(el.dataset.side),zoom:toggleZoom,edit:()=>{viewerFromLibrary=false;closeModal();api.edit();}};
  document.addEventListener('click',async e=>{const el=e.target.closest('[data-detail]');if(el&&!el.disabled&&!api.busy())await handlers[el.dataset.detail]?.(el);});
  document.addEventListener('load',e=>{if(e.target.matches?.('.photo-open img'))placePhotoTags();},true);
  window.addEventListener('resize',()=>requestAnimationFrame(placePhotoTags));
  document.addEventListener('change',e=>{if(e.target.id==='record-calendar-year'){calendarYears.set(current().id,Number(e.target.value));refresh();document.querySelector('#record-calendar-year')?.focus();}if(e.target.id==='library-year'){libraryMonth=recordMonths(records(),e.target.value).at(-1);document.querySelector('.library-controls').innerHTML=libraryControls();document.querySelector(`#library-${libraryMonth}`)?.scrollIntoView({block:'start',behavior:'instant'});}if(e.target.id==='picker-year'){pickerYear=e.target.value;drawPicker(recordMonths(records(),pickerYear)[0]);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&calendarOpen.has(current()?.id)&&!document.querySelector('#modal-root .modal')){e.preventDefault();closeCalendar();}});
  document.addEventListener('dblclick',e=>{if(e.target.closest('.viewer-stage'))toggleZoom();});
  document.addEventListener('keydown',e=>{
    if(!e.target.matches('.inline-split-grip'))return;
    const amount={ArrowLeft:-5,ArrowDown:-5,ArrowRight:5,ArrowUp:5}[e.key],value=splitPositions.get(current().id)??50;
    if(amount!==undefined||['Home','End'].includes(e.key)){
      e.preventDefault();updateSplit(e.key==='Home'?0:e.key==='End'?100:value+amount);
    }
  });
  document.addEventListener('pointerdown',e=>{
    const grip=e.target.closest('.inline-split-grip');if(!grip)return;
    e.preventDefault();grip.focus();grip.setPointerCapture(e.pointerId);splitDrag=e.pointerId;
  });
  document.addEventListener('pointermove',e=>{
    if(splitDrag!==e.pointerId)return;
    const root=document.querySelector('.inline-split');if(!root)return;
    const box=root.getBoundingClientRect();updateSplit((e.clientX-box.left)/box.width*100);
  });
  document.addEventListener('pointerup',e=>{if(splitDrag===e.pointerId)splitDrag=null;});
  document.addEventListener('pointercancel',()=>{splitDrag=null;});
  document.addEventListener('keydown',e=>{if(!document.querySelector('.photo-viewer')||e.target.matches('input,select,textarea'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();switchViewer(viewerIndex+(e.key==='ArrowLeft'?-1:1));}if(e.key==='Escape'){cleanup();restoreFocus?.isConnected&&restoreFocus.focus();}});
  document.addEventListener('pointerdown',e=>{const stage=e.target.closest('.viewer-stage');if(!stage)return;stage.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){pinched=false;gesture={x:e.clientX,y:e.clientY,panX,panY};}if(pointers.size===2){pinched=true;const [a,b]=[...pointers.values()];gesture={distance:Math.hypot(a.x-b.x,a.y-b.y),scale};}});
  document.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&gesture?.distance){const [a,b]=[...pointers.values()];scale=Math.max(1,Math.min(4,gesture.scale*Math.hypot(a.x-b.x,a.y-b.y)/gesture.distance));applyTransform();}else if(pointers.size===1&&!pinched&&scale>1){const box=document.querySelector('.viewer-stage').getBoundingClientRect();panX=Math.max(-box.width*(scale-1)/2,Math.min(box.width*(scale-1)/2,gesture.panX+e.clientX-gesture.x));panY=Math.max(-box.height*(scale-1)/2,Math.min(box.height*(scale-1)/2,gesture.panY+e.clientY-gesture.y));applyTransform();}});
  document.addEventListener('pointerup',e=>{if(!pointers.has(e.pointerId))return;const dx=e.clientX-(gesture?.x??e.clientX),dy=e.clientY-(gesture?.y??e.clientY);pointers.delete(e.pointerId);if(!pointers.size&&!pinched&&scale===1){if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)switchViewer(viewerIndex+(dx<0?1:-1));else if(dy>75&&Math.abs(dy)>Math.abs(dx)*1.3)closeModal();}if(!pointers.size)gesture=null;});
  document.addEventListener('pointercancel',()=>{pointers.clear();gesture=null;});
  document.addEventListener('wheel',e=>{if(!e.target.closest('.viewer-stage'))return;e.preventDefault();scale=Math.max(1,Math.min(4,scale-e.deltaY*.005));if(scale===1)panX=panY=0;applyTransform();},{passive:false});
  return {render,cleanup,pair,startReview,setMode,dismissViewer,resetCalendar:()=>calendarOpen.clear()};
}
