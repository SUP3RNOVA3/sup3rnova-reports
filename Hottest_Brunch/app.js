let creators = [
  {name:'Valeria Cruz',handle:'@valeriacruz',initials:'VC',followers:'186K',content:14,er:'6.8%',emv:'$18.4K',photo:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80'},
  {name:'Marco Rivera',handle:'@marcoriv',initials:'MR',followers:'94.2K',content:9,er:'5.4%',emv:'$12.1K',photo:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80'},
  {name:'Nina Santiago',handle:'@ninawanders',initials:'NS',followers:'72.8K',content:11,er:'7.1%',emv:'$10.8K',photo:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80'},
  {name:'Diego Torres',handle:'@diegocreates',initials:'DT',followers:'51.6K',content:7,er:'4.9%',emv:'$7.6K',photo:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=180&q=80'},
  {name:'Ana Sofía',handle:'@anasofia.pr',initials:'AS',followers:'43.1K',content:6,er:'6.2%',emv:'$6.9K',photo:'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=180&q=80'}
];

let media = [
  {id:'p-01',user:'@valeriacruz',platform:'instagram',type:'REEL',status:'relevant',caption:'Brunch got a little hotter 🌶️🍸 #AbsolutTabasco',likes:'24.8K',comments:'486',views:'418K',photo:creators[0].photo,bg:'linear-gradient(145deg,rgba(4,10,28,.15),rgba(244,47,37,.35)),url(https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=85)'},
  {id:'p-02',user:'@ninawanders',platform:'instagram',type:'CAROUSEL',status:'relevant',caption:'A spicy afternoon with the best people in San Juan.',likes:'18.2K',comments:'312',views:'204K',photo:creators[2].photo,bg:'linear-gradient(145deg,rgba(35,76,255,.08),rgba(239,59,45,.35)),url(https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=700&q=85)'},
  {id:'p-03',user:'@marcoriv',platform:'tiktok',type:'TIKTOK',status:'relevant',caption:'POV: you found the hottest brunch in PR.',likes:'31.5K',comments:'744',views:'612K',photo:creators[1].photo,bg:'linear-gradient(145deg,rgba(10,13,24,.12),rgba(35,76,255,.4)),url(https://images.unsplash.com/photo-1529604278261-8bfcdb00a7b9?auto=format&fit=crop&w=700&q=85)'},
  {id:'p-04',user:'@anasofia.pr',platform:'instagram',type:'STORY',status:'pending',caption:'The cocktail pairing we did not know we needed.',likes:'N/A',comments:'N/A',views:'32.1K',photo:creators[4].photo,bg:'linear-gradient(145deg,rgba(239,59,45,.12),rgba(9,13,25,.5)),url(https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=85)'},
  {id:'p-05',user:'@diegocreates',platform:'instagram',type:'REEL',status:'relevant',caption:'A visual recap from VINE. Heat, color and community.',likes:'11.7K',comments:'208',views:'176K',photo:creators[3].photo,bg:'linear-gradient(145deg,rgba(35,76,255,.15),rgba(239,59,45,.3)),url(https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85)'},
  {id:'p-06',user:'@ninawanders',platform:'tiktok',type:'TIKTOK',status:'pending',caption:'Fit check before brunch. Wait for the drink reveal.',likes:'8.4K',comments:'193',views:'129K',photo:creators[2].photo,bg:'linear-gradient(145deg,rgba(9,13,25,.15),rgba(35,76,255,.4)),url(https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85)'},
  {id:'p-07',user:'@valeriacruz',platform:'instagram',type:'STORY',status:'pending',caption:'Live from The Hottest Brunch.',likes:'N/A',comments:'N/A',views:'41.8K',photo:creators[0].photo,bg:'linear-gradient(145deg,rgba(239,59,45,.14),rgba(15,20,40,.42)),url(https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=700&q=85)'},
  {id:'p-08',user:'@marcoriv',platform:'instagram',type:'POST',status:'pending',caption:'Weekend color study from Old San Juan.',likes:'5.2K',comments:'92',views:'N/A',photo:creators[1].photo,bg:'linear-gradient(145deg,rgba(35,76,255,.1),rgba(239,59,45,.2)),url(https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=700&q=85)'}
];

const isAdmin = window.location.pathname.toLowerCase().includes('/admin');
const navItems = document.querySelectorAll('.nav-item');
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
  navItems.forEach(n=>n.classList.toggle('active',n.dataset.view===name));
  window.scrollTo({top:0,behavior:'smooth'});
  document.querySelector('.sidebar').classList.remove('open');
}
navItems.forEach(item=>item.addEventListener('click',()=>{
  if(item.dataset.view==='review'&&!isAdmin){window.location.href='/Hottest_Brunch/admin/';return}
  showView(item.dataset.view)
}));
document.querySelectorAll('[data-jump]').forEach(item=>item.addEventListener('click',()=>showView(item.dataset.jump)));
document.querySelector('.menu-toggle').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));

function avatarStyle(photo){return `background-image:url('${photo}')`}
function renderCreatorCards(){document.getElementById('creatorStrip').innerHTML=creators.slice(0,4).map(c=>`<article class="creator-card"><div class="creator-avatar" style="${avatarStyle(c.photo)}"></div><div><h4>${c.name}</h4><p>${c.handle}</p><span class="er-pill">${c.er} ER</span></div><div class="creator-metrics"><div><span>FOLLOWERS</span><b>${c.followers}</b></div><div><span>CONTENT</span><b>${c.content}</b></div><div><span>VISIBLE ENG.</span><b>${c.engagements||'N/A'}</b></div></div></article>`).join('')}
renderCreatorCards();

function mediaElement(item){return item.assetKind==='video'&&item.assetUrl?`<video src="${item.assetUrl}" muted playsinline preload="none"></video>`:''}
function socialCard(item){return `<article class="social-card"><div class="social-head"><div class="mini-avatar" style="${avatarStyle(item.photo)}"></div><div><strong>${item.user}</strong><small>San Juan, Puerto Rico</small></div><b>•••</b></div><div class="social-media" style="background-image:${item.bg}">${mediaElement(item)}<span class="media-label">${item.type}</span>${item.type==='REEL'||item.type==='TIKTOK'||item.assetKind==='video'?'<span class="reel-play">▶</span>':''}</div><div class="social-actions"><div class="social-icons"><span>♡</span><span>◯</span><span>⌁</span><span>▢</span></div><p><strong>${item.likes} likes</strong><br>${item.caption||'Captured campaign content'}</p><small>${item.views} views · Live dataset</small></div></article>`}
function renderSocial(){document.getElementById('socialShowcase').innerHTML=media.slice(0,3).map(socialCard).join('')}
renderSocial();

function libraryCard(item){return `<article class="library-card" data-platform="${item.platform}" data-status="${item.status}" data-search="${item.user.toLowerCase()} ${(item.caption||'').toLowerCase()}"><div class="library-media" style="background-image:${item.bg}">${mediaElement(item)}<span class="platform-badge">${item.type}</span><span class="status-badge ${item.status}">${item.status.toUpperCase()}</span></div><div class="library-body"><div class="library-user"><strong>${item.user}</strong><span>${item.date||'AUG 02'}</span></div><p>${item.caption||'Captured campaign content'}</p><div class="library-metrics"><span>♡ ${item.likes}</span><span>◯ ${item.comments}</span><span>▷ ${item.views}</span></div></div></article>`}
const contentGrid=document.getElementById('contentGrid');
function renderContent(){contentGrid.innerHTML=media.map(libraryCard).join('')}
renderContent();
function filterContent(){
  const term=document.getElementById('contentSearch').value.toLowerCase();
  const active=document.querySelector('.filter-chips button.active').dataset.filter;
  contentGrid.querySelectorAll('.library-card').forEach(card=>{const filterMatch=active==='all'||card.dataset.platform===active||card.dataset.status===active;card.style.display=filterMatch&&card.dataset.search.includes(term)?'':'none'});
}
document.getElementById('contentSearch').addEventListener('input',filterContent);
document.querySelectorAll('.filter-chips button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter-chips button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');filterContent()}));

