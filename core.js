export const ordered = records => [...records].sort((a,b)=>new Date(a.date)-new Date(b.date));
export const dayGap = (a,b) => Math.max(0, Math.round((Date.UTC(new Date(b).getFullYear(),new Date(b).getMonth(),new Date(b).getDate())-Date.UTC(new Date(a).getFullYear(),new Date(a).getMonth(),new Date(a).getDate()))/86400000));
export const localDateTime = (d=new Date()) => new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,19);
export function validDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value))return false;
 const [year,month,day,hour,minute,second=0]=value.split(/[-T:]/).map(Number),d=new Date(value);
 return year>=1900&&d.getFullYear()===year&&d.getMonth()+1===month&&d.getDate()===day&&d.getHours()===hour&&d.getMinutes()===minute&&d.getSeconds()===second&&d.getTime()<=Date.now()+1000;
}
export function exifDate(buffer){
 try {const v=new DataView(buffer); if(v.getUint16(0)!==0xffd8)return null; let at=2;
 while(at+4<v.byteLength){if(v.getUint8(at)!==255)break;const marker=v.getUint8(at+1),len=v.getUint16(at+2);if(len<2||at+2+len>v.byteLength)break;
 if(marker===0xe1&&v.getUint32(at+4)===0x45786966){const base=at+10,le=v.getUint16(base)===0x4949;const u16=p=>v.getUint16(p,le),u32=p=>v.getUint32(p,le);if(u16(base+2)!==42)return null;
 const scan=(offset,depth=0)=>{if(depth>2)return null;const p=base+offset,n=u16(p);let fallback=null;for(let i=0;i<n;i++){const e=p+2+i*12,tag=u16(e),count=u32(e+4),val=u32(e+8);if(tag===0x8769){const found=scan(val,depth+1);if(found)return found;}if([0x9003,0x9004,0x132].includes(tag)&&count>=19){const pos=count<=4?e+8:base+val;let text='';for(let j=0;j<19;j++)text+=String.fromCharCode(v.getUint8(pos+j));const date=text.replace(/^(\d{4}):(\d{2}):(\d{2}) /,'$1-$2-$3T');if(validDate(date)){if(tag===0x9003)return date.slice(0,19);fallback=date.slice(0,19);}}}return fallback;};return scan(u32(base+4));}at+=2+len;}
 }catch{}return null;
}
