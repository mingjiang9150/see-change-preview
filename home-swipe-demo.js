import {generatedProjects,refreshGeneratedPhotoSources} from './generated-projects.js?v=photo-lite-1';
import {ordered,dayGap} from './core.js';
import {iconSvg} from './icon-library.js';
import {applyPalette} from './home-palettes.js';
applyPalette();
const palettePreview=new URLSearchParams(location.search).get('preview')==='palette';
const productHome=new URLSearchParams(location.search).get('product')==='1';
function productAction(action,id){
  if(!productHome||window.parent===window)return false;
  window.parent.postMessage({type:'see-change-home-action',action,id},location.origin);
  return true;
}

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon=(name,options={})=>iconSvg(
  ({plus:'add',arrow:'forward',grid:'tiles'})[name]||name,
  {...options,className:'icon'}
);

function openDb(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(new URLSearchParams(location.search).get('db')==='generated'?'see-change-generated-v1':'see-change-v1',1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('data'))request.result.createObjectStore('data');};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

async function loadProjects(){
  try{
    const db=await openDb();
    const projects=await new Promise((resolve,reject)=>{
      const request=db.transaction('data').objectStore('data').get('projects');
      request.onsuccess=()=>resolve(request.result||[]);
      request.onerror=()=>reject(request.error);
    });
    db.close();
    return refreshGeneratedPhotoSources(projects);
  }catch{return [];}
}

const record=(id,date,src,panel)=>({id,date,src,...(panel===undefined?{}:{panel})});
const productExample={id:'home-example',name:'窗台上的小绿植',sample:true,records:['2026-08-19T09:00','2026-08-24T09:20','2026-09-02T08:40','2026-09-16T09:10','2026-09-29T09:00'].map((date,i)=>record(`example-${i}`,date,`assets/plant-${i}.svg`))};
const photoAttrs=row=>Number.isInteger(row.panel)?` data-photo-panel="${row.panel}" style="--photo-panel:${row.panel}"`:'';
function sampleProjects(){return generatedProjects();}

function stressProjects(){
  const base=sampleProjects();
  return Array.from({length:20},(_,index)=>{
    const source=base[index%base.length];
    return {...source,id:`stress-${index}`,name:index===7?'阳台植物和日常光照变化观察':`${source.name}${index>5?` ${index+1}`:''}`};
  });
}

function recentProjects(projects){
  return projects.map((project,position)=>{
    const rows=ordered(project.records||[]);
    const activity=new Date(rows.at(-1)?.date||project.created||0).getTime()||0;
    return {project,position,activity};
  }).sort((a,b)=>b.activity-a.activity||a.position-b.position).map(item=>item.project);
}

function fallbackFor(project){return 'assets/empty-project.svg';}

function themeFor(project,index){
  const text=`${project.type||''} ${project.name||''}`;
  if(/skin|皮肤|痘|脸/.test(text))return 'lilac';
  if(/plant|植物|树|花/.test(text))return 'mint';
  if(/cook|做饭|菜|食/.test(text))return 'peach';
  if(/read|阅读|书/.test(text))return 'blue';
  return ['lilac','mint','peach','blue','sand'][index%5];
}

function dateLabel(value){
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return '日期待确认';
  return `${date.getMonth()+1}月${date.getDate()}日`;
}

function previewRows(records){
  const rows=ordered(records||[]);
  if(rows.length<=5)return rows;
  const indexes=[0,.25,.5,.75,1].map(ratio=>Math.round((rows.length-1)*ratio));
  return [...new Set(indexes)].map(index=>rows[index]);
}