function renderCreatorRows(){document.getElementById('creatorRows').innerHTML=creators.map(c=>`<div class="creator-row"><div class="creator-ident"><div class="creator-avatar" style="${avatarStyle(c.photo)}"></div><div><strong>${c.name}</strong><span>${c.handle} · Instagram</span></div></div><span><b>${c.followers}</b><small>latest snapshot</small></span><span><b>${c.content}</b><small>qualified pieces</small></span><span><b class="er-pill">${c.er}</b><small>audience ER</small></span><span><b>${c.engagements||'N/A'}</b><small>visible engagements</small></span></div>`).join('')}
renderCreatorRows();

const savedReviews=JSON.parse(localStorage.getItem('hottestBrunchReviews')||'{}');
function reviewItem(item,index){const decision=savedReviews[item.id]||item.decision;return `<article class="review-item ${decision&&decision!=='pending'?'reviewed':''}" data-id="${item.id}"><div class="review-thumb" style="background-image:${item.bg}">${mediaElement(item)}</div><div class="review-info"><div class="review-meta"><strong>${item.user}</strong><span>${item.type}</span><span class="confidence">${decision||'pending'}</span></div><h3>${index%2?'Possible event reference detected':'Campaign visual or venue signal detected'}</h3><p>${item.caption||'Captured campaign content'}</p></div><div class="review-actions"><button class="approve ${decision==='relevant'?'selected':''}" title="Relevant" data-decision="relevant">✓</button><button class="maybe ${decision==='maybe'?'selected':''}" title="Maybe" data-decision="maybe">?</button><button class="discard ${decision==='discarded'?'selected':''}" title="Discard" data-decision="discarded">×</button></div></article>`}
let reviewItems=media.map((m,i)=>({...m,status:'pending',id:`review-${i+1}`}));
const reviewList=document.getElementById('reviewList');
function renderReviews(){
  reviewList.innerHTML=reviewItems.map(reviewItem).join('');
  const reviewed=reviewItems.filter(item=>(savedReviews[item.id]||item.decision)!=='pending').length;
  const pending=reviewItems.filter(item=>(savedReviews[item.id]||item.decision)==='pending').length;
  document.getElementById('reviewedCount').textContent=reviewed;
  document.getElementById('pendingCount').textContent=pending;
  document.getElementById('navPending').textContent=pending;
  reviewList.querySelectorAll('[data-decision]').forEach(btn=>btn.addEventListener('click',async()=>{
    const item=btn.closest('.review-item');
    try{
      if(isAdmin){
        const response=await fetch('/Hottest_Brunch/admin/api/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentId:item.dataset.id,decision:btn.dataset.decision})});
        if(!response.ok)throw new Error('Review could not be saved');
        const target=reviewItems.find(entry=>entry.id===item.dataset.id);if(target)target.decision=btn.dataset.decision;
      }else{savedReviews[item.dataset.id]=btn.dataset.decision;localStorage.setItem('hottestBrunchReviews',JSON.stringify(savedReviews))}
      renderReviews();showToast(`Marked ${btn.dataset.decision}. Decision saved.`)
    }catch(error){showToast(error.message)}
  }));
}
renderReviews();
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.remove('show'),2300)}

