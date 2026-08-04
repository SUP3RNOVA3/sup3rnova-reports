let creators = [];
let media = [];

const isAdmin = window.location.pathname.toLowerCase().includes('/admin');
const navItems = document.querySelectorAll('.nav-item');
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
  navItems.forEach(n=>n.classList.toggle('active',n.dataset.view===name));
  window.scrollTo({top:0,behavior:'auto'});
  document.querySelector('.sidebar').classList.remove('open');
  if(media.length)hydrateView(name);
}
function hydrateView(name){
  if(name==='overview'){renderCreatorCards();renderSocial()}
  if(name==='deck')renderCreatorDeck();
  if(name==='content')renderContent();
  if(name==='creators')renderCreatorRows();
  if(name==='review')renderReviews();
}
navItems.forEach(item=>item.addEventListener('click',()=>{
  if(item.dataset.view==='review'&&!isAdmin){window.location.href='/Hottest_Brunch/admin/';return}
  showView(item.dataset.view)
}));
document.querySelectorAll('[data-jump]').forEach(item=>item.addEventListener('click',()=>showView(item.dataset.jump)));
document.querySelector('.menu-toggle').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));

function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}
function safeExternalUrl(value){try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:''}catch{return ''}}
function avatarStyle(photo){return photo?`background-image:url('${encodeURI(photo).replace(/'/g,'%27')}')`:'background-image:linear-gradient(145deg,#dfe4ef,#aeb8ce)'}
function renderCreatorCards(){document.getElementById('creatorStrip').innerHTML=creators.slice(0,4).map(c=>`<article class="creator-card"><div class="creator-avatar" style="${avatarStyle(c.photo)}"></div><div><h4>${escapeHtml(c.name)}</h4><p>${escapeHtml(c.handle)}</p><span class="er-pill">${c.er==='N/A'?'N/A':escapeHtml(c.er)+' ER'}</span></div><div class="creator-metrics"><div><span>FOLLOWERS</span><b>${escapeHtml(c.followers)}</b></div><div><span>CONTENT</span><b>${c.content}</b></div><div><span>VISIBLE ENG.</span><b>${escapeHtml(c.engagements||'N/A')}</b></div></div></article>`).join('')}
renderCreatorCards();

function thumbnailElement(item,className=''){return item.thumbnailUrl?`<img class="media-thumbnail ${className}" src="${escapeHtml(item.thumbnailUrl)}" loading="lazy" decoding="async" alt="${escapeHtml(item.type)} by ${escapeHtml(item.user)}">`:`<div class="media-placeholder ${className}"><span>${item.assetKind==='video'?'VIDEO':'MEDIA'}</span></div>`}
function bindThumbnailFallbacks(root){root.querySelectorAll('img.media-thumbnail').forEach(image=>{const fallback=()=>{const placeholder=document.createElement('div');placeholder.className='media-placeholder';placeholder.innerHTML='<span>PREVIEW UNAVAILABLE</span>';image.replaceWith(placeholder)};if(image.complete&&!image.naturalWidth)fallback();else image.addEventListener('error',fallback,{once:true})})}
function mediaElement(item){
  if(item.assetKind==='video'&&item.assetUrl)return `<video src="${escapeHtml(item.assetUrl)}" poster="${escapeHtml(item.thumbnailUrl)}" muted playsinline preload="metadata" controls></video>`;
  if(item.assetUrl)return `<img src="${escapeHtml(item.assetUrl)}" alt="${escapeHtml(item.type)} by ${escapeHtml(item.user)}">`;
  return '<div class="media-placeholder"><span>MEDIA UNAVAILABLE</span></div>'
}
function socialCard(item){return `<article class="social-card" data-open-media="${escapeHtml(item.id)}"><div class="social-head"><div class="mini-avatar" style="${avatarStyle(item.photo)}"></div><div><strong>${escapeHtml(item.user)}</strong><small>San Juan, Puerto Rico</small></div><b>•••</b></div><div class="social-media">${thumbnailElement(item)}<span class="media-label">${escapeHtml(item.type)}</span>${item.assetKind==='video'?'<span class="reel-play">▶</span>':''}</div><div class="social-actions"><div class="social-icons"><span>♡</span><span>◯</span><span>⌁</span><span>▢</span></div><p><strong>${escapeHtml(item.likes)} likes</strong><br>${escapeHtml(item.caption||'Captured campaign content')}</p><small>${escapeHtml(item.views)} views · Live dataset</small></div></article>`}
function renderSocial(){const root=document.getElementById('socialShowcase');root.innerHTML=media.slice(0,3).map(socialCard).join('');bindMediaOpeners(root)}
renderSocial();