function projectStats(project){
  const rows=ordered(project.records||[]);
  const parts=new Intl.DateTimeFormat('en',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part=type=>parts.find(item=>item.type===type).value;
  const today=`${part('year')}-${part('month')}-${part('day')}T12:00`;
  return {count:rows.length,days:rows.length?dayGap(rows[0].date,today):0};
}

function statsLabel(project){
  const {count,days}=projectStats(project);
  return `${count} 次记录 · ${days} 天`;
}

function stackedRows(records){return ordered(records||[]).slice(-3);}

function projectTile(project,index){
  const rows=stackedRows(project.records);
  const stats=projectStats(project);
  const eager=palettePreview||index<2;
  const layers=rows.map((row,layer)=>`<span class="stack-photo"><img ${eager?`src="${esc(row.src||fallbackFor(project))}" data-hydrated="true"`:''} data-stack-image="${layer}"${photoAttrs(row)} alt="${esc(project.name)}，${esc(dateLabel(row.date))}" loading="${eager?'eager':'lazy'}" decoding="async" draggable="false"></span>`).join('');
  return `<button class="project-tile${rows.length?'':' is-empty'}" type="button" data-project-card="${esc(project.id)}" data-project-name="${esc(project.name)}" data-card-index="${index}" data-open-project="${esc(project.id)}" aria-label="打开${esc(project.name)}，${esc(statsLabel(project))}">
    <span class="tile-stack" data-layers="${rows.length}">${rows.length?layers:`<span class="tile-empty">${icon('camera')}<span>尚未记录</span></span>`}</span>
    <span class="tile-title">${esc(project.name)}</span>
    <span class="tile-stats"><span>${stats.count} 次记录</span><span>${stats.days} 天</span></span>
  </button>`;
}

function cardMedia(project,rows,eagerCard=false){
  if(!rows.length)return `<button class="empty-media" type="button" data-add-photo="${esc(project.id)}">${icon('camera')}<span>拍下第一张</span></button>`;
  const previews=previewRows(rows);
  const fallback=fallbackFor(project);
  const cells=previews.map((row,index)=>{
    const source=row.src||fallback;
    const eager=palettePreview||(eagerCard&&index<3);
    return `<figure class="photo-cell${row.src?'':' is-fallback'}" data-preview-index="${index}" style="--crop:${30+(index%4)*14}%"><img ${eager?`src="${esc(source)}" data-hydrated="true"`:''} data-preview-image="${index}"${photoAttrs(row)} alt="${esc(project.name)}的照片，拍摄于${esc(dateLabel(row.date))}" loading="${eager?'eager':'lazy'}" decoding="async" draggable="false"><figcaption>${esc(dateLabel(row.date))}</figcaption></figure>`;
  }).join('');
  if(rows.length===1){
    return `${cells}<button class="add-media" type="button" data-add-photo="${esc(project.id)}">${icon('plus')}<span>再记录一张</span></button>`;
  }
  return `${cells}<button class="summary-media" type="button" data-open-project="${esc(project.id)}">${icon('arrow')}<span>查看项目</span></button>`;
}

function projectCard(project,index){
  const rows=ordered(project.records||[]);
  const updated=project.sample?'示例':rows.length?`更新于 ${dateLabel(rows.at(-1).date)}`:'可以从拍摄或导入开始';
  const stateClass=!rows.length?' is-empty':rows.length===1?' is-single':rows.length===2?' is-double':' is-multiple';
  return `<article class="project-card${stateClass}" data-project-card="${esc(project.id)}" data-project-name="${esc(project.name)}" data-card-index="${index}" data-theme="${themeFor(project,index)}" aria-labelledby="project-title-${index}">
    <header class="card-head"><div><h2 id="project-title-${index}">${esc(project.name)}</h2><p>${esc(updated)}</p></div><button class="detail-link" type="button" data-open-project="${esc(project.id)}" aria-label="查看${esc(project.name)}详情">${icon('arrow')}</button></header>
    <div class="preview-track" tabindex="${rows.length>=3?'0':'-1'}" ${rows.length>=3?`role="region" aria-roledescription="carousel" aria-label="${esc(project.name)}照片预览"`:''}>${cardMedia(project,rows,index<2)}</div>
    <footer class="card-foot"><span>${esc(statsLabel(project))}</span></footer>
  </article>`;
}

let projects=[];
const scrollPositions=new Map();
const listPositions={cards:0,grid:0};
let imageObserver;
let viewMode='cards';
try{if(localStorage.getItem('see-change-home-view')==='grid')viewMode='grid';}catch{}
const requestedView=new URLSearchParams(location.search).get('view');
if(['cards','grid'].includes(requestedView))viewMode=requestedView;

function filterProjects(){
  const query=document.querySelector('.search-sheet input')?.value.trim().toLocaleLowerCase()||'';
  document.querySelectorAll('[data-project-card]').forEach(card=>{card.hidden=!card.dataset.projectName.toLocaleLowerCase().includes(query);});
}

function renderProjectList(){
  const list=document.querySelector('.project-list');
  list.classList.toggle('is-grid',viewMode==='grid'&&projects.length>0);
  list.innerHTML=projects.length?projects.map(viewMode==='grid'?projectTile:projectCard).join(''):`<section class="empty-home${productHome?' has-example':''}"><div>${icon('camera')}</div><h2>留下第一张</h2><button type="button" data-new-project>新建项目</button>${productHome?'<button class="empty-import" type="button" data-product-import>导入已有照片</button><button class="empty-sample" type="button" data-product-sample>看看示例</button>':''}</section>${productHome?projectCard(productExample,0):''}`;
  document.querySelectorAll('[data-view-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.viewMode===viewMode)));
  filterProjects();
  document.querySelectorAll('.preview-track').forEach(track=>{
    track.scrollLeft=scrollPositions.get(track.closest('[data-project-card]').dataset.projectCard)||0;
  });
  list.scrollTop=listPositions[viewMode];
  prepareImageLoading();
}

function switchView(mode){
  if(mode===viewMode||!['cards','grid'].includes(mode))return;
  listPositions[viewMode]=document.querySelector('.project-list').scrollTop;
  viewMode=mode;
  gesture=null;
  try{localStorage.setItem('see-change-home-view',mode);}catch{}
  renderProjectList();
  document.querySelector(`[data-view-mode="${mode}"]`)?.focus({preventScroll:true});
}

function render(data){
  const mode=new URLSearchParams(location.search).get('data')||'sample';
  if(mode==='empty')projects=[];
  else if(mode==='stress')projects=recentProjects(stressProjects());
  else if(mode==='real')projects=recentProjects(data);
  else projects=recentProjects(sampleProjects());
  document.querySelector('#demo').innerHTML=`<div class="phone-shell">
    <header class="home-header"><div class="headline"><h1>看见变化</h1><div class="header-actions"><button type="button" data-search aria-label="搜索项目">${icon('search')}</button><button type="button" data-new-project aria-label="新建项目">${icon('plus')}</button></div></div></header>
    <div class="search-sheet" hidden><label>${icon('search')}<input type="search" placeholder="查找项目" aria-label="查找项目"><button type="button" data-close-search aria-label="关闭搜索">${icon('close')}</button></label></div>
    <div class="section-title"><h2>${projects.length} 个项目${projects.length&&projects.every(p=>p.generated)?' · AI 示例':mode==='sample'||mode==='stress'?' · 示例':''}</h2><div class="view-switch" role="group" aria-label="项目呈现方式"><button type="button" data-view-mode="cards" aria-label="卡片视图" aria-pressed="${viewMode==='cards'}">${icon('cards')}</button><button type="button" data-view-mode="grid" aria-label="方块视图" aria-pressed="${viewMode==='grid'}">${icon('grid')}</button></div></div>
    <main class="project-list" aria-label="项目列表"></main>
    <nav class="bottom-nav" aria-label="模式切换"><button type="button" data-camera-global aria-label="相机">${icon('camera')}</button><button type="button" class="active" aria-label="项目" aria-current="page">${icon('projects',{filled:true})}</button></nav>
    <div class="detail-view" data-detail-view hidden>
      <button class="detail-backdrop" type="button" data-close-detail aria-label="关闭项目详情"></button>
      <section class="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <div class="detail-grabber" aria-hidden="true"></div>
        <header><div><span>项目详情</span><h2 id="detail-title"></h2></div><button type="button" data-close-detail aria-label="关闭项目详情">${icon('close')}</button></header>
        <div class="detail-hero"></div>
        <footer><div><strong data-detail-count></strong><span>记录次数</span></div><div><strong data-detail-days></strong><span>已经过</span></div><button type="button" data-enter-timeline>时间回看 ${icon('arrow')}</button></footer>
      </section>
    </div>
  </div>`;
  renderProjectList();
}

function hydrateImage(image){
  if(!image||image.dataset.hydrated)return;
  const card=image.closest('[data-project-card]');
  const project=card?.dataset.projectCard===productExample.id?productExample:projects.find(item=>String(item.id)===String(card?.dataset.projectCard));
  const row=image.dataset.stackImage!==undefined?stackedRows(project?.records)[Number(image.dataset.stackImage)]:previewRows(project?.records)[Number(image.dataset.previewImage)];
  if(!project||!row)return;
  image.src=row.src||fallbackFor(project);
  image.dataset.hydrated='true';
}

function hydrateTrackWindow(track){
  const left=track.scrollLeft-40;
  const right=track.scrollLeft+track.clientWidth+80;
  track.querySelectorAll('[data-preview-image]').forEach(image=>{
    const cell=image.closest('.photo-cell');
    if(cell.offsetLeft+cell.offsetWidth>=left&&cell.offsetLeft<=right)hydrateImage(image);
  });
}

function prepareImageLoading(){
  if(palettePreview)return;
  const list=document.querySelector('.project-list');
  imageObserver?.disconnect();
  imageObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const track=entry.target.querySelector('.preview-track');
        if(track)hydrateTrackWindow(track);
        else entry.target.querySelectorAll('[data-stack-image]').forEach(hydrateImage);
        return;
      }
      if(Number(entry.target.dataset.cardIndex)<2)return;
      entry.target.querySelectorAll('[data-hydrated]').forEach(image=>{
        image.removeAttribute('src');
        delete image.dataset.hydrated;
      });
    });
  },{root:list,rootMargin:'180px 0px'});
  document.querySelectorAll('[data-project-card]').forEach(card=>imageObserver.observe(card));
}

