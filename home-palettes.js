export const palettes=[
  {id:'acid',name:'黑曜酸橙',tag:'克制 · 锋芒',note:'深色收住界面，酸橙色只点亮操作。',colors:['#101414','#1D2422','#F0F4EC','#C5F45D'],tokens:{'bg-top':'#101414','bg-bottom':'#101414',ink:'#F0F4EC',muted:'#A7B1AA',card:'#1D2422',tint:'#2A3430','tint-deep':'#333E38',accent:'#C5F45D','accent-ink':'#17200D','accent-soft':'#C5F45D14','photo-frame':'#37413B',line:'#3A443E',outside:'#080B09','shell-bg':'linear-gradient(160deg,#101414,#162019)','icon-cutout':'#101414'}},
  {id:'ice',name:'深海冰蓝',tag:'清冷 · 轻科技',note:'蓝黑底色与冰蓝强调，照片显得更温暖。',colors:['#081923','#142C39','#EAF5FA','#80E5F5'],tokens:{'bg-top':'#081923','bg-bottom':'#081923',ink:'#EAF5FA',muted:'#A2BAC7',card:'#142C39',tint:'#213D4C','tint-deep':'#2C4D60',accent:'#80E5F5','accent-ink':'#0B2731','accent-soft':'#80E5F516','photo-frame':'#3F5B69',line:'#355365',outside:'#050F15','shell-bg':'linear-gradient(160deg,#081923,#122B3A)','icon-cutout':'#081923'}},
  {id:'cobalt',name:'电光钴蓝',tag:'鲜明 · 大胆',note:'钴蓝建立强识别，浅柠檬黄给一点俏皮。',colors:['#2442DF','#1B35BD','#F4F6FF','#E6FB82'],tokens:{'bg-top':'#2442DF','bg-bottom':'#2442DF',ink:'#F4F6FF',muted:'#CBD4FF',card:'#1B35BD',tint:'#334FCB','tint-deep':'#405BD2',accent:'#E6FB82','accent-ink':'#1D2B0B','accent-soft':'#E6FB821C','photo-frame':'#7993F0',line:'#6881E9',outside:'#1B2EB0','shell-bg':'linear-gradient(165deg,#2442DF,#264CEB)','icon-cutout':'#2442DF'}},
  {id:'silver',name:'银白电紫',tag:'通透 · 利落',note:'冷银灰与清晰黑字，电紫只占很小面积。',colors:['#ECEEF2','#FAFBFD','#211F2C','#6746E8'],tokens:{'bg-top':'#ECEEF2','bg-bottom':'#ECEEF2',ink:'#211F2C',muted:'#676577',card:'#FAFBFD',tint:'#E3E4EB','tint-deep':'#DADCED',accent:'#6746E8','accent-ink':'#FFFFFF','accent-soft':'#6746E80E','photo-frame':'#FFFFFF',line:'#D5D6E1',outside:'#E3E5EB','shell-bg':'linear-gradient(165deg,#ECEEF2,#E5E6EE)','icon-cutout':'#ECEEF2'}}
];
export function applyPalette(){
  const palette=palettes.find(item=>item.id===new URLSearchParams(location.search).get('palette'));
  if(!palette)return;
  document.documentElement.dataset.palette=palette.id;
  for(const [key,value] of Object.entries(palette.tokens))document.documentElement.style.setProperty(`--${key}`,value);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',palette.tokens['bg-top']);
}