function libraryCard(item){return `<article class="library-card" tabindex="0" data-open-media="${escapeHtml(item.id)}" data-platform="${escapeHtml(item.platform)}" data-status="${escapeHtml(item.status)}" data-search="${escapeHtml(item.user.toLowerCase()+' '+(item.caption||'').toLowerCase())}"><div class="library-media">${thumbnailElement(item)}<span class="platform-badge">${escapeHtml(item.type)}</span><span class="status-badge ${escapeHtml(item.status)}">${escapeHtml(item.status.toUpperCase())}</span>${item.assetKind==='video'?'<span class="thumbnail-play">▶</span>':''}</div><div class="library-body"><div class="library-user"><strong>${escapeHtml(item.user)}</strong><span>${escapeHtml(item.date||'AUG 02')}</span></div><p>${escapeHtml(item.caption||'Captured campaign content')}</p><div class="library-metrics"><span>♡ ${escapeHtml(item.likes)}</span><span>◯ ${escapeHtml(item.comments)}</span><span>▷ ${escapeHtml(item.views)}</span></div></div></article>`}
const contentGrid=document.getElementById('contentGrid');
function renderContent(){contentGrid.innerHTML=media.map(libraryCard).join('');bindMediaOpeners(contentGrid)}
renderContent();
function filterContent(){
  const term=document.getElementById('contentSearch').value.toLowerCase();
  const active=document.querySelector('.filter-chips button.active').dataset.filter;
  contentGrid.querySelectorAll('.library-card').forEach(card=>{const filterMatch=active==='all'||card.dataset.platform===active||card.dataset.status===active;card.style.display=filterMatch&&card.dataset.search.includes(term)?'':'none'});
}
document.getElementById('contentSearch').addEventListener('input',filterContent);
document.querySelectorAll('.filter-chips button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter-chips button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');filterContent()}));

function renderCreatorRows(){document.getElementById('creatorRows').innerHTML=creators.map(c=>`<div class="creator-row"><div class="creator-ident"><div class="creator-avatar" style="${avatarStyle(c.photo)}"></div><div><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.handle)} · Instagram</span></div></div><span><b>${escapeHtml(c.followers)}</b><small>latest snapshot</small></span><span><b>${c.content}</b><small>qualified pieces</small></span><span><b class="er-pill">${escapeHtml(c.er)}</b><small>audience ER</small></span><span><b>${escapeHtml(c.engagements||'N/A')}</b><small>visible engagements</small></span></div>`).join('')}
renderCreatorRows();

