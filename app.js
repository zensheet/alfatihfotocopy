/* ============ DATA ============ */
const CATS = ['Semua','Pulpen','Buku','Kertas','Fotocopy'];
const COLORS = { Pulpen:'#1567D6', Buku:'#0B1F4D', Kertas:'#2AA8F2', Map:'#C98A12', Fotocopy:'#1567D6' };
const products = [
  {id:1, name:'Pulpen Standard', sku:'ATK-0001', cat:'Pulpen', price:3000, stock:35, min:10, unit:'pcs', type:'PRODUCT'},
  {id:2, name:'Buku Tulis 38 Lbr', sku:'ATK-0002', cat:'Buku', price:5000, stock:8, min:10, unit:'pcs', type:'PRODUCT'},
  {id:3, name:'Kertas A4 70gr', sku:'ATK-0003', cat:'Kertas', price:55000, stock:0, min:5, unit:'rim', type:'PRODUCT'},
  {id:4, name:'Pensil 2B', sku:'ATK-0004', cat:'Pulpen', price:2500, stock:60, min:15, unit:'pcs', type:'PRODUCT'},
  {id:5, name:'Map Plastik', sku:'ATK-0005', cat:'Buku', price:2000, stock:24, min:10, unit:'pcs', type:'PRODUCT'},
  {id:6, name:'Spidol Whiteboard', sku:'ATK-0006', cat:'Buku', price:8000, stock:6, min:8, unit:'pcs', type:'PRODUCT'},
  {id:7, name:'Stapler No.10', sku:'ATK-0007', cat:'Kertas', price:12000, stock:15, min:5, unit:'pcs', type:'PRODUCT'},
  {id:8, name:'Fotocopy A4', sku:'JSA-0001', cat:'Fotocopy', price:500, stock:null, min:null, unit:'lembar', type:'SERVICE'},
  {id:9, name:'Print Warna A4', sku:'JSA-0002', cat:'Fotocopy', price:2000, stock:null, min:null, unit:'lembar', type:'SERVICE'},
  {id:10, name:'Laminating A4', sku:'JSA-0003', cat:'Fotocopy', price:5000, stock:null, min:null, unit:'lembar', type:'SERVICE'},
];
const MORE_ITEMS = ['Riwayat Penjualan','Stok','Pembelian','Stock Adjustment','Kategori','Supplier','Customer','Hutang Supplier','Piutang Customer','Pengeluaran','Laporan','Pengaturan'];

function rp(n){ return 'Rp' + Math.round(n).toLocaleString('id-ID'); }

/* ============ ROUTER ============ */
function switchView(view, title){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
  document.getElementById('view-' + view).classList.add('is-active');
  document.getElementById('pageTitle').textContent = title;

  document.querySelectorAll('[data-view]').forEach(el => {
    el.classList.toggle('is-active', el.dataset.view === view && el.dataset.title === title);
  });
  if(view !== 'placeholder'){
    document.querySelectorAll('[data-view="' + view + '"]').forEach(el => el.classList.add('is-active'));
  }
  if(view === 'placeholder'){
    document.getElementById('placeholderTitle').textContent = title;
  }
  window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
}

document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => switchView(el.dataset.view, el.dataset.title));
});

/* ============ MORE SHEET ============ */
const moreOverlay = document.getElementById('moreOverlay');
document.getElementById('moreList').innerHTML = MORE_ITEMS.map(label =>
  `<button type="button" data-more="${label}">${label}</button>`).join('');
document.getElementById('moreTab').addEventListener('click', () => moreOverlay.classList.add('show'));
document.getElementById('moreCloseBtn').addEventListener('click', () => moreOverlay.classList.remove('show'));
document.getElementById('moreList').addEventListener('click', e => {
  const btn = e.target.closest('[data-more]');
  if(!btn) return;
  moreOverlay.classList.remove('show');
  switchView('placeholder', btn.dataset.more);
});

/* ============ KASIR: PRODUCT GRID ============ */
let activeCat = 'Semua';
function renderChips(){
  document.getElementById('chipRow').innerHTML = CATS.map(c =>
    `<button type="button" class="chip ${c===activeCat?'is-active':''}" data-cat="${c}">${c}</button>`).join('');
}
document.getElementById('chipRow').addEventListener('click', e => {
  const btn = e.target.closest('[data-cat]');
  if(!btn) return;
  activeCat = btn.dataset.cat;
  renderChips();
  renderGrid();
});

function renderGrid(){
  const grid = document.getElementById('productGrid');
  const list = products.filter(p => activeCat==='Semua' || p.cat===activeCat);
  grid.innerHTML = list.map(p => {
    const out = p.type==='PRODUCT' && p.stock===0;
    const initials = p.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
    const stockLine = p.type==='SERVICE' ? 'Jasa · per ' + p.unit : (out ? 'Stok habis' : p.stock + ' ' + p.unit + ' tersisa');
    return `<div class="pcard ${out?'out':''}" data-add="${p.id}">
      <div class="pcard__thumb" style="background:${COLORS[p.cat]||'#0B1F4D'}">${initials}</div>
      <div class="pcard__name">${p.name}</div>
      <div class="pcard__meta">${stockLine}</div>
      <div class="pcard__row">
        <span class="pcard__price">${rp(p.price)}</span>
        <button class="pcard__add" type="button" ${out?'disabled':''} data-add="${p.id}">+</button>
      </div>
    </div>`;
  }).join('');
}
document.getElementById('productGrid').addEventListener('click', e => {
  const el = e.target.closest('[data-add]');
  if(!el || el.hasAttribute('disabled')) return;
  addToCart(Number(el.dataset.add));
});

