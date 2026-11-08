// Synthetic records for the product demo; original user storage is separate.
export function generatedProjects(){
  const dates=['2026-09-01T09:00','2026-09-12T09:00','2026-09-27T09:00'];
  return [
    {id:'generated-skin-v1',name:'我的皮肤记录',type:'skin',generated:true,created:dates[0],records:dates.map((date,i)=>({id:`generated-skin-${i+1}`,date,src:`assets/generated-projects/skin-0${i+1}.png`,note:''}))},
    {id:'generated-plant-v1',name:'窗台上的橡皮树',type:'other',generated:true,created:dates[0],records:dates.map((date,i)=>({id:`generated-plant-${i+1}`,date,src:`assets/generated-projects/plant-0${i+1}.png`,note:''}))}
  ];
}
