const statusBox=document.getElementById('status');
const map=L.map('map',{zoomControl:true}).setView([31.05,46.26],11); // Initial view: Nasiriyah, Iraq
const layers={
 street:L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}),
 satellite:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri'}),
 dark:L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19,attribution:'© OpenStreetMap © CARTO'})
};
layers.street.addTo(map);
let selected=null,userMarker=null,routeLine=null;
function setStatus(t){statusBox.textContent=t}
document.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>{
 Object.values(layers).forEach(l=>map.removeLayer(l)); layers[b.dataset.layer].addTo(map);
 document.querySelectorAll('[data-layer]').forEach(x=>x.classList.toggle('active',x===b));
}));
map.on('click',e=>{selected=e.latlng;if(routeLine){map.removeLayer(routeLine);routeLine=null}
 if(window.destMarker)map.removeLayer(window.destMarker);
 window.destMarker=L.marker(selected).addTo(map).bindPopup('النقطة المختارة').openPopup();
 setStatus(`النقطة: ${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`)});
document.getElementById('locate').addEventListener('click',()=>{
 if(!navigator.geolocation){setStatus('المتصفح لا يدعم تحديد الموقع');return}
 setStatus('جارٍ تحديد موقعك...');navigator.geolocation.getCurrentPosition(p=>{
 const ll=[p.coords.latitude,p.coords.longitude];map.setView(ll,16);
 if(userMarker)map.removeLayer(userMarker);userMarker=L.marker(ll).addTo(map).bindPopup('موقعك الحالي').openPopup();
 setStatus('تم تحديد موقعك. قد يطلب الهاتف إذن الموقع.');
 },e=>setStatus('تعذر تحديد الموقع. فعّل GPS واسمح للتطبيق بالوصول للموقع.'),{enableHighAccuracy:true,timeout:15000});
});
async function searchPlace(){
 const q=document.getElementById('query').value.trim();if(!q)return setStatus('اكتب اسم مكان للبحث');
 setStatus('جارٍ البحث عن المكان...');
 try{
 const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q='+encodeURIComponent(q);
 const r=await fetch(url,{headers:{'Accept-Language':'ar'}});if(!r.ok)throw Error();
 const d=await r.json();if(!d.length)return setStatus('لم يتم العثور على المكان');
 const p=d[0],ll=[Number(p.lat),Number(p.lon)];map.setView(ll,15);
 if(window.destMarker)map.removeLayer(window.destMarker);window.destMarker=L.marker(ll).addTo(map).bindPopup(p.display_name).openPopup();
 selected={lat:ll[0],lng:ll[1]};setStatus(p.display_name);
 }catch(e){setStatus('فشل البحث. تحقق من اتصال الإنترنت وحاول مجدداً.')}
}
document.getElementById('searchBtn').addEventListener('click',searchPlace);
document.getElementById('query').addEventListener('keydown',e=>{if(e.key==='Enter')searchPlace()});
document.getElementById('routeBtn').addEventListener('click',()=>{
 if(!selected)return setStatus('ابحث عن وجهة أو اضغط على الخريطة أولاً');
 const dest=`${selected.lat},${selected.lng}`;
 if(navigator.geolocation){navigator.geolocation.getCurrentPosition(p=>{
 const origin=`${p.coords.latitude},${p.coords.longitude}`;
 window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&travelmode=driving`,'_blank');
 },()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`,'_blank'))}
 else window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`,'_blank');
});
