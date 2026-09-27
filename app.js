const startups = [
  {name:'Xempla',area:'New Town',sector:'SaaS',stage:'Early',lat:22.5768,lng:88.4755,hiring:true,freshers:false,jobs:1,desc:'Decision support software for enterprise asset management.',url:'https://www.xempla.io/'},
  {name:'KloudMate',area:'Salt Lake',sector:'SaaS',stage:'Early',lat:22.5842,lng:88.4175,hiring:true,freshers:true,jobs:2,desc:'Cloud observability for modern developers.',url:'https://www.kloudmate.com/'},
  {name:'Arohan Financial Services',area:'Salt Lake',sector:'Fintech',stage:'Growth',lat:22.5746,lng:88.4312,hiring:true,freshers:true,jobs:1,desc:'Financial services focused on underserved communities.',url:'https://www.arohan.in/'},
  {name:'Wow! Momo',area:'Park Street',sector:'Foodtech',stage:'Growth',lat:22.5533,lng:88.3518,hiring:true,freshers:true,jobs:2,desc:'Indian QSR brand building a large-format food business.',url:'https://www.wowmomo.com/'},
  {name:'StockEdge',area:'Ballygunge',sector:'Fintech',stage:'Growth',lat:22.5267,lng:88.3665,hiring:true,freshers:false,jobs:1,desc:'Investment research and market analytics platform.',url:'https://stockedge.com/'},
  {name:'Nestasia',area:'New Town',sector:'D2C',stage:'Growth',lat:22.5859,lng:88.4791,hiring:true,freshers:true,jobs:1,desc:'Home decor and lifestyle commerce brand.',url:'https://www.nestasia.in/'},
  {name:'Mihup',area:'Rajarhat',sector:'AI',stage:'Growth',lat:22.6208,lng:88.4522,hiring:true,freshers:false,jobs:1,desc:'Voice AI and conversational intelligence technology.',url:'https://mihup.com/'},
  {name:'Asanify',area:'Ballygunge',sector:'Enterprise Tech',stage:'Early',lat:22.5207,lng:88.3625,hiring:false,freshers:false,jobs:0,desc:'HR and payroll technology for growing businesses.',url:'https://asanify.com/'},
  {name:'TagMango',area:'Salt Lake',sector:'Media',stage:'Early',lat:22.5811,lng:88.4239,hiring:false,freshers:false,jobs:0,desc:'Creator economy and community platform.',url:'https://tagmango.com/'},
  {name:'SastaSundar',area:'New Town',sector:'Healthtech',stage:'Growth',lat:22.5936,lng:88.4761,hiring:false,freshers:false,jobs:0,desc:'Digital health and pharmacy platform.',url:'https://www.sastasundar.com/'},
  {name:'Indus Net Technologies',area:'Sector V',sector:'Enterprise Tech',stage:'Established',lat:22.5740,lng:88.4337,hiring:true,freshers:true,jobs:2,desc:'Digital transformation and technology services company.',url:'https://www.indusnet.co.in/'},
  {name:'Utsav',area:'Alipore',sector:'D2C',stage:'Early',lat:22.5300,lng:88.3265,hiring:false,freshers:false,jobs:0,desc:'Devotional and spiritual services platform.',url:'https://utsavapp.in/'}
];

const map = L.map('map',{zoomControl:false}).setView([22.5726,88.3639],11);
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap contributors',
  maxZoom:19
}).addTo(map);

const layer = L.layerGroup().addTo(map);
const markers = new Map();

const icon = () => L.divIcon({
  className:'',
  html:'<div class="marker" aria-hidden="true">•</div>',
  iconSize:[28,28],
  iconAnchor:[14,14]
});

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[c]));

const popup = s => `
  <div class="popup">
    <h3>${escapeHtml(s.name)}</h3>
    <p>${escapeHtml(s.sector)} · ${escapeHtml(s.area)}</p>
    <p>${escapeHtml(s.desc)}</p>
    ${s.jobs ? `<p><b>${s.jobs} open role${s.jobs > 1 ? 's' : ''}</b></p>` : '<p>No open roles listed</p>'}
    <a href="${s.url}" target="_blank" rel="noopener noreferrer">Company website →</a>
  </div>
`;

startups.forEach(s => {
  const marker = L.marker([s.lat,s.lng],{icon:icon()})
    .bindPopup(popup(s));
  markers.set(s.name,marker);
});