/* ============ CART ============ */
let cart = {};
const diskonFlat = 0;

function addToCart(id){
  const p = products.find(x=>x.id===id);
  if(p.type==='PRODUCT'){
    const currentQty = cart[id]||0;
    if(currentQty+1 > p.stock) return;
  }
  cart[id] = (cart[id]||0) + 1;
  renderCart();
}
function changeQty(id, delta){
  const p = products.find(x=>x.id===id);
  let q = (cart[id]||0) + delta;
  if(p.type==='PRODUCT' && q > p.stock) q = p.stock;
  if(q <= 0){ delete cart[id]; } else { cart[id] = q; }
  renderCart();
}

function cartItemsList(){
  return Object.keys(cart).map(id => { const p = products.find(x=>x.id==id); return {p, qty: cart[id]}; });
}
function currentTotal(){
  const subtotal = cartItemsList().reduce((s,it)=> s + it.p.price*it.qty, 0);
  return Math.max(subtotal - diskonFlat, 0);
}

function renderCart(){
  const items = cartItemsList();
  const wrap = document.getElementById('cartItems');
  document.getElementById('cartCountLabel').textContent = `Keranjang (${items.length} item)`;

  wrap.innerHTML = items.length===0
    ? '<div class="cart-empty">Keranjang masih kosong.<br>Tap produk untuk mulai transaksi.</div>'
    : items.map(it => `
      <div class="citem">
        <div class="citem__name">${it.p.name}<span class="citem__sub">${rp(it.p.price)} / ${it.p.unit}</span></div>
        <div class="qtystep">
          <button type="button" data-qty="${it.p.id}" data-delta="-1">−</button>
          <span>${it.qty}</span>
          <button type="button" data-qty="${it.p.id}" data-delta="1">+</button>
        </div>
        <div class="citem__total">${rp(it.p.price*it.qty)}</div>
      </div>`).join('');

  const subtotal = items.reduce((s,it)=> s + it.p.price*it.qty, 0);
  const total = Math.max(subtotal - diskonFlat, 0);
  document.getElementById('tSubtotal').textContent = rp(subtotal);
  document.getElementById('tDiskon').textContent = rp(diskonFlat);
  document.getElementById('tTotal').textContent = rp(total);
  document.getElementById('payBtn').disabled = items.length===0;

  const count = items.reduce((s,it)=>s+it.qty,0);
  document.getElementById('miniCartLabel').textContent = `${count} item · ${rp(total)}`;
  document.getElementById('miniCartBar').classList.toggle('is-visible', items.length>0 && window.innerWidth < 900);
}
document.getElementById('cartItems').addEventListener('click', e => {
  const btn = e.target.closest('[data-qty]');
  if(!btn) return;
  changeQty(Number(btn.dataset.qty), Number(btn.dataset.delta));
});

/* cart panel open/close (mobile bottom sheet) */
const cartPanel = document.getElementById('cartPanel');
const cartBackdrop = document.getElementById('cartBackdrop');
function openCartPanel(){ cartPanel.classList.add('is-open'); cartBackdrop.classList.add('is-open'); }
function closeCartPanel(){ cartPanel.classList.remove('is-open'); cartBackdrop.classList.remove('is-open'); }
document.getElementById('miniCartBar').addEventListener('click', openCartPanel);
document.getElementById('cartCloseBtn').addEventListener('click', closeCartPanel);
cartBackdrop.addEventListener('click', closeCartPanel);

/* ============ PAYMENT ============ */
const methods = ['Cash','QRIS','Transfer','Debit'];
let payMethod = 'Cash';
let cashGiven = 0;
const payOverlay = document.getElementById('payOverlay');

function renderPayMethods(){
  document.getElementById('payMethods').innerHTML = methods.map(m =>
    `<button type="button" class="${m===payMethod?'is-active':''}" data-method="${m}">${m}</button>`).join('');
  document.getElementById('cashArea').style.display = payMethod==='Cash' ? 'block' : 'none';
}
document.getElementById('payMethods').addEventListener('click', e => {
  const btn = e.target.closest('[data-method]');
  if(!btn) return;
  payMethod = btn.dataset.method; cashGiven = 0;
  renderPayMethods(); updateKembali();
});