let toastTimer;
function showToast(message){
  const toast=document.querySelector('#demo-toast');
  toast.textContent=message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('visible'),1400);
}

function openProject(id){
  if(id===productExample.id&&productAction('demo'))return;
  if(productAction('open',id))return;
  const project=projects.find(item=>String(item.id)===String(id));
  if(!project)return;
  const rows=ordered(project.records||[]);
  const latest=rows.at(-1);
  const detail=document.querySelector('[data-detail-view]');
  const title=detail.querySelector('#detail-title');
  const hero=detail.querySelector('.detail-hero');
  title.textContent=project.name;
  const stats=projectStats(project);
  detail.querySelector('[data-detail-count]').textContent=stats.count;
  detail.querySelector('[data-detail-days]').textContent=`${stats.days} 天`;
  hero.innerHTML=latest
    ?`<img src="${esc(latest.src||fallbackFor(project))}"${photoAttrs(latest)} alt="${esc(project.name)}最近一次记录，${esc(dateLabel(latest.date))}"><div><span>最近一次</span><strong>${esc(dateLabel(latest.date))}</strong></div>`
    :`<div class="detail-empty">${icon('camera')}<strong>还没有照片</strong><span>拍下第一张，开始看见变化</span></div>`;
  detail.hidden=false;
  requestAnimationFrame(()=>detail.classList.add('is-open'));
  detail.querySelector('[data-close-detail]')?.focus({preventScroll:true});
}

