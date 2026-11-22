const C='pb-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(C).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r)));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():self.clients.openWindow('./')));
});
self.addEventListener('periodicsync',e=>{if(e.tag==='reminders')e.waitUntil(check())});
async function check(){
  const c=await caches.open('pb-data'),r=await c.match('reminders');if(!r)return;
  const d=await r.json(),now=new Date(),mins=now.getHours()*60+now.getMinutes();
  const key=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  let ch=false;
  for(const h of d.habits){
    if(!h.remind||!h.time||h.last===key)continue;
    const [a,b]=h.time.split(':').map(Number);
    if(mins<a*60+b)continue;
    h.last=key;ch=true;
    const days=Math.floor((Date.now()-h.start)/864e5);
    await self.registration.showNotification(h.icon+' Напоминание: «'+h.name+'»',{body:days+' дн. без привычки. Не сдавайтесь!',icon:'icon-192.png',badge:'icon-192.png',tag:'rem-'+h.id});
  }
  if(ch)await c.put('reminders',new Response(JSON.stringify(d)));
}
