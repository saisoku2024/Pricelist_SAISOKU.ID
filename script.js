// script.js
// Saisoku Price List — simple renderer
// Set REPO_EDIT_URL to the GitHub web editor URL for prices.json if available, e.g.
// const REPO_EDIT_URL = 'https://github.com/USERNAME/REPO/edit/main/prices.json'
const REPO_EDIT_URL = '' // <-- optional: isi dengan URL edit file di GitHub

const pricesUrl = 'prices.json'
let allPrices = []

// utility: format to IDR
function currency(x){
  try{
    return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(x))
  }catch(e){
    return 'Rp ' + x
  }
}

function renderPrices(list){
  const grid = document.getElementById('pricesGrid')
  if(!grid) return
  grid.innerHTML = ''
  if(!list || !list.length){
    grid.innerHTML = '<div class="muted">Tidak ada paket sesuai filter.</div>'
    return
  }
  list.forEach(item=>{
    const card = document.createElement('article')
    card.className = 'price-card'
    card.setAttribute('tabindex','0')
    const featuresHTML = (item.features || []).map(f=>`<span class="feature-pill">${escapeHtml(f)}</span>`).join('')
    card.innerHTML = `
      <div>
        <h4>${escapeHtml(item.service || 'Layanan')}</h4>
        <div class="muted">${escapeHtml(item.tier || '')}</div>
        <div class="price-tag">${currency(item.price)} <span class="price-meta">/ ${escapeHtml(String(item.duration || ''))} bulan</span></div>
        <div class="price-meta">${item.shortDesc ? escapeHtml(item.shortDesc) : ''}</div>
        <div class="features" aria-hidden="false">${featuresHTML}</div>
      </div>
      <div class="card-actions">
        <a class="btn btn-primary" href="#" role="button" aria-label="Hubungi sales ${escapeHtml(item.service)}">Hubungi Sales</a>
        <a class="btn btn-ghost" href="#" role="button" aria-label="Detail ${escapeHtml(item.service)}">Detail</a>
      </div>
    `
    grid.appendChild(card)
  })
}

// simple HTML escape
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])) }

async function fetchPrices(){
  try{
    const res = await fetch(pricesUrl, {cache: 'no-cache'})
    if(!res.ok) throw new Error('fetch failed')
    const json = await res.json()
    if(!Array.isArray(json)) throw new Error('invalid json')
    allPrices = json
  }catch(e){
    // fallback sample data
    allPrices = [
      {"id":1,"service":"Netflix Premium","tier":"Team 4K","price":59000,"duration":1,"features":["4K","4 device","Ad-free"],"shortDesc":"Streaming 4K untuk tim kecil"},
      {"id":2,"service":"Viu Premium","tier":"Business","price":50000,"duration":1,"features":["HD","Multi-device"],"shortDesc":"Konten Asia populer, multi-device"},
      {"id":3,"service":"Prime Video","tier":"Corporate","price":45000,"duration":1,"features":["HD","Multi-region"],"shortDesc":"Library besar untuk bisnis"},
      {"id":4,"service":"YouTube Premium","tier":"Team","price":35000,"duration":1,"features":["Ad-free","Offline"],"shortDesc":"Tanpa iklan, audio background"}
    ]
  } finally {
    renderPrices(allPrices)
  }
}

function applyFilters(){
  const q = document.getElementById('searchInput').value.toLowerCase().trim()
  const dur = document.getElementById('filterDuration').value
  const result = allPrices.filter(p=>{
    if(q){
      const hay = (p.service + ' ' + (p.tier||'') + ' ' + (p.features||[]).join(' ')).toLowerCase()
      if(!hay.includes(q)) return false
    }
    if(dur !== 'all' && String(p.duration) !== dur) return false
    return true
  })
  renderPrices(result)
}

// debounce helper
function debounce(fn, wait=200){
  let t
  return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn.apply(null,args), wait) }
}

function attachControls(){
  const search = document.getElementById('searchInput')
  const dur = document.getElementById('filterDuration')
  const refresh = document.getElementById('refreshBtn')
  if(search) search.addEventListener('input', debounce(applyFilters,150))
  if(dur) dur.addEventListener('change', applyFilters)
  if(refresh) refresh.addEventListener('click', async ()=>{
    await fetchPrices()
    applyFilters()
  })
}

document.addEventListener('DOMContentLoaded', async ()=>{
  // set edit button
  const editBtn = document.getElementById('editOnGitBtn')
  if(editBtn){
    editBtn.href = REPO_EDIT_URL || '#'
    if(!REPO_EDIT_URL) editBtn.setAttribute('aria-disabled','true')
  }

  attachControls()
  await fetchPrices()
  // store for further interaction
  window.SaisokuPrices = {refresh: fetchPrices, allPrices}
})