function closeProject(){
  const detail=document.querySelector('[data-detail-view]');
  if(!detail||detail.hidden)return;
  detail.classList.remove('is-open');
  setTimeout(()=>{detail.hidden=true;},180);
}

let gesture=null;
const skipOpenUntil=new WeakMap();
function finishGesture(event){
  if(!gesture||event.pointerId!==gesture.pointerId)return;
  const {card,track,dragged,scroll,pointerId}=gesture;
  if(dragged||Math.abs((track?.scrollLeft||0)-scroll)>4){
    skipOpenUntil.set(card,performance.now()+500);
  }
  gesture=null;
  track?.classList.remove('is-dragging');
  if(track?.hasPointerCapture(pointerId))track.releasePointerCapture(pointerId);
}
document.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
  const track=event.target.closest('.preview-track');
  const card=event.target.closest('[data-project-card]');
  if(!card||event.target.closest('button:not(.summary-media)'))return;
  skipOpenUntil.delete(card);
  gesture={card,track,x:event.clientX,y:event.clientY,scroll:track?.scrollLeft||0,dragged:false,direction:null,pointerId:event.pointerId,mouse:event.pointerType==='mouse'};
});
document.addEventListener('pointermove',event=>{
  if(!gesture||event.pointerId!==gesture.pointerId)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(Math.hypot(dx,dy)>=10)gesture.dragged=true;
  if(!gesture.direction&&gesture.dragged){
    if(Math.abs(dx)>=Math.abs(dy)*1.25)gesture.direction='x';
    else if(Math.abs(dy)>=Math.abs(dx)*1.25)gesture.direction='y';
  }
  // Touch/pen keep native scrolling, momentum and pinch zoom. Only mouse needs dragging.
  if(gesture.mouse&&gesture.direction==='x'&&gesture.track&&gesture.track.scrollWidth>gesture.track.clientWidth){
    gesture.track.classList.add('is-dragging');
    gesture.track.setPointerCapture(gesture.pointerId);
    event.preventDefault();
    gesture.track.scrollLeft=gesture.scroll-dx;
  }
});
document.addEventListener('pointerup',finishGesture);
document.addEventListener('pointercancel',finishGesture);
document.addEventListener('lostpointercapture',finishGesture);