function renderCashGrid(){
  const total = currentTotal();
  const presets = [total, 20000, 50000, 100000].filter((v,i,a)=>a.indexOf(v)===i && v>0);
  document.getElementById('cashGrid').innerHTML = presets.slice(0,4).map(v =>
    `<button type="button" data-cash="${v}">${v===total?'Uang Pas':rp(v)}</button>`).join('');
}
document.getElementById('cashGrid').addEventListener('click', e => {
  const btn = e.target.closest('[data-cash]');
  if(!btn) return;
  cashGiven = Number(btn.dataset.cash);
  updateKembali();
});
function updateKembali(){
  const total = currentTotal();
  const kembali = payMethod==='Cash' ? Math.max(cashGiven - total, 0) : 0;
  document.getElementById('kembaliVal').textContent = rp(kembali);
}

document.getElementById('payBtn').addEventListener('click', () => {
  if(document.getElementById('payBtn').disabled) return;
  payMethod='Cash'; cashGiven=0;
  renderPayMethods(); renderCashGrid(); updateKembali();
  closeCartPanel();
  payOverlay.classList.add('show');
});
document.getElementById('payCloseBtn').addEventListener('click', () => payOverlay.classList.remove('show'));

/* ============ RECEIPT ============ */
const receiptOverlay = document.getElementById('receiptOverlay');
let lastInvoiceCounter = 1;

document.getElementById('confirmPayBtn').addEventListener('click', () => {
  const total = currentTotal();
  if(payMethod==='Cash' && cashGiven < total) cashGiven = total;
  const bayar = payMethod==='Cash' ? Math.max(cashGiven,total) : total;
  const kembali = payMethod==='Cash' ? bayar-total : 0;

  const items = cartItemsList();
  const subtotal = items.reduce((s,it)=>s+it.p.price*it.qty,0);

  document.getElementById('rInvoice').textContent = 'AF-20260829-' + String(lastInvoiceCounter).padStart(4,'0');
  document.getElementById('rItems').innerHTML = items.map(it => `
    <div class="rline"><span>${it.p.name}</span><span></span></div>
    <div class="rline rline--dim"><span>${it.qty} x ${rp(it.p.price)}</span><span>${rp(it.qty*it.p.price)}</span></div>
  `).join('');
  document.getElementById('rSubtotal').textContent = rp(subtotal);
  document.getElementById('rDiskon').textContent = rp(diskonFlat);
  document.getElementById('rTotal').textContent = rp(total);
  document.getElementById('rMethodLabel').textContent = payMethod;
  document.getElementById('rBayar').textContent = rp(bayar);
  document.getElementById('rKembali').textContent = rp(kembali);

  payOverlay.classList.remove('show');
  const stamp = document.getElementById('receiptStamp');
  stamp.style.animation = 'none'; void stamp.offsetWidth; stamp.style.animation = '';
  receiptOverlay.classList.add('show');
});
document.getElementById('receiptCloseBtn').addEventListener('click', () => receiptOverlay.classList.remove('show'));
document.getElementById('newTxBtn').addEventListener('click', () => {
  lastInvoiceCounter++;
  cart = {};
  renderCart(); renderGrid();
  receiptOverlay.classList.remove('show');
});

/* ============ DASHBOARD ============ */
function renderAlerts(){
  const alerts = products.filter(p => p.type==='PRODUCT' && (p.stock===0 || p.stock<=p.min));
  document.getElementById('alertList').innerHTML = alerts.map(p => {
    const habis = p.stock===0;
    return `<div class="alertrow">
      <div><div class="alertrow__name">${p.name}</div><div class="alertrow__meta">Min. ${p.min} ${p.unit}</div></div>
      <span class="stamp-tag ${habis?'habis':'menipis'}">${habis?'Stok Habis':'Stok Menipis'}</span>
    </div>`;
  }).join('');
}
document.getElementById('todayPill').textContent = new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});

/* ============ PRODUK TABLE ============ */
let tableFilter = 'ALL';
function renderTable(){
  const q = document.getElementById('tableSearch').value.trim().toLowerCase();
  const rows = products.filter(p => {
    const matchType = tableFilter==='ALL' || p.type===tableFilter;
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    return matchType && matchQ;
  });
  document.getElementById('tableBody').innerHTML = rows.map(p => {
    let status, cls;
    if(p.type==='SERVICE'){ status='Jasa'; cls='aman'; }
    else if(p.stock===0){ status='Habis'; cls='habis'; }
    else if(p.stock<=p.min){ status='Menipis'; cls='menipis'; }
    else { status='Aman'; cls='aman'; }
    return `<tr>
      <td class="cell-sku">${p.sku}</td>
      <td class="cell-name">${p.name}</td>
      <td class="cell-cat">${p.cat}</td>
      <td class="cell-stock">${p.type==='SERVICE' ? '—' : p.stock}</td>
      <td class="cell-cat">${p.unit}</td>
      <td class="cell-price">${rp(p.price)}</td>
      <td><span class="stamp-tag ${cls}">${status}</span></td>
    </tr>`;
  }).join('');
}
document.querySelectorAll('.tchip').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tchip').forEach(b=>b.classList.remove('is-active'));
    btn.classList.add('is-active');
    tableFilter = btn.dataset.tf;
    renderTable();
  });
});
document.getElementById('tableSearch').addEventListener('input', renderTable);

/* ============ INIT ============ */
renderChips();
renderGrid();
renderCart();
renderAlerts();
renderTable();
window.addEventListener('resize', renderCart);