let activeDeckCreator=0;
function deckMediaCard(item,index){
  const platform=String(item.platform||'instagram').toLowerCase();
  const platformName=platform==='tiktok'?'TikTok':'Instagram';
  const platformIcon=platform==='tiktok'?'♪':'◎';
  const asset=item.assetKind==='video'&&item.assetUrl
    ?`<video src="${escapeHtml(item.assetUrl)}" poster="${escapeHtml(item.thumbnailUrl)}" muted playsinline preload="metadata" controls aria-label="Video by ${escapeHtml(item.user)}"></video>`
    :`<img class="deck-image" src="${escapeHtml(item.assetUrl)}" loading="lazy" decoding="async" alt="${escapeHtml(item.type)} by ${escapeHtml(item.user)}">`;
  return `<article class="deck-media-card platform-${platform}" data-open-media="${escapeHtml(item.id)}"><div class="deck-media-frame">${asset}<div class="deck-media-top"><div><span class="deck-media-index">${String(index+1).padStart(2,'0')}</span><span class="deck-platform ${platform}"><i>${platformIcon}</i>${platformName}</span></div><b>${escapeHtml(item.type)}</b></div></div><div class="deck-media-copy"><span>${platformName} · ${escapeHtml(item.date||'CAPTURED')}</span><p>${escapeHtml(item.caption||'Captured campaign content')}</p><div><b>${escapeHtml(item.views)}</b><small>views</small><b>${escapeHtml(item.likes)}</b><small>likes</small></div></div></article>`
}
function renderCreatorDeck(){
  const selector=document.getElementById('deckSelector');
  const deck=document.getElementById('creatorDeck');
  if(!selector||!deck)return;
  if(!creators.length){selector.innerHTML='';deck.innerHTML='<p>No qualified creator data is available.</p>';return}
  activeDeckCreator=Math.max(0,Math.min(activeDeckCreator,creators.length-1));
  selector.innerHTML=creators.map((creator,index)=>`<button class="deck-selector-item ${index===activeDeckCreator?'active':''}" data-deck-index="${index}"><span class="deck-selector-avatar" style="${avatarStyle(creator.photo)}"></span><span><b>${escapeHtml(creator.name)}</b><small>${escapeHtml(creator.handle)}</small></span></button>`).join('');
  const creator=creators[activeDeckCreator];
  const creatorMedia=media.filter(item=>item.user.toLowerCase()===creator.handle.toLowerCase());
  const videos=creatorMedia.filter(item=>item.assetKind==='video').length;
  const images=creatorMedia.filter(item=>item.assetKind==='image').length;
  const instagramCount=creatorMedia.filter(item=>item.platform==='instagram').length;
  const tiktokCount=creatorMedia.filter(item=>item.platform==='tiktok').length;
  const profilePlatform=tiktokCount&&instagramCount?'INSTAGRAM + TIKTOK':tiktokCount?'TIKTOK':'INSTAGRAM';
  const creatorProfileUrl=`https://instagram.com/${encodeURIComponent(creator.handle.replace('@',''))}`;
  deck.innerHTML=`<div class="deck-profile-panel"><div class="deck-slide-label">CREATOR SNAPSHOT <b>${String(activeDeckCreator+1).padStart(2,'0')}</b></div><div class="deck-profile-photo" style="${avatarStyle(creator.photo)}"><span>${profilePlatform}</span></div><div class="deck-profile-copy"><span>FEATURED CREATOR</span><h2>${escapeHtml(creator.name)}</h2><a href="${creatorProfileUrl}" target="_blank" rel="noreferrer">${escapeHtml(creator.handle)} ↗</a><p>Social creator with ${escapeHtml(creator.followers)} followers. This profile contributed ${creatorMedia.length} approved campaign piece${creatorMedia.length===1?'':'s'}.</p></div><div class="deck-profile-stats"><div><span>FOLLOWERS</span><strong>${escapeHtml(creator.followers)}</strong><small>latest snapshot</small></div><div><span>QUALIFIED CONTENT</span><strong>${creator.content}</strong><small>${videos} video · ${images} image</small></div><div><span>ENGAGEMENT RATE</span><strong>${escapeHtml(creator.er)}</strong><small>${creator.er==='N/A'?'not publicly available':'audience based'}</small></div><div><span>VISIBLE ENGAGEMENTS</span><strong>${escapeHtml(creator.engagements||'N/A')}</strong><small>approved media only</small></div></div><div class="deck-benchmark"><span>VALUE CONTEXT</span><strong>${escapeHtml(creator.emv||'EMV pending')}</strong><p>Draft model uses qualified impressions × format CPM. Stories without public reach remain documented but unvalued.</p></div></div><div class="deck-content-panel"><div class="deck-content-head"><div><span>CONTENT GENERATED</span><h3>${creatorMedia.length} approved piece${creatorMedia.length===1?'':'s'}</h3></div><div class="deck-platform-summary"><span class="instagram"><b>${instagramCount}</b> ◎ Instagram</span><i></i><span class="tiktok"><b>${tiktokCount}</b> ♪ TikTok</span></div></div><div class="deck-media-rail">${creatorMedia.length?creatorMedia.map(deckMediaCard).join(''):'<div class="deck-empty">No approved media for this creator yet.</div>'}</div></div>`;
  document.getElementById('deckCounter').textContent=`${String(activeDeckCreator+1).padStart(2,'0')} / ${String(creators.length).padStart(2,'0')}`;
  selector.querySelectorAll('[data-deck-index]').forEach(button=>button.addEventListener('click',()=>{activeDeckCreator=Number(button.dataset.deckIndex);renderCreatorDeck()}));
  bindMediaOpeners(deck);
}
document.getElementById('deckPrev').addEventListener('click',()=>{activeDeckCreator=(activeDeckCreator-1+creators.length)%creators.length;renderCreatorDeck()});
document.getElementById('deckNext').addEventListener('click',()=>{activeDeckCreator=(activeDeckCreator+1)%creators.length;renderCreatorDeck()});
renderCreatorDeck();