function compactNumber(value){const n=Number(value||0);if(n>=1000000)return (n/1000000).toFixed(n>=10000000?1:2).replace(/\.0+$/,'')+'M';if(n>=1000)return (n/1000).toFixed(n>=100000?0:1).replace(/\.0$/,'')+'K';return n.toLocaleString('en-US')}
function mediaUrl(key){return key?'/media/'+String(key).split('/').map(encodeURIComponent).join('/'):''}
function mapBackendContent(item){
  const assetUrl=mediaUrl(item.assetKey);const isImage=item.assetKind==='image';
  return {id:item.id,user:'@'+(item.handle||'unknown'),platform:item.platform,type:String(item.sourceType||'post').toUpperCase(),status:item.decision||'pending',decision:item.decision||'pending',caption:item.caption||'',likes:item.likes==null?'N/A':compactNumber(item.likes),comments:item.comments==null?'N/A':compactNumber(item.comments),views:item.views==null?'N/A':compactNumber(item.views),photo:mediaUrl(item.profileStorageKey),assetUrl,assetKind:item.assetKind,bg:isImage&&assetUrl?`linear-gradient(145deg,rgba(9,13,25,.08),rgba(35,76,255,.12)),url("${assetUrl}")`:'linear-gradient(145deg,#17214a,#ef3b2d)',date:item.publishedAt?new Date(item.publishedAt).toLocaleDateString('en-US',{month:'short',day:'2-digit'}).toUpperCase():'N/A'}
}
function calculateEmv(items,benchmarks){return items.reduce((total,item)=>{if(item.decision!=='relevant'||!item.views)return total;const format=item.platform==='tiktok'?'tiktok':item.sourceType;const benchmark=benchmarks.find(b=>b.platform===item.platform&&b.format===format);return total+(benchmark?Number(item.views)/1000*Number(benchmark.value)*Number(benchmark.multiplier):0)},0)}
async function loadBackend(){
  try{
    const endpoint=isAdmin?'/Hottest_Brunch/admin/api/data':'/api/report/hottest-brunch';
    const response=await fetch(endpoint,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Live dataset unavailable');
    const payload=await response.json();const summary=payload.summary||{};const rawContent=payload.content||[];
    creators=(payload.creators||[]).map(c=>({name:c.displayName||c.handle,handle:'@'+c.handle,followers:compactNumber(c.followers),content:Number(c.content||0),er:c.engagementRate==null?'N/A':Number(c.engagementRate).toFixed(2)+'%',engagements:compactNumber(c.engagements),photo:mediaUrl(c.profileStorageKey)}));
    media=rawContent.map(mapBackendContent);reviewItems=media;
    document.getElementById('dataStatus').textContent='LIVE DATA';document.getElementById('kpiReach').textContent=compactNumber(summary.potentialAudience);document.getElementById('kpiViews').textContent=compactNumber(summary.views);document.getElementById('kpiEngagements').textContent=compactNumber(summary.engagements);document.getElementById('kpiEr').textContent=summary.views?((Number(summary.engagements)/Number(summary.views))*100).toFixed(2)+'%':'N/A';document.getElementById('kpiEmv').textContent='$'+compactNumber(calculateEmv(rawContent,payload.benchmarks||[]));
    document.getElementById('totalPieces').textContent=summary.totalScraped||0;document.getElementById('storyCount').textContent=summary.typeCounts?.story||0;document.getElementById('postCount').textContent=(summary.typeCounts?.post||0)+(summary.typeCounts?.reel||0);document.getElementById('tiktokCount').textContent=summary.typeCounts?.tiktok||0;document.getElementById('qualifiedCount').textContent=summary.qualified||0;document.getElementById('qualifiedBar').style.width=((summary.qualified||0)/Math.max(1,summary.totalScraped||1)*100)+'%';document.getElementById('pendingLabel').textContent=(summary.pending||0)+' pending review';
    document.getElementById('statScraped').textContent=summary.totalScraped||0;document.getElementById('statRelevant').textContent=summary.qualified||0;document.getElementById('statDiscarded').textContent=summary.discarded||0;document.getElementById('statPending').textContent=summary.pending||0;
    renderCreatorCards();renderCreatorRows();renderSocial();renderContent();renderReviews();
    if(isAdmin)showView('review');
  }catch(error){document.getElementById('dataStatus').textContent='OFFLINE PREVIEW';showToast(error.message)}
}
loadBackend();
