// script.js — load prices.json and render
const REPO_EDIT_URL = '' // optional: put the web editor URL to edit prices.json (e.g. https://github.com/USERNAME/REPO/edit/main/prices.json)


async function loadPrices(){
try{
const res = await fetch('prices.json', {cache: 'no-cache'})
if(!res.ok) throw new Error('fail load')
const data = await res.json()
renderPrices(data)
}catch(err){
// fallback sample data
const sample = [
{id:1, service:'Netflix Premium', tier:'Team 4K', price:59000, duration:1, features:['4K','4 device','Ad-free']},
{id:2, service:'Viu Premium', tier:'Business', price:50000, duration:1, features:['HD','Multi-device']}
]
renderPrices(sample)
}
}


function currency(x){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(x)}


function renderPrices(list){
const grid = document.getElementById('pricesGrid')
grid.innerHTML = ''
list.forEach(item=>{
const card = document.createElement('div'); card.className='price-card'
card.innerHTML = `
<h4>${item.service} <span class="muted">• ${item.tier}</span></h4>
<div class="price-tag">${currency(item.price)} <span class="price-meta">/ ${item.duration} bulan</span></div>
<div class="price-meta">${item.features ? item.features.join(' • ') : ''}</div>
<a class="btn btn-primary" href="#" role="button">Beli / Hubungi Sales</a>
`
grid.appendChild(card)
})
}


// search & filter
function attachControls(){
const search = document.getElementById('searchInput')
const dur = document.getElementById('filterDuration')
search.addEventListener('input', applyFilters)
dur.addEventListener('change', applyFilters)
}


let allPrices = []
async function fetchAndCache(){
try{ const r = await fetch('prices.json', {cache: 'no-cache'}); allPrices = await r.json() }catch(e){ /* leave empty */ }
if(!allPrices.length) allPrices = []
renderPrices(allPrices)
}


function applyFilters(){
const q = document.getElementById('searchInput').value.toLowerCase().trim()
const dur = document.getElementById('filterDuration').value
const result = allPrices.filter(p=>{
if(q && !(p.service.toLowerCase().includes(q) || (p.tier && p.tier.toLowerCase().includes(q)))) return false
if(dur!=='all' && String(p.duration)!==dur) return false
return true
})
renderPrices(result.length?result:allPrices)
}


// Setup
document.addEventListener('DOMContentLoaded', async ()=>{
document.getElementById('editOnGitBtn').href = REPO_EDIT_URL || '#'
attachControls()
await fetchAndCache()
})