const savedReviews=JSON.parse(localStorage.getItem('hottestBrunchReviews')||'{}');
let reviewItems=[];
let reviewFilter='pending';
let reviewSearch='';
let reviewPage=0;
const reviewPageSize=24;
let selectedReviewId=null;
let selectedReviewAsset=0;
const reviewList=document.getElementById('reviewList');
const reviewFocus=document.getElementById('reviewFocus');
function decisionFor(item){return savedReviews[item.id]||item.decision||'pending'}
function filteredReviews(){return reviewItems.filter(item=>decisionFor(item)===reviewFilter&&(item.user+' '+item.caption).toLowerCase().includes(reviewSearch))}
function reviewQueueItem(item){const decision=decisionFor(item);return `<button class="review-item ${item.id===selectedReviewId?'active':''}" data-review-id="${escapeHtml(item.id)}"><span class="review-thumb">${thumbnailElement(item)}</span><span class="review-info"><span class="review-meta"><strong>${escapeHtml(item.user)}</strong><i class="platform-mini ${escapeHtml(item.platform)}">${escapeHtml(item.platform)}</i></span><b>${escapeHtml(item.type)} · ${escapeHtml(item.date)}</b><small>${escapeHtml(item.caption||'Captured campaign content')}</small></span><span class="confidence ${escapeHtml(decision)}">${escapeHtml(decision)}</span></button>`}
function reviewCounts(){return Object.fromEntries(['pending','maybe','relevant','discarded'].map(decision=>[decision,reviewItems.filter(item=>decisionFor(item)===decision).length]))}
function renderReviewFocus(){
  const item=reviewItems.find(entry=>entry.id===selectedReviewId);
  if(!item){reviewFocus.innerHTML='<div class="review-empty">No pieces match this queue.</div>';return}
  selectedReviewAsset=Math.max(0,Math.min(selectedReviewAsset,item.assets.length-1));
  const asset=item.assets[selectedReviewAsset]||item;
  const viewItem={...item,...asset,assetUrl:asset.assetUrl||item.assetUrl,thumbnailUrl:asset.thumbnailUrl||item.thumbnailUrl};
  const reason=item.classificationReason||'No automated classification reason is available.';
  const originalUrl=safeExternalUrl(item.permalink);
  reviewFocus.innerHTML=`<div class="review-focus-head"><div><span>REVIEWING ${escapeHtml(item.platform.toUpperCase())}</span><strong>${escapeHtml(item.user)}</strong></div>${originalUrl?`<a href="${escapeHtml(originalUrl)}" target="_blank" rel="noreferrer">Open original ↗</a>`:''}</div><div class="review-viewer">${mediaElement(viewItem)}${item.assets.length>1?`<button class="review-asset-nav prev" data-review-asset="-1">←</button><button class="review-asset-nav next" data-review-asset="1">→</button><span class="review-asset-count">${selectedReviewAsset+1} / ${item.assets.length}</span>`:''}</div><div class="review-detail"><div class="review-detail-meta"><span class="platform-pill ${escapeHtml(item.platform)}">${escapeHtml(item.platform)}</span><b>${escapeHtml(item.type)}</b><span>${escapeHtml(item.date)}</span></div><p>${escapeHtml(item.caption||'No caption available.')}</p><div class="review-signal"><span>CLASSIFICATION SIGNAL</span><p>${escapeHtml(reason)}</p></div><label>Internal note<textarea id="reviewNotes" placeholder="Optional context for this decision">${escapeHtml(item.reviewNotes||'')}</textarea></label><div class="review-decision-bar"><button class="approve ${decisionFor(item)==='relevant'?'selected':''}" data-focus-decision="relevant"><kbd>1</kbd> Relevant</button><button class="maybe ${decisionFor(item)==='maybe'?'selected':''}" data-focus-decision="maybe"><kbd>2</kbd> Maybe</button><button class="discard ${decisionFor(item)==='discarded'?'selected':''}" data-focus-decision="discarded"><kbd>3</kbd> Discard</button></div><small class="review-shortcuts">↑ ↓ navigate · 1 2 3 decide · decisions are reversible</small></div>`;
  reviewFocus.querySelectorAll('[data-review-asset]').forEach(button=>button.addEventListener('click',()=>{selectedReviewAsset=(selectedReviewAsset+Number(button.dataset.reviewAsset)+item.assets.length)%item.assets.length;renderReviewFocus()}));
  reviewFocus.querySelectorAll('[data-focus-decision]').forEach(button=>button.addEventListener('click',()=>saveReviewDecision(item,button.dataset.focusDecision)));
}
function renderReviews(){
  const counts=reviewCounts();
  document.getElementById('reviewedCount').textContent=reviewItems.length-counts.pending;
  document.getElementById('pendingCount').textContent=counts.pending;
  document.getElementById('maybeCount').textContent=counts.maybe;
  document.getElementById('relevantCount').textContent=counts.relevant;
  document.getElementById('discardedCount').textContent=counts.discarded;
  document.getElementById('navPending').textContent=counts.pending;
  const visible=filteredReviews();
  const pageCount=Math.max(1,Math.ceil(visible.length/reviewPageSize));reviewPage=Math.min(reviewPage,pageCount-1);
  const pageItems=visible.slice(reviewPage*reviewPageSize,(reviewPage+1)*reviewPageSize);
  if(!pageItems.some(item=>item.id===selectedReviewId)){selectedReviewId=pageItems[0]?.id||null;selectedReviewAsset=0}
  document.getElementById('reviewQueueTitle').textContent=reviewFilter[0].toUpperCase()+reviewFilter.slice(1)+' queue';
  document.getElementById('reviewQueueCount').textContent=`${visible.length} piece${visible.length===1?'':'s'}`;
  reviewList.innerHTML=pageItems.map(reviewQueueItem).join('')+(visible.length?`<div class="review-queue-pager"><button data-review-page="-1" ${reviewPage===0?'disabled':''}>← Previous</button><span>${reviewPage+1} / ${pageCount}</span><button data-review-page="1" ${reviewPage===pageCount-1?'disabled':''}>Next →</button></div>`:'');
  bindThumbnailFallbacks(reviewList);
  reviewList.querySelectorAll('[data-review-id]').forEach(button=>button.addEventListener('click',()=>{selectedReviewId=button.dataset.reviewId;selectedReviewAsset=0;renderReviews()}));
  reviewList.querySelectorAll('[data-review-page]').forEach(button=>button.addEventListener('click',()=>{reviewPage+=Number(button.dataset.reviewPage);selectedReviewId=null;selectedReviewAsset=0;renderReviews()}));
  renderReviewFocus();
}
async function saveReviewDecision(item,decision){
  const notes=document.getElementById('reviewNotes')?.value||null;
  const currentVisible=filteredReviews();
  const currentIndex=currentVisible.findIndex(entry=>entry.id===item.id);
  try{
    reviewFocus.classList.add('saving');
    if(isAdmin){
      const response=await fetch('/Hottest_Brunch/admin/api/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentId:item.id,decision,notes})});
      if(!response.ok)throw new Error('Review could not be saved');
      item.decision=decision;item.reviewNotes=notes;
    }else{savedReviews[item.id]=decision;localStorage.setItem('hottestBrunchReviews',JSON.stringify(savedReviews))}
    const remaining=filteredReviews();reviewPage=Math.min(reviewPage,Math.max(0,Math.ceil(remaining.length/reviewPageSize)-1));
    selectedReviewId=remaining[Math.min(currentIndex,remaining.length-1)]?.id||null;selectedReviewAsset=0;
    renderReviews();showToast(`Marked ${decision}. Moving to next piece.`)
  }catch(error){showToast(error.message)}finally{reviewFocus.classList.remove('saving')}
}
document.querySelectorAll('[data-review-filter]').forEach(button=>button.addEventListener('click',()=>{reviewFilter=button.dataset.reviewFilter;reviewPage=0;selectedReviewId=null;selectedReviewAsset=0;document.querySelectorAll('[data-review-filter]').forEach(item=>item.classList.toggle('active',item===button));renderReviews()}));
document.getElementById('reviewSearch').addEventListener('input',event=>{reviewSearch=event.target.value.toLowerCase().trim();reviewPage=0;selectedReviewId=null;renderReviews()});
document.addEventListener('keydown',event=>{
  if(!isAdmin||!document.getElementById('view-review').classList.contains('active')||/INPUT|TEXTAREA/.test(document.activeElement?.tagName))return;
  const visible=filteredReviews();const index=visible.findIndex(item=>item.id===selectedReviewId);
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();const delta=event.key==='ArrowDown'?1:-1;const next=(index+delta+visible.length)%visible.length;selectedReviewId=visible[next]?.id||null;reviewPage=Math.floor(next/reviewPageSize);selectedReviewAsset=0;renderReviews()}
  if(['1','2','3'].includes(event.key)){const item=reviewItems.find(entry=>entry.id===selectedReviewId);if(item)saveReviewDecision(item,{1:'relevant',2:'maybe',3:'discarded'}[event.key])}
});
renderReviews();

