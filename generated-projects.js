// Synthetic records for the product demo; original user storage is separate.
export function generatedProjects(){
  const dates=['2026-09-01T09:00','2026-09-12T09:00','2026-09-27T09:00'];
  return [
    {id:'generated-skin-v1',name:'我的皮肤记录',type:'skin',generated:true,created:dates[0],records:dates.map((date,i)=>({id:`generated-skin-${i+1}`,date,src:`assets/generated-projects/skin-0${i+1}.jpg`,note:''}))},
    {id:'generated-plant-v1',name:'窗台上的橡皮树',type:'other',generated:true,created:dates[0],records:dates.map((date,i)=>({id:`generated-plant-${i+1}`,date,src:`assets/generated-projects/plant-0${i+1}.jpg`,note:''}))}
  ];
}

// Upgrade only bundled example URLs. Keep user photos, dates and edits intact.
export function refreshGeneratedPhotoSources(projects){
  return projects.map(project=>project.generated?{
    ...project,
    records:(project.records||[]).map(record=>({
      ...record,
      src:typeof record.src==='string'?record.src.replace(/^assets\/generated-projects\/(skin|plant)-0([1-3])\.png$/, 'assets/generated-projects/$1-0$2.jpg'):record.src
    }))
  }:project);
}