const els = {
  search: document.getElementById('search'),
  area: document.getElementById('area'),
  sector: document.getElementById('sector'),
  stage: document.getElementById('stage'),
  hiring: document.getElementById('hiring'),
  cards: document.getElementById('cards'),
  grid: document.getElementById('grid'),
  count: document.getElementById('resultCount'),
  jobTotal: document.getElementById('jobTotal')
};

function filtered() {
  const q = els.search.value.trim().toLowerCase();
  return startups.filter(s => {
    const haystack = `${s.name} ${s.sector} ${s.area} ${s.desc}`.toLowerCase();
    const matchesQuery = !q || haystack.includes(q);
    const matchesArea = !els.area.value || s.area === els.area.value;
    const matchesSector = !els.sector.value || s.sector === els.sector.value;
    const matchesStage = !els.stage.value || s.stage === els.stage.value;
    const matchesHiring =
      !els.hiring.value ||
      (els.hiring.value === 'hiring' && s.hiring) ||
      (els.hiring.value === 'freshers' && s.freshers);
    return matchesQuery && matchesArea && matchesSector && matchesStage && matchesHiring;
  });
}

function card(s) {
  return `
    <article class="card" data-name="${escapeHtml(s.name)}">
      <h3>${escapeHtml(s.name)}</h3>
      <div class="meta">${escapeHtml(s.area)} · ${escapeHtml(s.sector)} · ${escapeHtml(s.stage)}</div>
      <div class="tags">
        ${s.hiring ? '<span class="tag hiring">Hiring now</span>' : ''}
        ${s.freshers ? '<span class="tag">Fresher friendly</span>' : ''}
        ${s.jobs ? `<span class="tag">${s.jobs} open role${s.jobs > 1 ? 's' : ''}</span>` : ''}
      </div>
      <div class="card-footer">
        <span>${escapeHtml(s.desc)}</span>
        <a href="${s.url}" target="_blank" rel="noopener noreferrer">Visit →</a>
      </div>
    </article>
  `;
}

function attachCards(root) {
  root.querySelectorAll('.card[data-name]').forEach(cardEl => {
    cardEl.addEventListener('click', event => {
      if (event.target.closest('a')) return;
      const s = startups.find(x => x.name === cardEl.dataset.name);
      if (!s) return;
      map.setView([s.lat,s.lng],14);
      markers.get(s.name).openPopup();
    });
  });
}

function render() {
  const data = filtered();
  els.count.textContent = data.length;
  els.cards.innerHTML = data.map(card).join('');
  els.grid.innerHTML = data.map(card).join('');

  layer.clearLayers();
  data.forEach(s => markers.get(s.name).addTo(layer));
  attachCards(els.cards);
  attachCards(els.grid);
}

[els.search,els.area,els.sector,els.stage,els.hiring]
  .forEach(el => el.addEventListener('input',render));

render();
els.jobTotal.textContent = startups.reduce((sum,s) => sum + s.jobs,0);

document.getElementById('gridBtn').addEventListener('click', () => {
  document.getElementById('map').classList.add('hidden');
  document.querySelector('.side').classList.add('hidden');
  els.grid.classList.remove('hidden');
  document.getElementById('gridBtn').classList.add('active');
  document.getElementById('mapBtn').classList.remove('active');
});

document.getElementById('mapBtn').addEventListener('click', () => {
  document.getElementById('map').classList.remove('hidden');
  document.querySelector('.side').classList.remove('hidden');
  els.grid.classList.add('hidden');
  document.getElementById('mapBtn').classList.add('active');
  document.getElementById('gridBtn').classList.remove('active');
  setTimeout(() => map.invalidateSize(),50);
});

const modal = document.getElementById('modal');
document.getElementById('submitBtn').addEventListener('click', () => modal.classList.remove('hidden'));
document.getElementById('modalClose').addEventListener('click', () => modal.classList.add('hidden'));
document.getElementById('submitForm').addEventListener('submit', e => {
  e.preventDefault();
  e.currentTarget.classList.add('hidden');
  document.getElementById('thanks').classList.remove('hidden');
});
document.getElementById('closeNews').?.addEventListener('click', () => {});
document.getElementById('closeSide').addEventListener('click', () => document.querySelector('.side').classList.toggle('hidden'));