let modalItem=null;
let modalAssetIndex=0;
const mediaModal=document.getElementById('mediaModal');
function renderMediaModal(){
  if(!modalItem)return;
  const asset=modalItem.assets[modalAssetIndex]||modalItem;
  const viewItem={...modalItem,...asset,assetUrl:asset.assetUrl||modalItem.assetUrl,thumbnailUrl:asset.thumbnailUrl||modalItem.thumbnailUrl};
  document.getElementById('mediaModalContent').innerHTML=`<div class="modal-media">${mediaElement(viewItem)}</div><div class="modal-copy"><span>${escapeHtml(modalItem.platform)} · ${escapeHtml(modalItem.type)} · ${modalAssetIndex+1}/${modalItem.assets.length}</span><strong>${escapeHtml(modalItem.user)}</strong><p>${escapeHtml(modalItem.caption||'No caption available.')}</p></div>`;
}
function openMedia(id){modalItem=media.find(item=>item.id===id);if(!modalItem)return;modalAssetIndex=0;renderMediaModal();mediaModal.classList.add('open');mediaModal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open')}
function closeMedia(){mediaModal.classList.remove('open');mediaModal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');document.getElementById('mediaModalContent').innerHTML='';modalItem=null}
function bindMediaOpeners(root){bindThumbnailFallbacks(root);root.querySelectorAll('[data-open-media]').forEach(element=>{element.addEventListener('click',event=>{if(event.target.closest('video'))return;openMedia(element.dataset.openMedia)});element.addEventListener('keydown',event=>{if(event.key==='Enter')openMedia(element.dataset.openMedia)})})}
document.querySelector('.media-modal-close').addEventListener('click',closeMedia);
mediaModal.addEventListener('click',event=>{if(event.target===mediaModal)closeMedia()});
document.querySelectorAll('[data-modal-nav]').forEach(button=>button.addEventListener('click',()=>{if(!modalItem)return;modalAssetIndex=(modalAssetIndex+Number(button.dataset.modalNav)+modalItem.assets.length)%modalItem.assets.length;renderMediaModal()}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mediaModal.classList.contains('open'))closeMedia()});
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.remove('show'),2300)}