document.addEventListener('scroll',event=>{
  const track=event.target.closest?.('.preview-track');
  if(!track)return;
  const card=track.closest('[data-project-card]');
  hydrateTrackWindow(track);
  scrollPositions.set(card.dataset.projectCard,track.scrollLeft);
},true);

document.addEventListener('click',event=>{
  const viewButton=event.target.closest('[data-view-mode]');
  if(viewButton)return switchView(viewButton.dataset.viewMode);
  if(event.target.closest('[data-close-detail]'))return closeProject();
  if(event.target.closest('[data-enter-timeline]'))return showToast('进入项目时间回看');
  if(event.target.closest('[data-search]')){
    const sheet=document.querySelector('.search-sheet');sheet.hidden=false;requestAnimationFrame(()=>sheet.querySelector('input')?.focus());return;
  }
  if(event.target.closest('[data-close-search]')){document.querySelector('.search-sheet').hidden=true;return;}
  if(event.target.closest('[data-new-project]')){if(productAction('create'))return;return showToast('新建变化项目');}
  if(event.target.closest('[data-product-import]'))return productAction('quick-import');
  if(event.target.closest('[data-product-sample]'))return productAction('demo');
  const add=event.target.closest('[data-add-photo]');
  if(add){if(productAction('capture',add.dataset.addPhoto))return;return showToast('进入拍摄或导入');}
  if(event.target.closest('[data-camera-global]')){if(productAction('quick-capture'))return;return showToast('选择项目后开始拍摄');}
  const opener=event.target.closest('[data-open-project]');
  if(opener){
    if(performance.now()<(skipOpenUntil.get(opener.closest('[data-project-card]'))||0))return;
    return openProject(opener.dataset.openProject);
  }
  const card=event.target.closest('[data-project-card]');
  if(card&&performance.now()>=(skipOpenUntil.get(card)||0))return openProject(card.dataset.projectCard);
});

document.addEventListener('input',event=>{
  if(!event.target.matches('.search-sheet input'))return;
  filterProjects();
});

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!document.querySelector('[data-detail-view]')?.hidden){closeProject();return;}
  const track=event.target.closest('.preview-track');
  if(!track||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const cells=[...track.querySelectorAll('.photo-cell')];
  if(!cells.length)return;
  const current=cells.reduce((best,cell,index)=>Math.abs(cell.offsetLeft-track.scrollLeft)<Math.abs(cells[best].offsetLeft-track.scrollLeft)?index:best,0);
  const next=event.key==='Home'?0:event.key==='End'?cells.length-1:Math.max(0,Math.min(cells.length-1,current+(event.key==='ArrowRight'?1:-1)));
  track.scrollTo({left:cells[next].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});

render(await loadProjects());