function compactNumber(value){const n=Number(value||0);if(n>=1000000)return (n/1000000).toFixed(n>=10000000?1:2).replace(/\.0+$/,'')+'M';if(n>=1000)return (n/1000).toFixed(n>=100000?0:1).replace(/\.0$/,'')+'K';return n.toLocaleString('en-US')}
function mediaUrl(key){return key?'/media/'+String(key).split('/').map(encodeURIComponent).join('/'):''}
function mappedAsset(asset){const assetUrl=mediaUrl(asset.storageKey);const assetKind=asset.assetKind||'unknown';return {assetUrl,assetKind,thumbnailUrl:assetKind==='video'?mediaUrl(`${asset.storageKey}.poster.jpg`):assetUrl}}
function mapBackendContent(item){
  const assets=(item.assets?.length?item.assets:[{storageKey:item.assetKey,assetKind:item.assetKind}]).filter(asset=>asset.storageKey).map(mappedAsset);
  const primary=assets[0]||{assetUrl:'',assetKind:'unknown',thumbnailUrl:''};
  return {id:item.id,user:'@'+(item.handle||'unknown'),platform:item.platform,type:String(item.sourceType||'post').toUpperCase(),status:item.decision||'pending',decision:item.decision||'pending',caption:item.caption||'',likes:item.likes==null?'N/A':compactNumber(item.likes),comments:item.comments==null?'N/A':compactNumber(item.comments),views:item.views==null?'N/A':compactNumber(item.views),photo:mediaUrl(item.profileStorageKey),assets,assetUrl:primary.assetUrl,assetKind:primary.assetKind,thumbnailUrl:primary.thumbnailUrl,date:item.publishedAt?new Date(item.publishedAt).toLocaleDateString('en-US',{month:'short',day:'2-digit'}).toUpperCase():'N/A',permalink:item.permalink||'',classificationReason:item.classificationReason||'',sourceClassification:item.sourceClassification||'',reviewNotes:item.reviewNotes||''}
}
function calculateEmv(items,benchmarks){return items.reduce((total,item)=>{if(item.decision!=='relevant'||!item.views)return total;const format=item.platform==='tiktok'?'tiktok':item.sourceType;const benchmark=benchmarks.find(b=>b.platform===item.platform&&b.format===format);return total+(benchmark?Number(item.views)/1000*Number(benchmark.value)*Number(benchmark.multiplier):0)},0)}
function puertoRicoDateKey(value){
  if(!value)return null;
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Puerto_Rico',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${values.year}-${values.month}-${values.day}`
}
function campaignDateKeys(project,items){
  const observed=items.map(item=>puertoRicoDateKey(item.publishedAt)).filter(Boolean).sort();
  const start=project?.campaign_start||observed[0];
  const end=project?.campaign_end||observed.at(-1)||start;
  if(!start)return [];
  const result=[];let cursor=new Date(`${start}T12:00:00Z`);const stop=new Date(`${end}T12:00:00Z`);
  while(cursor<=stop&&result.length<31){result.push(cursor.toISOString().slice(0,10));cursor.setUTCDate(cursor.getUTCDate()+1)}
  return result
}
function renderVelocityChart(items,project){
  const chart=document.getElementById('velocityChart');if(!chart)return;
  const qualified=items.filter(item=>item.decision==='relevant');const dates=campaignDateKeys(project,qualified);
  const counts=Object.fromEntries(dates.map(date=>[date,{instagram:0,tiktok:0}]));
  qualified.forEach(item=>{const key=puertoRicoDateKey(item.publishedAt);if(counts[key])counts[key][item.platform==='tiktok'?'tiktok':'instagram']+=1});
  const max=Math.max(1,...Object.values(counts).map(value=>value.instagram+value.tiktok));
  if(!dates.length){chart.innerHTML='<div class="chart-loading">No approved publication dates available.</div>';return}
  chart.innerHTML=`<div class="velocity-scale"><span>${max}</span><span>${Math.ceil(max/2)}</span><span>0</span></div><div class="velocity-grid">${dates.map(date=>{const value=counts[date];const total=value.instagram+value.tiktok;const label=new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US',{month:'short',day:'2-digit'}).toUpperCase();return `<div class="velocity-day" title="${label}: ${total} approved"><strong>${total||''}</strong><div class="velocity-bars"><i class="instagram" style="height:${value.instagram/max*100}%"></i><i class="tiktok" style="height:${value.tiktok/max*100}%"></i></div><span>${label}</span></div>`}).join('')}</div>`
}
async function loadBackend(){
  try{
    const endpoint=isAdmin?'/Hottest_Brunch/admin/api/data':'/api/report/hottest-brunch';
    const response=await fetch(endpoint,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Live dataset unavailable');
    const payload=await response.json();const summary=payload.summary||{};const rawContent=payload.content||[];
    creators=(payload.creators||[]).map(c=>({name:c.displayName||c.handle,handle:'@'+c.handle,followers:c.followers==null?'N/A':compactNumber(c.followers),followerCount:Number(c.followers||0),content:Number(c.content||0),er:c.engagementRate==null?'N/A':Number(c.engagementRate).toFixed(2)+'%',engagements:c.engagements==null?'N/A':compactNumber(c.engagements),photo:mediaUrl(c.profileStorageKey),bio:c.biography||'',category:c.category||'',emv:'EMV pending'})).sort((a,b)=>b.followerCount-a.followerCount);
    media=rawContent.map(mapBackendContent);reviewItems=media;
    const emv=calculateEmv(rawContent,payload.benchmarks||[]);
    document.getElementById('dataStatus').textContent='LIVE DATA';document.getElementById('kpiReach').textContent=compactNumber(summary.potentialAudience);document.getElementById('kpiViews').textContent=compactNumber(summary.views);document.getElementById('kpiEngagements').textContent=compactNumber(summary.engagements);document.getElementById('kpiEr').textContent=summary.views?((Number(summary.engagements)/Number(summary.views))*100).toFixed(2)+'%':'N/A';document.getElementById('kpiEmv').textContent='$'+compactNumber(emv);document.getElementById('methodOutput').textContent='$'+compactNumber(emv);document.getElementById('modelVersion').textContent=`MODEL v${payload.model?.version||'0.1'} · ${String(payload.model?.status||'draft').toUpperCase()}`;
    const storyTotal=Number(summary.typeCounts?.story||0);const postTotal=Number(summary.typeCounts?.post||0)+Number(summary.typeCounts?.reel||0);const tiktokTotal=Number(summary.typeCounts?.tiktok||0);const contentTotal=Math.max(1,storyTotal+postTotal+tiktokTotal);const storyEnd=storyTotal/contentTotal*100;const postEnd=(storyTotal+postTotal)/contentTotal*100;
    document.getElementById('totalPieces').textContent=summary.totalScraped||0;document.getElementById('storyCount').textContent=storyTotal;document.getElementById('postCount').textContent=postTotal;document.getElementById('tiktokCount').textContent=tiktokTotal;document.querySelector('.donut').style.background=`conic-gradient(var(--blue) 0 ${storyEnd}%,var(--red) ${storyEnd}% ${postEnd}%,#111827 ${postEnd}% 100%)`;document.getElementById('qualifiedCount').textContent=summary.qualified||0;document.getElementById('qualifiedBar').style.width=((summary.qualified||0)/Math.max(1,summary.totalScraped||1)*100)+'%';document.getElementById('pendingLabel').textContent=(summary.pending||0)+' pending review';
    document.getElementById('statScraped').textContent=summary.totalScraped||0;document.getElementById('statRelevant').textContent=summary.qualified||0;document.getElementById('statDiscarded').textContent=summary.discarded||0;document.getElementById('statPending').textContent=summary.pending||0;
    activeDeckCreator=0;renderVelocityChart(rawContent,payload.project||{});
    if(isAdmin)showView('review');else hydrateView('overview');
  }catch(error){document.getElementById('dataStatus').textContent='OFFLINE PREVIEW';showToast(error.message)}
}
loadBackend();
