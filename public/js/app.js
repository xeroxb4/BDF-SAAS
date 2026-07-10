'use strict';
/* ════════════════════════════════════════════════════
   MULTI-TENANT SAAS — FRONTEND APP
════════════════════════════════════════════════════ */

/* ─── PALETTE ──────────────────────────────────────── */
const PAL   = ['#00e5ff','#ff2d78','#a855f7','#ffb300','#00e676','#448aff','#ff6e40','#69f0ae','#f06292','#4dd0e1'];
const PALBG = ['rgba(0,229,255,.15)','rgba(255,45,120,.15)','rgba(168,85,247,.15)','rgba(255,179,0,.15)','rgba(0,230,118,.15)','rgba(68,138,255,.15)','rgba(255,110,64,.15)','rgba(105,240,174,.15)','rgba(240,98,146,.15)','rgba(77,208,225,.15)'];
const gc = i => PAL[i % PAL.length];
const gb = i => PALBG[i % PALBG.length];
const ROLE_BADGE  = { OMR:'badge-cyan', Salesman:'badge-green' };
const TYPE_BADGE  = { Distributor:'badge-violet', Wholesaler:'badge-amber' };
const AVC_BADGE   = { gold:'badge-gold', silver:'badge-silver', bronze:'badge-bronze', none:'badge-muted' };
const PLAN_CLASS  = { trial:'plan-trial', starter:'plan-starter', pro:'plan-pro', enterprise:'plan-enterprise' };

/* ─── STATE ────────────────────────────────────────── */
let authToken   = localStorage.getItem('_tk') || null;
let currentUser = null;
let currentCompany = null;   // company object for non-super users

// Data stores
let companies=[], regions=[], distributors=[], agents=[], products=[];
let stock=[], dispatches=[], shops=[], targets=[], promotions=[];

let agentFilter = 'all';
let activePage  = 'dashboard';

/* ─── API ──────────────────────────────────────────── */
async function api(method, path, body) {
<<<<<<< HEAD
  // Always read token fresh from localStorage in case it was set after page load
  if (!authToken) authToken = localStorage.getItem('_tk');
  const opts = { method, headers: { 'Content-Type':'application/json' } };
  if (authToken) opts.headers['Authorization'] = 'Bearer ' + authToken;
  if (body) opts.body = JSON.stringify(body);
  try {
    const res  = await fetch('/api' + path, opts);
    const data = await res.json();
    if (res.status === 401) { 
      // Only redirect to login if we actually had a token (not just missing)
      localStorage.removeItem('_tk');
      authToken = null;
      showLogin(); 
      return null; 
    }
    if (!res.ok) throw new Error(data.message || 'Server error');
    return data;
  } catch(e) {
    if (e.message === 'Failed to fetch') {
      toast('Network error — check your connection', 'err');
      return null;
    }
    throw e;
  }
=======
  const opts = { method, headers: { 'Content-Type':'application/json' } };
  if (authToken) opts.headers['Authorization'] = 'Bearer ' + authToken;
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch('/api' + path, opts);
  const data = await res.json();
  if (res.status === 401) { showLogin(); return null; }
  if (!res.ok) throw new Error(data.message || 'Server error');
  return data;
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
}

/* ═══ TOAST & BANNER ══════════════════════════════════ */
function toast(msg, type='info') {
  const icons = { ok:'ti-circle-check', err:'ti-alert-circle', info:'ti-info-circle' };
  const el = document.createElement('div');
  el.className = `toast-msg toast-${type}`;
  el.innerHTML = `<i class="ti ${icons[type]||icons.info}"></i><span>${msg}</span>`;
  el.style.cursor = 'pointer';
  el.title = 'Click to dismiss';
  el.addEventListener('click', () => el.remove());
  document.getElementById('toast').appendChild(el);
  // Auto-remove after 5 seconds (longer than before)
  setTimeout(() => { if (el.parentNode) el.remove(); }, 5000);
}

function showBanner(msg, type='ok') {
  // Remove any existing banner first
  document.getElementById('success-banner')?.remove();
  const colors = {
    ok:   { bg:'rgba(0,230,118,.15)',  border:'rgba(0,230,118,.4)',  color:'#00e676', icon:'ti-circle-check' },
    err:  { bg:'rgba(255,82,82,.15)',  border:'rgba(255,82,82,.4)',  color:'#ff5252', icon:'ti-alert-circle'  },
    info: { bg:'rgba(0,229,255,.12)',  border:'rgba(0,229,255,.35)', color:'#00e5ff', icon:'ti-info-circle'   },
  };
  const c = colors[type] || colors.info;
  const el = document.createElement('div');
  el.id = 'success-banner';
  el.style.cssText = `
    position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:8000;
    background:${c.bg};border:1px solid ${c.border};color:${c.color};
    padding:14px 24px;border-radius:12px;font-size:14px;font-weight:700;
    display:flex;align-items:center;gap:10px;
    box-shadow:0 8px 32px rgba(0,0,0,.5);
    animation:toast-in .25s ease;max-width:90vw;
    font-family:'Nunito',sans-serif;
  `;
  el.innerHTML = `
    <i class="ti ${c.icon}" style="font-size:20px;flex-shrink:0;"></i>
    <span style="flex:1;">${msg}</span>
    <i class="ti ti-x" style="font-size:16px;cursor:pointer;opacity:.7;flex-shrink:0;" onclick="this.parentNode.remove()"></i>
  `;
  document.body.appendChild(el);
  // Auto-dismiss after 8 seconds
  setTimeout(() => { if (el.parentNode) el.remove(); }, 8000);
}

/* ─── FORMAT ───────────────────────────────────────── */
const cur  = () => currentCompany?.currency || 'GH₵';
const fmt  = n  => cur() + ' ' + parseFloat(n||0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');
const today = () => new Date().toISOString().split('T')[0];

/* ─── CLOCK ────────────────────────────────────────── */
function tickClock() {
  const n = new Date();
  const p = x => String(x).padStart(2,'0');
  const el = document.getElementById('clock');
  if (el) el.textContent = p(n.getHours())+':'+p(n.getMinutes())+':'+p(n.getSeconds());
}
setInterval(tickClock, 1000); tickClock();

/* ─── SIDEBAR ──────────────────────────────────────── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-backdrop').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').classList.remove('open');
}

/* ─── NAV ──────────────────────────────────────────── */
function sw(id, el, label) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  if (el)  el.classList.add('active');
  const lbl = document.getElementById('topbar-section');
  if (lbl) lbl.textContent = label || id;
  activePage = id;
<<<<<<< HEAD
  sessionStorage.setItem('activePage', id);
=======
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
  closeSidebar();
}

/* ─── MODAL ────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});

/* ═══ AUTH ═══════════════════════════════════════════ */
function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
}
function hideLogin() {
  document.getElementById('login-screen').classList.add('hidden');
}
function showRegisterForm() {
  document.getElementById('register-wrap').style.display = 'block';
}

async function doLogin() {
  const btn  = document.getElementById('login-btn');
  const err  = document.getElementById('login-err');
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  err.classList.remove('show');
  if (!user || !pass) { err.textContent = 'Please enter username and password.'; err.classList.add('show'); return; }
  btn.disabled = true; btn.textContent = 'Signing in…';
  try {
    const data = await api('POST', '/auth/login', { username:user, password:pass });
    if (!data) return;
<<<<<<< HEAD
    authToken      = data.token;
    currentUser    = data.data.user;
    currentCompany = currentUser.company || null;
    // If company not in 'company' key, try companyId
    if (!currentCompany && currentUser.companyId && typeof currentUser.companyId === 'object') {
      currentCompany = currentUser.companyId;
    }
    localStorage.setItem('_tk', authToken);
    applyCompanyTheme(currentCompany);
    hideLogin();
    if (currentUser.role === 'salesperson') {
      showSpView();
      await loadSpData();
      toast('Welcome, ' + currentUser.fullName + '!', 'ok');
    } else {
      await loadAllData();
      buildSidebar();
      toast('Welcome back, ' + currentUser.fullName + '!', 'ok');
    }
=======
    authToken    = data.token;
    currentUser  = data.data.user;
    currentCompany = currentUser.company || null;
    localStorage.setItem('_tk', authToken);
    applyCompanyTheme(currentCompany);
    hideLogin();
    await loadAllData();
    buildSidebar();
    toast(`Welcome back, ${currentUser.fullName}!`, 'ok');
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
  } catch(e) {
    err.textContent = e.message; err.classList.add('show');
  } finally { btn.disabled = false; btn.textContent = 'Sign In'; }
}

async function doRegister() {
  const fn   = document.getElementById('reg-name').value.trim();
  const user = document.getElementById('reg-user').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const errEl= document.getElementById('reg-err');
  const btn  = document.getElementById('reg-btn');

  function showErr(msg) {
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    else toast(msg, 'err');
  }

  if (!fn)   { showErr('Please enter your full name.'); return; }
  if (!user) { showErr('Please choose a username.'); return; }
  if (user.includes(' ')) { showErr('Username cannot contain spaces.'); return; }
  if (!pass) { showErr('Please enter a password.'); return; }
  if (pass.length < 6) { showErr('Password must be at least 6 characters.'); return; }

  if (errEl) errEl.style.display = 'none';
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }

  try {
    const data = await api('POST', '/auth/register', { fullName:fn, username:user, password:pass });
    if (!data) return;
    authToken      = data.token;
    currentUser    = data.data.user;
    currentCompany = currentUser.company || null;
    localStorage.setItem('_tk', authToken);
    applyCompanyTheme(currentCompany);
    hideLogin();
    await loadAllData();
    buildSidebar();
    toast('Super admin account created! Welcome, ' + currentUser.fullName, 'ok');
  } catch(e) {
    showErr(e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Create Super Admin Account'; }
  }
}

async function doLogout() {
  try { await api('POST','/auth/logout'); } catch(_){}
  authToken = null; currentUser = null; currentCompany = null;
  localStorage.removeItem('_tk');
  companies=[]; regions=[]; distributors=[]; agents=[]; products=[];
  stock=[]; dispatches=[]; shops=[]; targets=[]; promotions=[];
  applyCompanyTheme(null);
  showLogin();
}

async function checkAuth() {
<<<<<<< HEAD
  // Always read token from localStorage on page load
  authToken = localStorage.getItem('_tk');
  if (!authToken) { showLogin(); return; }
  
  try {
    const data = await api('GET', '/auth/me');
    if (!data) { 
      // API call returned null (401) — clear token and show login
      localStorage.removeItem('_tk');
      authToken = null;
      showLogin(); 
      return; 
    }
    
    currentUser = data.data.user;
    
    // Extract company — /me returns it as 'company' key (set in auth route)
    currentCompany = currentUser.company || null;
    
    // If company not populated, try companyId field
    if (!currentCompany && currentUser.companyId) {
      const c = currentUser.companyId;
      if (typeof c === 'object' && c._id) {
        currentCompany = c;
      }
    }
    
    applyCompanyTheme(currentCompany);
    hideLogin();
    
    if (currentUser.role === 'salesperson') {
      showSpView();
      await loadSpData();
    } else {
      await loadAllData();
      buildSidebar();
      // Restore last active page from sessionStorage
      const lastPage = sessionStorage.getItem('activePage');
      if (lastPage && document.getElementById(lastPage)) {
        const navItem = document.querySelector('[onclick*="' + lastPage + '"]');
        sw(lastPage, navItem, lastPage.replace(/-section$/,'').replace(/-/g,' '));
      }
    }
  } catch(e) { 
    console.warn('Auth check failed:', e.message);
    // Only logout on actual auth errors, not network errors
    if (e.message?.includes('session') || e.message?.includes('log in') || e.message?.includes('expired')) {
      localStorage.removeItem('_tk');
      authToken = null;
      showLogin();
    } else {
      // Network error — keep token, show login with message
      console.error('Network error during auth check, keeping session');
      showLogin();
    }
  }
=======
  if (!authToken) { showLogin(); return; }
  try {
    const data = await api('GET','/auth/me');
    if (!data) { showLogin(); return; }
    currentUser    = data.data.user;
    currentCompany = currentUser.companyId || null;
    applyCompanyTheme(currentCompany);
    hideLogin();
    await loadAllData();
    buildSidebar();
  } catch(_) { showLogin(); }
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
}

/* ─── COMPANY THEME ────────────────────────────────── */
function applyCompanyTheme(company) {
  const color = company?.accentColor || '#00e5ff';
  document.documentElement.style.setProperty('--accent', color);
  // parse RGB for dim
  try {
    const r = parseInt(color.slice(1,3),16);
    const g = parseInt(color.slice(3,5),16);
    const b = parseInt(color.slice(5,7),16);
    document.documentElement.style.setProperty('--accent-dim', `rgba(${r},${g},${b},.15)`);
  } catch(_){}
  // Update topbar company pill
  const pill = document.getElementById('company-pill');
  const dot  = document.getElementById('company-dot');
  const name = document.getElementById('company-name');
  const userEl = document.getElementById('topbar-username');
  if (pill && company) {
    dot.style.background  = color;
    name.textContent      = company.name;
    pill.style.display    = 'flex';
  } else if (pill) {
    pill.style.display = 'none';
  }
  if (userEl && currentUser) userEl.textContent = currentUser.fullName || currentUser.username;
}

/* ─── BUILD SIDEBAR BASED ON ROLE ──────────────────── */
<<<<<<< HEAD
function goHome() {
  const firstNav = document.querySelector('#sidebar-nav .nav-item');
  const firstSection = document.querySelector('.section');
  if (firstSection) sw(firstSection.id, firstNav, 'Dashboard');
}

=======
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
function buildSidebar() {
  const role = currentUser?.role;
  const sb   = document.getElementById('sidebar-nav');
  if (!sb) return;

  if (role === 'super_admin') {
    sb.innerHTML = `
      <div class="sidebar-label">Platform</div>
      <div class="nav-item active" onclick="sw('dashboard',this,'Master Dashboard')"><i class="ti ti-layout-dashboard"></i> Master Dashboard</div>
      <div class="nav-item" onclick="sw('companies-section',this,'Companies')"><i class="ti ti-buildings"></i> Companies</div>
      <div class="sidebar-label">Tools</div>
      <div class="nav-item" onclick="sw('audit-section',this,'Audit Log')"><i class="ti ti-clipboard-list"></i> Audit Log</div>`;
  } else {
    sb.innerHTML = `
      <div class="sidebar-label">Overview</div>
      <div class="nav-item active" onclick="sw('dashboard',this,'Dashboard')"><i class="ti ti-layout-dashboard"></i> Dashboard</div>
      <div class="sidebar-label">Operations</div>
      <div class="nav-item" onclick="sw('distributors-section',this,'Distributors')"><i class="ti ti-building-store"></i> Distributors</div>
      <div class="nav-item" onclick="sw('agents-section',this,'OMRs & Salesmen')"><i class="ti ti-id-badge-2"></i> OMRs & Salesmen</div>
      <div class="nav-item" onclick="sw('shops-section',this,'Shops')"><i class="ti ti-building"></i> Shops</div>
      <div class="nav-item" onclick="sw('stock-section',this,'Stock')"><i class="ti ti-package"></i> Stock Levels</div>
      <div class="nav-item" onclick="sw('dispatch-section',this,'Dispatch')"><i class="ti ti-truck-delivery"></i> Dispatch</div>
<<<<<<< HEAD
      <div class="nav-item" onclick="window.openTargetModal && window.openTargetModal()"><i class="ti ti-target"></i> Set Targets</div>
=======
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
      <div class="sidebar-label">Intelligence</div>
      <div class="nav-item" onclick="sw('products-section',this,'Products')"><i class="ti ti-box"></i> Products</div>
      <div class="nav-item" onclick="sw('reports-section',this,'Reports')"><i class="ti ti-chart-bar"></i> Reports</div>
      <div class="nav-item" onclick="sw('promotions-section',this,'Promotions')"><i class="ti ti-tag"></i> AVC Promotions</div>
      <div class="sidebar-label">Config</div>
      <div class="nav-item" onclick="sw('setup-section',this,'Setup')"><i class="ti ti-settings-2"></i> Setup</div>`;
  }
}

/* ═══ LOAD ALL DATA ══════════════════════════════════ */
async function loadAllData() {
  const role = currentUser?.role;
  try {
    if (role === 'super_admin') {
      const cRes = await api('GET','/companies');
      if (cRes) companies = cRes.data;
      renderSuperDashboard();
      renderCompanies();
    } else {
      const [dRes,aRes,pRes,sRes,dispRes,shRes,tRes,proRes,regRes] = await Promise.all([
        api('GET','/distributors'), api('GET','/agents'), api('GET','/products'),
        api('GET','/stock'), api('GET','/dispatches'), api('GET','/shops'),
        api('GET','/targets'), api('GET','/promotions'), api('GET','/regions'),
      ]);
      if (dRes)   distributors = dRes.data;
      if (aRes)   agents       = aRes.data;
      if (pRes)   products     = pRes.data;
      if (sRes)   stock        = sRes.data;
      if (dispRes)dispatches   = dispRes.data;
      if (shRes)  shops        = shRes.data;
      if (tRes)   targets      = tRes.data;
      if (proRes) promotions   = proRes.data;
      if (regRes) regions      = regRes.data;
      renderAll();
    }
  } catch(e) { toast('Data load error: '+e.message,'err'); }
}

function renderAll() {
  renderDashboard();
  renderDistributors();
  renderAgents();
  renderShops();
  renderStock();
  renderDispatch();
  renderReports();
  renderPromotions();
  renderSetup();
  renderProductCatalogue();
  refreshAllSelects();
}

/* ═══ STOCK HELPERS ═══════════════════════════════════ */
function getQty(distId, prodId) {
  const e = stock.find(s => (s.distributorId?._id||s.distributorId)===distId && (s.productId?._id||s.productId)===prodId);
  return e?.qty || 0;
}
function distStockVal(distId) {
  return products.reduce((s,p) => s + getQty(distId, p._id) * p.price, 0);
}
function agentStats(agentId) {
<<<<<<< HEAD
  if (!agentId) return { units:0, val:0, conf:0, pend:0 };
  const ds = dispatches.filter(d => String(d.agentId?._id||d.agentId) === String(agentId));
  const val  = ds.reduce((s,d) => s+(d.qty||0)*(d.price||0), 0);
  const conf = ds.filter(d=>d.confirmed).reduce((s,d) => s+(d.qty||0)*(d.price||0), 0);
  return { units: ds.reduce((s,d)=>s+(d.qty||0),0), val, conf, pend:val-conf };
}
function distId(d)     { return d?._id || d; }
function agentDistId(a){ 
  if (!a) return null;
  return a.distributorId?._id || a.distributorId || null; 
}
=======
  const ds = dispatches.filter(d => (d.agentId?._id||d.agentId) === agentId);
  const val  = ds.reduce((s,d) => s+d.qty*d.price, 0);
  const conf = ds.filter(d=>d.confirmed).reduce((s,d) => s+d.qty*d.price, 0);
  return { units: ds.reduce((s,d)=>s+d.qty,0), val, conf, pend:val-conf };
}
function distId(d)     { return d._id || d; }
function agentDistId(a){ return a.distributorId?._id || a.distributorId; }
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf

/* ═══ SUPER ADMIN DASHBOARD ══════════════════════════ */
function renderSuperDashboard() {
  const el = document.getElementById('super-dash-content');
  if (!el) return;
  const active    = companies.filter(c=>c.isActive).length;
  const suspended = companies.filter(c=>!c.isActive).length;
  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card blue"><div class="stat-icon"><i class="ti ti-buildings"></i></div><div class="stat-val">${companies.length}</div><div class="stat-label">Total Companies</div></div>
      <div class="stat-card green"><div class="stat-icon"><i class="ti ti-circle-check"></i></div><div class="stat-val">${active}</div><div class="stat-label">Active</div></div>
      <div class="stat-card red"><div class="stat-icon"><i class="ti ti-ban"></i></div><div class="stat-val">${suspended}</div><div class="stat-label">Suspended</div></div>
      <div class="stat-card violet"><div class="stat-icon"><i class="ti ti-users"></i></div><div class="stat-val">${companies.reduce((s,c)=>s+(c.userCount||0),0)}</div><div class="stat-label">Total Users</div></div>
    </div>
    <div class="company-grid">${companies.map((c,i)=>companyCardHTML(c,i)).join('')}</div>`;
}

function renderCompanies() {
  const el = document.getElementById('companies-list');
  if (!el) return;
  el.innerHTML = companies.map((c,i)=>companyCardHTML(c,i)).join('') || '<div class="empty">No companies yet. Create the first one.</div>';
}

function companyCardHTML(c, i) {
  const color = c.accentColor || gc(i);
  const planCls = PLAN_CLASS[c.plan] || 'plan-trial';
  return `
  <div class="company-card" onclick="superSwitchCompany('${c._id}','${c.name}','${c.accentColor||gc(i)}','${c.currency||'GH₵'}')">
    <div class="company-card-header">
      <div class="company-card-accent" style="background:linear-gradient(90deg,${color},transparent);"></div>
      <div class="company-logo" style="background:${color}20;color:${color};">${c.name.charAt(0)}</div>
      <div style="font-family:var(--font-head);font-size:17px;font-weight:700;color:var(--text1);">${c.name}</div>
      <div style="font-size:12px;color:var(--text2);margin-top:2px;">${c.industry||''} · ${c.country||''}</div>
      <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
        <span class="plan-badge ${planCls}">${c.plan}</span>
        ${!c.isActive?'<span class="badge badge-red">Suspended</span>':'<span class="badge badge-green">Active</span>'}
      </div>
      <div class="company-stat-row">
        <div class="company-stat"><div class="company-stat-val">${c.userCount||0}</div><div class="company-stat-lbl">Users</div></div>
      </div>
    </div>
    <div class="company-card-footer" onclick="event.stopPropagation()">
      <button class="btn btn-sm btn-cyan" onclick="openEditCompanyModal('${c._id}')"><i class="ti ti-edit"></i> Edit</button>
      ${c.isActive
        ? `<button class="btn btn-sm btn-red" onclick="suspendCompany('${c._id}')"><i class="ti ti-ban"></i> Suspend</button>`
        : `<button class="btn btn-sm btn-green" onclick="activateCompany('${c._id}')"><i class="ti ti-check"></i> Activate</button>`}
    </div>
  </div>`;
}

async function superSwitchCompany(id, name, color, currency) {
  // Super admin "views" a company — sets context and loads that company's data
  currentCompany = { _id:id, name, accentColor:color, currency };
  applyCompanyTheme(currentCompany);
  try {
    const [dRes,aRes,pRes,sRes,dispRes,shRes,proRes] = await Promise.all([
      api('GET',`/distributors?companyId=${id}`),
      api('GET',`/agents?companyId=${id}`),
      api('GET',`/products?companyId=${id}`),
      api('GET',`/stock?companyId=${id}`),
      api('GET',`/dispatches?companyId=${id}`),
      api('GET',`/shops?companyId=${id}`),
      api('GET',`/promotions?companyId=${id}`),
    ]);
    if(dRes)   distributors = dRes.data;
    if(aRes)   agents       = aRes.data;
    if(pRes)   products     = pRes.data;
    if(sRes)   stock        = sRes.data;
    if(dispRes)dispatches   = dispRes.data;
    if(shRes)  shops        = shRes.data;
    if(proRes) promotions   = proRes.data;
    // Switch to company view
    buildCompanySidebar();
    renderAll();
    sw('dashboard', null, 'Dashboard');
    document.querySelector('.nav-item')?.classList.add('active');
    toast(`Viewing ${name}`, 'info');
  } catch(e) { toast(e.message,'err'); }
}

function buildCompanySidebar() {
  const sb = document.getElementById('sidebar-nav');
  if (!sb) return;
  sb.innerHTML = `
    <div class="sidebar-label">Overview</div>
    <div class="nav-item active" onclick="sw('dashboard',this,'Dashboard')"><i class="ti ti-layout-dashboard"></i> Dashboard</div>
    <div class="nav-item" onclick="backToSuperAdmin()"><i class="ti ti-arrow-left"></i> ← All Companies</div>
    <div class="sidebar-label">Operations</div>
    <div class="nav-item" onclick="sw('distributors-section',this,'Distributors')"><i class="ti ti-building-store"></i> Distributors</div>
    <div class="nav-item" onclick="sw('agents-section',this,'OMRs & Salesmen')"><i class="ti ti-id-badge-2"></i> OMRs & Salesmen</div>
    <div class="nav-item" onclick="sw('shops-section',this,'Shops')"><i class="ti ti-building"></i> Shops</div>
    <div class="nav-item" onclick="sw('stock-section',this,'Stock')"><i class="ti ti-package"></i> Stock</div>
    <div class="nav-item" onclick="sw('dispatch-section',this,'Dispatch')"><i class="ti ti-truck-delivery"></i> Dispatch</div>
    <div class="sidebar-label">Intelligence</div>
    <div class="nav-item" onclick="sw('products-section',this,'Products')"><i class="ti ti-box"></i> Products</div>
    <div class="nav-item" onclick="sw('reports-section',this,'Reports')"><i class="ti ti-chart-bar"></i> Reports</div>
    <div class="nav-item" onclick="sw('promotions-section',this,'Promotions')"><i class="ti ti-tag"></i> AVC Promotions</div>`;
}

function backToSuperAdmin() {
  currentCompany = null;
  applyCompanyTheme(null);
  distributors=[]; agents=[]; products=[]; stock=[]; dispatches=[]; shops=[];
  buildSidebar();
  renderSuperDashboard();
  renderCompanies();
  sw('dashboard',null,'Master Dashboard');
  document.querySelector('#sidebar-nav .nav-item')?.classList.add('active');
}

/* ═══ DASHBOARD ══════════════════════════════════════ */
function renderDashboard() {
  const el = document.getElementById('dash-content');
  if (!el) return;
  const totalSV  = distributors.reduce((s,d)=>s+distStockVal(distId(d)),0);
  const totalDis = dispatches.reduce((s,d)=>s+d.qty*d.price,0);
  const totalCon = dispatches.filter(d=>d.confirmed).reduce((s,d)=>s+d.qty*d.price,0);
  const totalPen = totalDis-totalCon;
  const totalDebt= shops.reduce((s,sh)=>s+(sh.creditBalance||0),0);

  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card violet"><div class="stat-icon"><i class="ti ti-building-store"></i></div><div class="stat-val">${distributors.length}</div><div class="stat-label">Distributors</div></div>
      <div class="stat-card pink"><div class="stat-icon"><i class="ti ti-id-badge-2"></i></div><div class="stat-val">${agents.length}</div><div class="stat-label">OMRs & Salesmen</div></div>
      <div class="stat-card blue"><div class="stat-icon"><i class="ti ti-building"></i></div><div class="stat-val">${shops.length}</div><div class="stat-label">Shops</div></div>
      <div class="stat-card cyan"><div class="stat-icon"><i class="ti ti-package"></i></div><div class="stat-val">${fmt(totalSV)}</div><div class="stat-label">Total Stock Value</div></div>
      <div class="stat-card green"><div class="stat-icon"><i class="ti ti-circle-check"></i></div><div class="stat-val">${fmt(totalCon)}</div><div class="stat-label">Confirmed Sales</div></div>
      <div class="stat-card red"><div class="stat-icon"><i class="ti ti-credit-card"></i></div><div class="stat-val">${fmt(totalDebt)}</div><div class="stat-label">Credit in Trade</div></div>
    </div>
    <div id="dist-overview-cards">
      ${distributors.map((d,i)=>distOverviewCard(d,i)).join('') || '<div class="empty">No distributors yet. Go to Setup to add one.</div>'}
    </div>`;

  // Make overview cards clickable
  document.querySelectorAll('.dist-ov-card').forEach((card,i) => {
    const d = distributors[i];
    if (d) card.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      openDistDetail(d._id);
    });
  });
}

function distOverviewCard(d, i) {
  const dId = distId(d);
  const sv  = distStockVal(dId);
  const dis = dispatches.filter(x=>(x.distributorId?._id||x.distributorId)===dId).reduce((s,x)=>s+x.qty*x.price,0);
  const con = dispatches.filter(x=>(x.distributorId?._id||x.distributorId)===dId&&x.confirmed).reduce((s,x)=>s+x.qty*x.price,0);
  const pen = dis - con;
  const distAgents = agents.filter(a=>agentDistId(a)===dId);
  const distShops  = shops.filter(s=>(s.distributorId?._id||s.distributorId)===dId);
  const lowStock   = products.filter(p=>getQty(dId,p._id)<=10);
  const pct = dis>0 ? Math.min(100,Math.round(con/dis*100)) : 0;
  const pcolor = pct>=80?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
  return `
  <div class="card dist-ov-card" style="border-left:3px solid ${gc(i)};cursor:pointer;margin-bottom:14px;">
    <div class="flex-between">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="width:10px;height:10px;border-radius:50%;background:${gc(i)};box-shadow:0 0 8px ${gc(i)}60;"></div>
        <span style="font-family:var(--font-head);font-size:17px;font-weight:700;">${d.name}</span>
        <span class="badge ${TYPE_BADGE[d.type]||'badge-muted'}">${d.type||''}</span>
        <span class="badge badge-muted"><i class="ti ti-map-pin" style="font-size:9px;"></i> ${d.location||'—'}</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${distAgents.map(a=>`<span class="badge ${ROLE_BADGE[a.role]||'badge-muted'}">${a.name}</span>`).join('')}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:0;border:1px solid var(--border);border-radius:9px;overflow:hidden;margin:12px 0 0;">
      <div class="dist-metric"><div class="dist-metric-val col-cyan">${fmt(sv)}</div><div class="dist-metric-lbl">Stock Value</div></div>
      <div class="dist-metric"><div class="dist-metric-val col-violet">${fmt(dis)}</div><div class="dist-metric-lbl">Dispatched</div></div>
      <div class="dist-metric"><div class="dist-metric-val col-green">${fmt(con)}</div><div class="dist-metric-lbl">Confirmed</div></div>
      <div class="dist-metric"><div class="dist-metric-val ${pen>0?'col-red':'col-green'}">${fmt(pen)}</div><div class="dist-metric-lbl">Pending</div></div>
      <div class="dist-metric"><div class="dist-metric-val">${distAgents.length}</div><div class="dist-metric-lbl">Agents</div></div>
      <div class="dist-metric"><div class="dist-metric-val">${distShops.length}</div><div class="dist-metric-lbl">Shops</div></div>
    </div>
    ${lowStock.length?`<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:5px;">${lowStock.slice(0,5).map(p=>{const q=getQty(dId,p._id);return`<span class="badge ${q===0?'badge-red':'badge-amber'}">${p.name}: ${q===0?'OUT':q}</span>`;}).join('')}${lowStock.length>5?`<span class="badge badge-muted">+${lowStock.length-5} more</span>`:''}</div>`:''}
  </div>`;
}

/* ═══ DISTRIBUTORS PAGE ══════════════════════════════ */
function renderDistributors() {
  const el = document.getElementById('dist-cards');
  if (!el) return;
  el.innerHTML = distributors.map((d,i)=>`
    <div class="dist-card" onclick="openDistDetail('${d._id}')">
      <div class="dist-card-top">
        <div class="dist-card-stripe" style="background:linear-gradient(90deg,${gc(i)},transparent);"></div>
        <div style="font-family:var(--font-head);font-size:16px;font-weight:700;">${d.name}</div>
        <div style="margin-top:5px;display:flex;gap:5px;flex-wrap:wrap;">
          <span class="badge ${TYPE_BADGE[d.type]||'badge-muted'}">${d.type}</span>
          ${d.regionId?.name?`<span class="badge badge-muted">${d.regionId.name}</span>`:''}
        </div>
      </div>
      <div class="dist-card-body">
        ${d.location?`<div class="dist-info-row"><i class="ti ti-map-pin" style="color:${gc(i)};"></i>${d.location}</div>`:''}
        ${d.contact?`<div class="dist-info-row"><i class="ti ti-user" style="color:${gc(i)};"></i>${d.contact}</div>`:''}
        ${d.phone?`<div class="dist-info-row"><i class="ti ti-phone" style="color:${gc(i)};"></i>${d.phone}</div>`:''}
        ${d.email?`<div class="dist-info-row"><i class="ti ti-mail" style="color:${gc(i)};"></i>${d.email}</div>`:''}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--border);">
        <div class="dist-metric"><div class="dist-metric-val col-cyan">${fmt(distStockVal(d._id))}</div><div class="dist-metric-lbl">Stock</div></div>
        <div class="dist-metric"><div class="dist-metric-val">${agents.filter(a=>agentDistId(a)===d._id).length}</div><div class="dist-metric-lbl">Agents</div></div>
        <div class="dist-metric"><div class="dist-metric-val">${shops.filter(s=>(s.distributorId?._id||s.distributorId)===d._id).length}</div><div class="dist-metric-lbl">Shops</div></div>
      </div>
      <div class="dist-card-footer" onclick="event.stopPropagation()">
        <button class="btn btn-sm" onclick="openEditDistModal('${d._id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-sm btn-red" onclick="removeDist('${d._id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('') || '<div class="empty">No distributors yet.</div>';
}

/* ═══ AGENTS PAGE ════════════════════════════════════ */
function renderAgents() {
  const el = document.getElementById('agent-cards');
  if (!el) return;
  const search  = document.getElementById('agent-search')?.value.toLowerCase()||'';
  const sortBy  = document.getElementById('agent-sort')?.value||'name-asc';
  const distFlt = document.getElementById('agent-dist-filter')?.value||'';
  let list = agentFilter==='all'?[...agents]:agents.filter(a=>a.role===agentFilter);
  if (distFlt) list = list.filter(a=>agentDistId(a)===distFlt);
  if (search)  list = list.filter(a=>(a.name+a.phone+a.email).toLowerCase().includes(search));
  list.sort((a,b)=>{
    const sa=agentStats(a._id),sb=agentStats(b._id);
    switch(sortBy){
      case 'name-asc':  return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'role':      return a.role.localeCompare(b.role)||a.name.localeCompare(b.name);
      case 'val-desc':  return sb.val-sa.val;
      case 'pending':   return sb.pend-sa.pend;
      default: return 0;
    }
  });

  // Tab counts
  const bar = document.getElementById('agent-tab-bar');
  if (bar) bar.innerHTML = [['all','All'],['OMR','OMRs'],['Salesman','Salesmen']].map(([id,lbl])=>`
    <button class="tab-btn ${agentFilter===id?'active':''}" onclick="agentFilter='${id}';renderAgents();">${lbl} (${id==='all'?agents.length:agents.filter(a=>a.role===id).length})</button>`).join('');

  el.innerHTML = list.map((a,idx)=>{
    const dist = distributors.find(d=>d._id===agentDistId(a));
    const s    = agentStats(a._id);
    const agentShops = shops.filter(sh=>(sh.assignedAgent?._id||sh.assignedAgent)===a._id);
    return `
    <div class="agent-card" style="cursor:pointer;" onclick="openAgentDetail('${a._id}')">
      <div class="agent-card-top" style="border-top:2px solid ${gc(idx)};">
        <div class="agent-avatar" style="background:${gb(idx)};color:${gc(idx)};"><i class="ti ${a.role==='OMR'?'ti-id-badge-2':'ti-user-check'}"></i></div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--font-head);font-size:15px;font-weight:700;">${a.name}</div>
          <div style="margin-top:3px;display:flex;gap:4px;flex-wrap:wrap;">
            <span class="badge ${ROLE_BADGE[a.role]||'badge-muted'}">${a.role}</span>
            ${dist?`<span class="badge badge-muted">${dist.name}</span>`:''}
            <span class="badge badge-muted">${agentShops.length} shops</span>
          </div>
        </div>
        <button class="btn btn-sm" onclick="event.stopPropagation();openEditAgentModal('${a._id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-sm btn-red" onclick="event.stopPropagation();removeAgent('${a._id}')"><i class="ti ti-trash"></i></button>
      </div>
      <div class="agent-card-info">
        ${a.phone?`<div class="agent-info-row"><i class="ti ti-phone" style="color:${gc(idx)};"></i>${a.phone}</div>`:''}
        ${a.email?`<div class="agent-info-row"><i class="ti ti-mail" style="color:${gc(idx)};"></i>${a.email}</div>`:''}
        ${a.address?`<div class="agent-info-row"><i class="ti ti-home" style="color:${gc(idx)};"></i>${a.address}</div>`:''}
      </div>
      <div class="agent-stats">
        <div class="agent-stat"><div class="agent-stat-val col-violet">${s.units}</div><div class="agent-stat-lbl">Units</div></div>
        <div class="agent-stat"><div class="agent-stat-val col-amber">${fmt(s.val)}</div><div class="agent-stat-lbl">Value</div></div>
        <div class="agent-stat"><div class="agent-stat-val col-green">${fmt(s.conf)}</div><div class="agent-stat-lbl">Conf.</div></div>
        <div class="agent-stat"><div class="agent-stat-val ${s.pend>0?'col-red':'col-green'}">${fmt(s.pend)}</div><div class="agent-stat-lbl">Pend.</div></div>
      </div>
    </div>`;
  }).join('') || '<div class="empty">No agents match this filter.</div>';
}

/* ═══ SHOPS PAGE ═════════════════════════════════════ */
function renderShops() {
  const el = document.getElementById('shop-cards');
  if (!el) return;
  const distFlt  = document.getElementById('shop-dist-filter')?.value||'';
  const agentFlt = document.getElementById('shop-agent-filter')?.value||'';
  const search   = document.getElementById('shop-search')?.value.toLowerCase()||'';
  let list = shops.filter(s=>s.isActive!==false);
  if (distFlt)  list = list.filter(s=>(s.distributorId?._id||s.distributorId)===distFlt);
  if (agentFlt) list = list.filter(s=>(s.assignedAgent?._id||s.assignedAgent)===agentFlt);
  if (search)   list = list.filter(s=>(s.name+s.ownerName+s.locationName).toLowerCase().includes(search));

  const totalDebt = list.reduce((s,sh)=>s+(sh.creditBalance||0),0);

  el.innerHTML = `
    ${totalDebt>0?`<div style="padding:10px 14px;background:rgba(255,82,82,.08);border:1px solid rgba(255,82,82,.2);border-radius:9px;margin-bottom:14px;font-size:13px;color:var(--red);"><i class="ti ti-credit-card"></i> Total credit in trade for filtered shops: <strong>${fmt(totalDebt)}</strong></div>`:''}
    <div class="shop-grid">
    ${list.map((sh,i)=>{
      const dist  = distributors.find(d=>d._id===(sh.distributorId?._id||sh.distributorId));
      const agent = agents.find(a=>a._id===(sh.assignedAgent?._id||sh.assignedAgent));
      return `
      <div class="shop-card">
        <div class="shop-card-header">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="font-weight:700;font-size:14px;">${sh.name}</div>
            ${(sh.creditBalance||0)>0?`<span class="shop-debt"><i class="ti ti-credit-card" style="font-size:10px;"></i>${fmt(sh.creditBalance)}</span>`:'<span class="badge badge-green" style="font-size:9px;">Clear</span>'}
          </div>
          <div style="font-size:12px;color:var(--text2);margin-top:3px;">${sh.locationName||sh.address||'—'}</div>
        </div>
        <div class="shop-card-body">
          ${sh.ownerName?`<div style="font-size:12px;color:var(--text2);margin-bottom:3px;"><i class="ti ti-user" style="font-size:11px;"></i> ${sh.ownerName}</div>`:''}
          ${sh.ownerContact?`<div style="font-size:12px;color:var(--text2);margin-bottom:3px;"><i class="ti ti-phone" style="font-size:11px;"></i> ${sh.ownerContact}</div>`:''}
          <div style="margin-top:7px;display:flex;gap:5px;flex-wrap:wrap;">
            ${dist?`<span class="badge badge-muted" style="font-size:9px;">${dist.name}</span>`:''}
            ${agent?`<span class="badge ${ROLE_BADGE[agent.role]||'badge-muted'}" style="font-size:9px;">${agent.name}</span>`:''}
            ${sh.avcTier&&sh.avcTier!=='none'?`<span class="badge badge-${sh.avcTier}">AVC ${sh.avcTier.toUpperCase()}</span>`:''}
          </div>
        </div>
        <div style="padding:8px 16px;border-top:1px solid var(--border);display:flex;gap:6px;justify-content:flex-end;">
          <button class="btn btn-sm" onclick="openEditShopModal('${sh._id}')"><i class="ti ti-edit"></i></button>
          <button class="btn btn-sm btn-red" onclick="removeShop('${sh._id}')"><i class="ti ti-trash"></i></button>
        </div>
      </div>`;
    }).join('')}
    </div>` || '<div class="empty">No shops match this filter.</div>';
}

/* ═══ STOCK PAGE ═════════════════════════════════════ */
function renderStock() {
  const el = document.getElementById('dist-stock-tables');
  if (!el) return;
  el.innerHTML = distributors.map((d,i)=>{
    const dId = distId(d);
    const rows = products.map(p=>{
      const qty = getQty(dId,p._id);
      const cls = qty===0?'col-red':qty<=p.minAgentQty&&p.minAgentQty>0?'col-amber':'col-green';
      return `<tr>
        <td class="fw700">${p.name}</td>
        <td><span class="badge badge-muted">${p.cat}</span></td>
        ${p.isTop10?`<td><span class="badge badge-amber">#${p.top10Rank}</span></td>`:'<td>—</td>'}
        <td><span class="${cls} fw700">${qty}</span></td>
        <td>${fmt(qty*p.price)}</td>
        <td><div style="display:flex;gap:5px;align-items:center;">
          <input type="number" min="0" value="${qty}" id="sq_${dId}_${p._id}" style="width:68px;">
          <button class="btn btn-sm btn-cyan" onclick="saveStock('${dId}','${p._id}')">Save</button>
        </div></td>
      </tr>`;
    }).join('');
    return `<div class="card" style="border-left:3px solid ${gc(i)};">
      <div class="flex-between">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-family:var(--font-head);font-size:16px;font-weight:700;">${d.name}</span>
          <span class="badge badge-muted">${d.location||''}</span>
          <span class="badge badge-cyan">Value: ${fmt(distStockVal(dId))}</span>
        </div>
        <button class="btn btn-sm btn-amber" onclick="openImportModal('${dId}','${d.name}')"><i class="ti ti-file-import"></i> Import Excel</button>
      </div>
      <div class="table-wrap" style="margin-top:12px;">
        <table><thead><tr><th>Product</th><th>Category</th><th>Top 10</th><th>Qty</th><th>Value</th><th>Update</th></tr></thead>
        <tbody>${rows}</tbody></table>
      </div>
    </div>`;
  }).join('') || '<div class="empty">No distributors set up yet.</div>';
}

async function saveStock(distId, prodId) {
  const el  = document.getElementById(`sq_${distId}_${prodId}`);
  const qty = parseInt(el.value)||0;
  try {
    await api('PUT',`/stock/${distId}/${prodId}`,{qty});
    const idx = stock.findIndex(s=>(s.distributorId?._id||s.distributorId)===distId&&(s.productId?._id||s.productId)===prodId);
    if (idx>=0) stock[idx].qty=qty; else stock.push({distributorId:distId,productId:prodId,qty});
    toast('Stock updated','ok');
    renderStock(); renderDashboard();
  } catch(e) { toast(e.message,'err'); }
}

/* ═══ DISPATCH PAGE ══════════════════════════════════ */
function renderDispatch() {
  const tbody = document.getElementById('dispatch-tbody');
  if (!tbody) return;
  const fDist  = document.getElementById('f-dist')?.value||'';
  const fAgent = document.getElementById('f-agent')?.value||'';
  const fDate  = document.getElementById('f-date')?.value||'';
  let list = dispatches.filter(d=>
    (!fDist  || (d.distributorId?._id||d.distributorId)===fDist)&&
    (!fAgent || (d.agentId?._id||d.agentId)===fAgent)&&
    (!fDate  || d.date===fDate)
  ).sort((a,b)=>b.date.localeCompare(a.date));
  let tq=0,tv=0;
  tbody.innerHTML = list.map(e=>{
    const dist  = e.distributorId?.name  || distributors.find(d=>d._id===(e.distributorId?._id||e.distributorId))?.name||'—';
    const agent = e.agentId?.name  || agents.find(a=>a._id===(e.agentId?._id||e.agentId))?.name||'—';
    const role  = e.agentId?.role  || agents.find(a=>a._id===(e.agentId?._id||e.agentId))?.role||'';
    const prod  = e.productId?.name|| products.find(p=>p._id===(e.productId?._id||e.productId))?.name||'—';
    const v = e.qty*e.price; tq+=e.qty; tv+=v;
    return `<tr>
      <td>${e.date}</td>
      <td><span class="badge badge-violet">${dist}</span></td>
      <td class="fw700">${agent}</td>
      <td><span class="badge ${ROLE_BADGE[role]||'badge-muted'}">${role}</span></td>
      <td>${prod}</td><td class="fw700">${e.qty}</td>
      <td class="fw700 col-cyan">${fmt(v)}</td>
      <td>${e.confirmed?'<span class="badge badge-green">Confirmed</span>':'<span class="badge badge-amber">Pending</span>'}</td>
      <td style="display:flex;gap:4px;">
        ${!e.confirmed?`<button class="btn btn-sm btn-green" onclick="confirmDispatch('${e._id}')"><i class="ti ti-check"></i></button>`:''}
        <button class="btn btn-sm btn-red" onclick="deleteDispatch('${e._id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
  const tqEl=document.getElementById('dl-tot-qty');
  const tvEl=document.getElementById('dl-tot-val');
  if(tqEl) tqEl.textContent=tq;
  if(tvEl) tvEl.textContent=fmt(tv);
  document.getElementById('dispatch-empty').style.display=list.length?'none':'block';
}

async function addDispatch() {
  const date  = document.getElementById('d-date').value;
  const distId= document.getElementById('d-dist').value;
  const agentId=document.getElementById('d-agent').value;
  const prodId= document.getElementById('d-product').value;
  const qty   = parseInt(document.getElementById('d-qty').value);
  const price = parseFloat(document.getElementById('d-price').value);
  if (!date||!distId||!agentId||!prodId||!qty||!price){ toast('Fill all fields','err'); return; }
  try {
    const data = await api('POST','/dispatches',{date,distributorId:distId,agentId,productId:prodId,qty,price});
    if (!data) return;
    dispatches.push(data.data);
    document.getElementById('d-qty').value='';
    renderDispatch(); renderDashboard();
    toast('Dispatch logged','ok');
  } catch(e){ toast(e.message,'err'); }
}
async function confirmDispatch(id){
  try{
    await api('PATCH',`/dispatches/${id}/confirm`);
    const d=dispatches.find(x=>x._id===id);if(d)d.confirmed=true;
    renderDispatch();renderDashboard();toast('Confirmed','ok');
  }catch(e){toast(e.message,'err');}
}
async function deleteDispatch(id){
  if(!confirm('Delete this dispatch?'))return;
  try{
    await api('DELETE',`/dispatches/${id}`);
    dispatches=dispatches.filter(x=>x._id!==id);
    renderDispatch();renderDashboard();toast('Deleted','info');
  }catch(e){toast(e.message,'err');}
}
function filterAgentsByDist(){
  const dv=document.getElementById('d-dist')?.value;
  const sel=document.getElementById('d-agent');if(!sel)return;
  sel.innerHTML='';
  const list=dv?agents.filter(a=>agentDistId(a)===dv):agents;
  list.forEach(a=>sel.add(new Option(`${a.name} (${a.role})`,a._id)));
}
function autofillPrice(){
  const p=products.find(x=>x._id===document.getElementById('d-product')?.value);
  if(p)document.getElementById('d-price').value=p.price;
}

/* ═══ REPORTS ════════════════════════════════════════ */
function renderReports() {
  const el = document.getElementById('rep-content');
  if (!el) return;
  const period   = document.getElementById('rep-period')?.value||'month';
  const repAgent = document.getElementById('rep-agent')?.value||'';
  const repDist  = document.getElementById('rep-dist')?.value||'';
  const now = new Date();

  function inPeriod(e){
    const d=new Date(e.date);
    if(period==='week'){const s=new Date(now);s.setDate(now.getDate()-now.getDay()+1);const en=new Date(s);en.setDate(s.getDate()+6);return d>=s&&d<=en;}
    if(period==='month')return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    return true;
  }

  let filtered = dispatches.filter(e=>inPeriod(e)&&
    (!repAgent||(e.agentId?._id||e.agentId)===repAgent)&&
    (!repDist||(e.distributorId?._id||e.distributorId)===repDist));

  const units=filtered.reduce((s,e)=>s+e.qty,0);
  const val  =filtered.reduce((s,e)=>s+e.qty*e.price,0);
  const conf =filtered.filter(e=>e.confirmed).reduce((s,e)=>s+e.qty*e.price,0);

  const aMap={};
  filtered.forEach(e=>{
    const aid=e.agentId?._id||e.agentId;
    if(!aMap[aid])aMap[aid]={qty:0,val:0,conf:0,pend:0};
    aMap[aid].qty+=e.qty;aMap[aid].val+=e.qty*e.price;
    if(e.confirmed)aMap[aid].conf+=e.qty*e.price;else aMap[aid].pend+=e.qty*e.price;
  });

  const agentRows=Object.entries(aMap).map(([aid,s])=>{
    const a=agents.find(x=>x._id===aid);
    const dist=distributors.find(d=>d._id===agentDistId(a));
    return`<tr><td class="fw700">${a?.name||'—'}</td><td><span class="badge ${ROLE_BADGE[a?.role]||'badge-muted'}">${a?.role||'—'}</span></td><td>${dist?.name||'—'}</td><td class="fw700">${s.qty}</td><td class="col-cyan fw700">${fmt(s.val)}</td><td class="col-green fw700">${fmt(s.conf)}</td><td class="${s.pend>0?'col-red':'col-green'} fw700">${fmt(s.pend)}</td></tr>`;
  }).join('');

  el.innerHTML = `
    <div class="stat-grid" style="margin-bottom:14px;">
      <div class="stat-card violet"><div class="stat-icon"><i class="ti ti-package"></i></div><div class="stat-val">${units}</div><div class="stat-label">Units Moved</div></div>
      <div class="stat-card amber"><div class="stat-icon"><i class="ti ti-cash"></i></div><div class="stat-val">${fmt(val)}</div><div class="stat-label">Total Value</div></div>
      <div class="stat-card green"><div class="stat-icon"><i class="ti ti-circle-check"></i></div><div class="stat-val">${fmt(conf)}</div><div class="stat-label">Confirmed</div></div>
      <div class="stat-card red"><div class="stat-icon"><i class="ti ti-clock"></i></div><div class="stat-val">${fmt(val-conf)}</div><div class="stat-label">Pending</div></div>
    </div>
    <div class="card">
      <div class="card-title"><i class="ti ti-users"></i> Agent Breakdown</div>
      ${agentRows?`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Distributor</th><th>Units</th><th>Value</th><th>Confirmed</th><th>Pending</th></tr></thead><tbody>${agentRows}</tbody></table></div>`:'<div class="empty">No data for this period.</div>'}
    </div>`;
}

/* ═══ PROMOTIONS ═════════════════════════════════════ */
function renderPromotions() {
  const el = document.getElementById('promos-content');
  if (!el) return;
  if (!promotions.length) { el.innerHTML='<div class="empty">No promotions set up yet. Click "New Promotion" to create one.</div>'; return; }
  el.innerHTML = promotions.map(p=>`
    <div class="card">
      <div class="flex-between">
        <div>
          <div style="font-family:var(--font-head);font-size:17px;font-weight:700;">${p.name} <span class="badge badge-muted" style="font-size:10px;">${p.code}</span></div>
          <div style="font-size:12px;color:var(--text2);margin-top:3px;">${p.description||''} ${p.startDate?`· ${p.startDate} → ${p.endDate||'ongoing'}`:''}</div>
        </div>
        <div style="display:flex;gap:7px;">
          <button class="btn btn-sm" onclick="openEditPromoModal('${p._id}')"><i class="ti ti-edit"></i></button>
          <button class="btn btn-sm btn-red" onclick="removePromo('${p._id}')"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      <div class="avc-grid" style="margin-top:14px;">
        ${(p.tiers||[]).map(t=>`
          <div class="avc-card ${t.name.toLowerCase()}">
            <div class="avc-tier-name" style="color:${t.color||'var(--amber)'};">${t.name}</div>
            <div style="font-size:12px;color:var(--text2);margin-top:4px;">Min spend: <strong style="color:var(--text1);">${fmt(t.minSpend)}</strong></div>
            <div style="font-size:12px;color:var(--text2);">Reward: <strong style="color:${t.color||'var(--amber)'};">${fmt(t.rewardValue)}</strong> gift voucher</div>
            <div style="font-size:11px;color:var(--text3);margin-top:4px;">Duration: ${t.durationMonths} month${t.durationMonths!==1?'s':''}</div>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

/* ═══ SETUP ══════════════════════════════════════════ */
function renderSetup() {
  // Distributor list
  const dl = document.getElementById('setup-dist-list');
  if (dl) dl.innerHTML = distributors.map((d,i)=>`
    <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);">
      <div style="width:8px;height:8px;border-radius:50%;background:${gc(i)};flex-shrink:0;"></div>
      <span style="font-size:13px;font-weight:600;flex:1;">${d.name}</span>
      <span class="badge badge-muted" style="font-size:9px;">${d.location||''}</span>
      <button class="btn btn-sm" onclick="openEditDistModal('${d._id}')"><i class="ti ti-edit"></i></button>
      <button class="btn btn-sm btn-red" onclick="removeDist('${d._id}')"><i class="ti ti-trash"></i></button>
    </div>`).join('') || '<div class="empty" style="padding:10px;">None yet.</div>';

  // Agent list
  const al = document.getElementById('setup-agent-list');
  if (al) al.innerHTML = agents.map(a=>{
    const dist=distributors.find(d=>d._id===agentDistId(a));
    return`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:13px;font-weight:600;flex:1;">${a.name}</span>
      <span class="badge ${ROLE_BADGE[a.role]||'badge-muted'}">${a.role}</span>
      <span style="font-size:11px;color:var(--text2);">${dist?.name||'—'}</span>
      <button class="btn btn-sm" onclick="openEditAgentModal('${a._id}')"><i class="ti ti-edit"></i></button>
      <button class="btn btn-sm btn-red" onclick="removeAgent('${a._id}')"><i class="ti ti-trash"></i></button>
    </div>`;}).join('') || '<div class="empty" style="padding:10px;">None yet.</div>';

  // Product list
  const pl = document.getElementById('setup-prod-list');
  if (pl) pl.innerHTML = products.map(p=>`
    <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);">
      ${p.imageUrl?`<img src="${p.imageUrl}" style="width:32px;height:32px;object-fit:cover;border-radius:5px;flex-shrink:0;" onerror="this.style.display='none'">`:'<div style="width:32px;height:32px;background:var(--bg3);border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;"><i class="ti ti-box" style="font-size:14px;color:var(--text3);"></i></div>'}
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:700;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
        <div style="font-size:10px;color:var(--text3);">${sizeLabel(p)||p.cat} · ${p.pcsPerPack||1}pcs/Pk · ${p.pcsPerCarton||1}pcs/Ctn</div>
      </div>
      <span class="badge badge-muted" style="font-size:9px;">${p.cat}</span>
      ${p.isTop10?`<span class="badge badge-amber" style="font-size:9px;">#${p.top10Rank}</span>`:''}
      <span class="col-amber" style="font-size:11px;font-family:var(--font-mono);">${fmt(p.price)}</span>
      <button class="btn btn-sm" onclick="openEditProductModal('${p._id}')"><i class="ti ti-edit"></i></button>
      <button class="btn btn-sm btn-red" onclick="removeProd('${p._id}')"><i class="ti ti-trash"></i></button>
    </div>`).join('') || '<div class="empty" style="padding:10px;">None yet.</div>';
}

/* ═══ CRUD — ADD ═════════════════════════════════════ */
async function addDistributor(){
  const name=document.getElementById('s-dist-name').value.trim();
  if(!name){toast('Name required','err');return;}
  try{
    const data=await api('POST','/distributors',{
      name, type:document.getElementById('s-dist-type').value,
      location:document.getElementById('s-dist-loc').value.trim(),
      address:document.getElementById('s-dist-addr').value.trim(),
      contact:document.getElementById('s-dist-contact').value.trim(),
      phone:document.getElementById('s-dist-phone').value.trim(),
      email:document.getElementById('s-dist-email').value.trim(),
      whatsapp:document.getElementById('s-dist-wa').value.trim(),
      regionId:document.getElementById('s-dist-region').value||undefined,
    });
    if(!data)return;
    distributors.push(data.data);
    ['s-dist-name','s-dist-loc','s-dist-addr','s-dist-contact','s-dist-phone','s-dist-email','s-dist-wa'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    renderAll(); toast('Distributor added','ok');
  }catch(e){toast(e.message,'err');}
}

async function addAgent(){
  const name=document.getElementById('s-agent-name').value.trim();
  const distId=document.getElementById('s-agent-dist').value;
  if(!name||!distId){toast('Name and distributor required','err');return;}
  try{
    const data=await api('POST','/agents',{
      name, role:document.getElementById('s-agent-role').value,
      distributorId:distId,
      phone:document.getElementById('s-agent-phone').value.trim(),
      email:document.getElementById('s-agent-email').value.trim(),
      address:document.getElementById('s-agent-addr').value.trim(),
      whatsapp:document.getElementById('s-agent-wa').value.trim(),
      emergency:document.getElementById('s-agent-emergency').value.trim(),
    });
    if(!data)return;
    agents.push(data.data);
    ['s-agent-name','s-agent-phone','s-agent-email','s-agent-addr','s-agent-wa','s-agent-emergency'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    renderAll(); toast('Agent added','ok');
  }catch(e){toast(e.message,'err');}
}

async function addProduct(){
  const name  = document.getElementById('s-prod-name').value.trim();
  const price = parseFloat(document.getElementById('s-prod-price').value);
  if (!name)          { toast('Product name is required','err'); return; }
  if (!price||price<=0){ toast('Valid unit price is required','err'); return; }
  const ppp = parseInt(document.getElementById('s-prod-pcsPerPack')?.value)||1;
  const ppc = parseInt(document.getElementById('s-prod-packsPerCtn')?.value)||1;
  try {
    const data = await api('POST','/products',{
      name,
      cat:           document.getElementById('s-prod-cat').value.trim()||'General',
      sizeValue:     parseFloat(document.getElementById('s-prod-size').value)||0,
      sizeUnit:      document.getElementById('s-prod-size-unit')?.value||'ml',
      imageUrl:      document.getElementById('s-prod-img')?.value.trim()||undefined,
      price,
      pcsPerPack:    ppp,
      packsPerCarton:ppc,
      pcsPerCarton:  ppp*ppc,
      isTop10:       document.getElementById('s-prod-top10').checked,
      top10Rank:     parseInt(document.getElementById('s-prod-rank').value)||undefined,
      minAgentQty:   parseInt(document.getElementById('s-prod-minAgent').value)||0,
      minShopQty:    parseInt(document.getElementById('s-prod-minShop').value)||0,
    });
    if (!data) return;
    products.push(data.data);
    ['s-prod-name','s-prod-cat','s-prod-size','s-prod-price','s-prod-rank',
     's-prod-minAgent','s-prod-minShop','s-prod-img'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.value='';
    });
    document.getElementById('s-prod-top10').checked = false;
    const pw = document.getElementById('s-prod-img-preview');
    if (pw) pw.style.display = 'none';
    if (document.getElementById('s-prod-pcsPerPack'))  document.getElementById('s-prod-pcsPerPack').value  = 6;
    if (document.getElementById('s-prod-packsPerCtn')) document.getElementById('s-prod-packsPerCtn').value = 5;
    updatePkgSummary();
    renderAll(); renderProductCatalogue();
    toast('Product added','ok');
  } catch(e){ toast(e.message,'err'); }
}

async function addShop(){
  const name=document.getElementById('s-shop-name').value.trim();
  const distId=document.getElementById('s-shop-dist').value;
  if(!name||!distId){toast('Name and distributor required','err');return;}
  try{
    const data=await api('POST','/shops',{
      name, distributorId:distId,
      assignedAgent:document.getElementById('s-shop-agent').value||undefined,
      ownerName:document.getElementById('s-shop-owner').value.trim(),
      ownerContact:document.getElementById('s-shop-contact').value.trim(),
      ownerWhatsapp:document.getElementById('s-shop-wa').value.trim(),
      address:document.getElementById('s-shop-addr').value.trim(),
      locationName:document.getElementById('s-shop-loc').value.trim(),
      avcTier:document.getElementById('s-shop-avc').value,
    });
    if(!data)return;
    shops.push(data.data);
    ['s-shop-name','s-shop-owner','s-shop-contact','s-shop-wa','s-shop-addr','s-shop-loc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    renderAll(); toast('Shop added','ok');
  }catch(e){toast(e.message,'err');}
}

/* ═══ CRUD — REMOVE ══════════════════════════════════ */
async function removeDist(id){if(!confirm('Remove distributor?'))return;try{await api('DELETE',`/distributors/${id}`);distributors=distributors.filter(d=>d._id!==id);renderAll();toast('Removed','info');}catch(e){toast(e.message,'err');}}
async function removeAgent(id){if(!confirm('Remove agent?'))return;try{await api('DELETE',`/agents/${id}`);agents=agents.filter(a=>a._id!==id);renderAll();toast('Removed','info');}catch(e){toast(e.message,'err');}}
async function removeProd(id){if(!confirm('Remove product?'))return;try{await api('DELETE',`/products/${id}`);products=products.filter(p=>p._id!==id);renderAll();toast('Removed','info');}catch(e){toast(e.message,'err');}}
async function removeShop(id){if(!confirm('Remove shop?'))return;try{await api('DELETE',`/shops/${id}`);shops=shops.filter(s=>s._id!==id);renderAll();toast('Removed','info');}catch(e){toast(e.message,'err');}}
async function removePromo(id){if(!confirm('Remove promotion?'))return;try{await api('DELETE',`/promotions/${id}`);promotions=promotions.filter(p=>p._id!==id);renderPromotions();toast('Removed','info');}catch(e){toast(e.message,'err');}}

/* ═══ SELECTS REFRESH ════════════════════════════════ */
function refreshAllSelects(){
  // Distributor selects
  ['d-dist','f-dist','rep-dist','s-dist-region','s-agent-dist','s-shop-dist','shop-dist-filter','edit-agent-dist','edit-shop-dist'].forEach(id=>{
    const sel=document.getElementById(id);if(!sel)return;
    const cur=sel.value;
    const isFilter=id.startsWith('f')||id.startsWith('rep')||id.startsWith('shop-dist')||id==='s-dist-region';
    while(sel.options.length>(isFilter?1:0)) sel.remove(isFilter?1:sel.options.length-1);
    if(id==='s-dist-region') regions.forEach(r=>sel.add(new Option(r.name,r._id)));
    else distributors.forEach(d=>sel.add(new Option(d.name,d._id)));
    if(cur)sel.value=cur;
  });
  // Agent selects
  ['f-agent','rep-agent','s-shop-agent','shop-agent-filter','edit-shop-agent','agent-dist-filter'].forEach(id=>{
    const sel=document.getElementById(id);if(!sel)return;
    const cur=sel.value;
    while(sel.options.length>1)sel.remove(1);
    agents.forEach(a=>sel.add(new Option(`${a.name} (${a.role})`,a._id)));
    if(cur)sel.value=cur;
  });
  // Product select
  const dp=document.getElementById('d-product');
  if(dp){const cur=dp.value;while(dp.options.length)dp.remove(0);products.forEach(p=>dp.add(new Option(p.name,p._id)));if(cur)dp.value=cur;}
  filterAgentsByDist();
}

/* ═══ EDIT MODALS ════════════════════════════════════ */
function openEditDistModal(id){
  const d=distributors.find(x=>x._id===id);if(!d)return;
  document.getElementById('edit-dist-id').value=d._id;
  document.getElementById('edit-dist-name').value=d.name||'';
  document.getElementById('edit-dist-type').value=d.type||'Distributor';
  document.getElementById('edit-dist-loc').value=d.location||'';
  document.getElementById('edit-dist-addr').value=d.address||'';
  document.getElementById('edit-dist-contact').value=d.contact||'';
  document.getElementById('edit-dist-phone').value=d.phone||'';
  document.getElementById('edit-dist-email').value=d.email||'';
  document.getElementById('edit-dist-wa').value=d.whatsapp||'';
  openModal('edit-dist-modal');
}
async function saveEditDist(){
  const id=document.getElementById('edit-dist-id').value;
  try{
    const data=await api('PUT',`/distributors/${id}`,{
      name:document.getElementById('edit-dist-name').value.trim(),
      type:document.getElementById('edit-dist-type').value,
      location:document.getElementById('edit-dist-loc').value.trim(),
      address:document.getElementById('edit-dist-addr').value.trim(),
      contact:document.getElementById('edit-dist-contact').value.trim(),
      phone:document.getElementById('edit-dist-phone').value.trim(),
      email:document.getElementById('edit-dist-email').value.trim(),
      whatsapp:document.getElementById('edit-dist-wa').value.trim(),
    });
    if(!data)return;
    const idx=distributors.findIndex(d=>d._id===id);if(idx>=0)distributors[idx]=data.data;
    closeModal('edit-dist-modal');renderAll();toast('Updated','ok');
  }catch(e){toast(e.message,'err');}
}

function openEditAgentModal(id){
  const a=agents.find(x=>x._id===id);if(!a)return;
  document.getElementById('edit-agent-id').value=a._id;
  document.getElementById('edit-agent-name').value=a.name||'';
  document.getElementById('edit-agent-role').value=a.role||'Salesman';
  document.getElementById('edit-agent-phone').value=a.phone||'';
  document.getElementById('edit-agent-email').value=a.email||'';
  document.getElementById('edit-agent-addr').value=a.address||'';
  document.getElementById('edit-agent-wa').value=a.whatsapp||'';
  document.getElementById('edit-agent-emergency').value=a.emergency||'';
  refreshAllSelects();
  document.getElementById('edit-agent-dist').value=agentDistId(a)||'';
  openModal('edit-agent-modal');
}
async function saveEditAgent(){
  const id=document.getElementById('edit-agent-id').value;
  try{
    const data=await api('PUT',`/agents/${id}`,{
      name:document.getElementById('edit-agent-name').value.trim(),
      role:document.getElementById('edit-agent-role').value,
      distributorId:document.getElementById('edit-agent-dist').value,
      phone:document.getElementById('edit-agent-phone').value.trim(),
      email:document.getElementById('edit-agent-email').value.trim(),
      address:document.getElementById('edit-agent-addr').value.trim(),
      whatsapp:document.getElementById('edit-agent-wa').value.trim(),
      emergency:document.getElementById('edit-agent-emergency').value.trim(),
    });
    if(!data)return;
    const idx=agents.findIndex(a=>a._id===id);if(idx>=0)agents[idx]=data.data;
    closeModal('edit-agent-modal');renderAll();toast('Updated','ok');
  }catch(e){toast(e.message,'err');}
}

function openEditShopModal(id){
  const sh=shops.find(x=>x._id===id);if(!sh)return;
  document.getElementById('edit-shop-id').value=sh._id;
  document.getElementById('edit-shop-name').value=sh.name||'';
  document.getElementById('edit-shop-owner').value=sh.ownerName||'';
  document.getElementById('edit-shop-contact').value=sh.ownerContact||'';
  document.getElementById('edit-shop-wa').value=sh.ownerWhatsapp||'';
  document.getElementById('edit-shop-addr').value=sh.address||'';
  document.getElementById('edit-shop-loc').value=sh.locationName||'';
  document.getElementById('edit-shop-avc').value=sh.avcTier||'none';
  document.getElementById('edit-shop-credit').value=sh.creditBalance||0;
  refreshAllSelects();
  document.getElementById('edit-shop-dist').value=sh.distributorId?._id||sh.distributorId||'';
  document.getElementById('edit-shop-agent').value=sh.assignedAgent?._id||sh.assignedAgent||'';
  openModal('edit-shop-modal');
}
async function saveEditShop(){
  const id=document.getElementById('edit-shop-id').value;
  try{
    const data=await api('PUT',`/shops/${id}`,{
      name:document.getElementById('edit-shop-name').value.trim(),
      distributorId:document.getElementById('edit-shop-dist').value,
      assignedAgent:document.getElementById('edit-shop-agent').value||undefined,
      ownerName:document.getElementById('edit-shop-owner').value.trim(),
      ownerContact:document.getElementById('edit-shop-contact').value.trim(),
      ownerWhatsapp:document.getElementById('edit-shop-wa').value.trim(),
      address:document.getElementById('edit-shop-addr').value.trim(),
      locationName:document.getElementById('edit-shop-loc').value.trim(),
      avcTier:document.getElementById('edit-shop-avc').value,
      creditBalance:parseFloat(document.getElementById('edit-shop-credit').value)||0,
    });
    if(!data)return;
    const idx=shops.findIndex(s=>s._id===id);if(idx>=0)shops[idx]=data.data;
    closeModal('edit-shop-modal');renderAll();toast('Shop updated','ok');
  }catch(e){toast(e.message,'err');}
}

function openEditProductModal(id){
  const p=products.find(x=>x._id===id); if(!p) return;
  document.getElementById('edit-prod-id').value            = p._id;
  document.getElementById('edit-prod-name').value          = p.name||'';
  document.getElementById('edit-prod-cat').value           = p.cat||'';
  document.getElementById('edit-prod-size').value          = p.sizeValue||p.size||'';
  document.getElementById('edit-prod-size-unit').value     = p.sizeUnit||'ml';
  document.getElementById('edit-prod-img').value           = p.imageUrl||'';
  document.getElementById('edit-prod-price').value         = p.price||'';
  document.getElementById('edit-prod-pcsPerPack').value    = p.pcsPerPack||1;
  document.getElementById('edit-prod-packsPerCtn').value   = p.packsPerCarton||1;
  document.getElementById('edit-prod-top10').checked       = p.isTop10||false;
  document.getElementById('edit-prod-rank').value          = p.top10Rank||'';
  document.getElementById('edit-prod-minAgent').value      = p.minAgentQty||0;
  document.getElementById('edit-prod-minShop').value       = p.minShopQty||0;
  // Show image preview
  const wrap = document.getElementById('edit-prod-img-wrap');
  const imgEl = document.getElementById('edit-prod-img-el');
  if (wrap && imgEl) {
    if (p.imageUrl) { imgEl.src=p.imageUrl; wrap.style.display='block'; }
    else { wrap.style.display='none'; }
  }
  updateEditPkgSummary();
  openModal('edit-prod-modal');
}

async function saveEditProduct(){
  const id  = document.getElementById('edit-prod-id').value;
  const ppp = parseInt(document.getElementById('edit-prod-pcsPerPack').value)||1;
  const ppc = parseInt(document.getElementById('edit-prod-packsPerCtn').value)||1;
  try {
    const data = await api('PUT',`/products/${id}`,{
      name:           document.getElementById('edit-prod-name').value.trim(),
      cat:            document.getElementById('edit-prod-cat').value.trim(),
      sizeValue:      parseFloat(document.getElementById('edit-prod-size').value)||0,
      sizeUnit:       document.getElementById('edit-prod-size-unit').value,
      imageUrl:       document.getElementById('edit-prod-img').value.trim()||undefined,
      price:          parseFloat(document.getElementById('edit-prod-price').value)||0,
      pcsPerPack:     ppp,
      packsPerCarton: ppc,
      pcsPerCarton:   ppp*ppc,
      isTop10:        document.getElementById('edit-prod-top10').checked,
      top10Rank:      parseInt(document.getElementById('edit-prod-rank').value)||undefined,
      minAgentQty:    parseInt(document.getElementById('edit-prod-minAgent').value)||0,
      minShopQty:     parseInt(document.getElementById('edit-prod-minShop').value)||0,
    });
    if (!data) return;
    const idx=products.findIndex(p=>p._id===id);
    if (idx>=0) products[idx]=data.data;
    closeModal('edit-prod-modal');
    renderAll(); renderProductCatalogue();
    toast('Product updated','ok');
  } catch(e){ toast(e.message,'err'); }
}

/* ═══ PRODUCT HELPERS ════════════════════════════════ */
function sizeLabel(p){ return p.sizeValue ? `${p.sizeValue}${p.sizeUnit||''}` : ''; }
function pkgLabel(p){
  const ppp=p.pcsPerPack||1, ppc=p.packsPerCarton||1, ctm=p.pcsPerCarton||ppp*ppc;
  return `1 Pk = ${ppp} pcs · 1 Ctn = ${ppc} Pks = ${ctm} pcs`;
}
function toPcs(qty, unit, product){
  if (!qty) return 0;
  if (unit==='Pk'||unit==='Pack')    return qty*(product.pcsPerPack||1);
  if (unit==='Ctn'||unit==='Carton') return qty*(product.pcsPerCarton||1);
  return qty;
}
function updatePkgSummary(){
  const ppp=parseInt(document.getElementById('s-prod-pcsPerPack')?.value)||1;
  const ppc=parseInt(document.getElementById('s-prod-packsPerCtn')?.value)||1;
  const el=document.getElementById('pkg-summary');
  if(el) el.textContent=`1 Pk = ${ppp} pcs  ·  1 Ctn = ${ppc} Pks = ${ppp*ppc} pcs`;
}
function updateEditPkgSummary(){
  const ppp=parseInt(document.getElementById('edit-prod-pcsPerPack')?.value)||1;
  const ppc=parseInt(document.getElementById('edit-prod-packsPerCtn')?.value)||1;
  const el=document.getElementById('edit-pkg-summary');
  if(el) el.textContent=`1 Pk = ${ppp} pcs  ·  1 Ctn = ${ppc} Pks = ${ppp*ppc} pcs`;
}
function applyPkgPreset(ppp, ppc, total, label){
  const a=document.getElementById('s-prod-pcsPerPack');
  const b=document.getElementById('s-prod-packsPerCtn');
  if(a) a.value=ppp; if(b) b.value=ppc;
  updatePkgSummary();
  toast(`${label}: ${total} pcs/Ctn`,'info');
}
function previewProdImg(){
  const url=document.getElementById('s-prod-img')?.value;
  const wrap=document.getElementById('s-prod-img-preview');
  const el=document.getElementById('s-prod-img-el');
  if(wrap&&el){ if(url){el.src=url;wrap.style.display='block';}else{wrap.style.display='none';} }
}

/* ═══ PRODUCT CATALOGUE ═══════════════════════════════ */
function renderProductCatalogue(){
  const grid=document.getElementById('product-catalogue-grid'); if(!grid) return;
  const search  = document.getElementById('prod-search')?.value.toLowerCase()||'';
  const catFlt  = document.getElementById('prod-cat-filter')?.value||'';
  const top10   = document.getElementById('prod-top10-only')?.checked||false;

  // Populate category filter first time
  const catSel=document.getElementById('prod-cat-filter');
  if(catSel&&catSel.options.length<=1){
    const cats=[...new Set(products.map(p=>p.cat).filter(Boolean))].sort();
    cats.forEach(c=>catSel.add(new Option(c,c)));
  }

  let list=[...products];
  if(search) list=list.filter(p=>(p.name+p.cat).toLowerCase().includes(search));
  if(catFlt) list=list.filter(p=>p.cat===catFlt);
  if(top10)  list=list.filter(p=>p.isTop10);
  list.sort((a,b)=>(a.cat+a.name).localeCompare(b.cat+b.name));

  if(!list.length){grid.innerHTML='<div class="empty" style="grid-column:1/-1;">No products match this filter.</div>';return;}

  grid.innerHTML=list.map(p=>`
    <div class="product-card">
      <div class="product-card-img">
        ${p.imageUrl
          ?`<img src="${p.imageUrl}" alt="${p.name}" onerror="this.parentNode.innerHTML='<div class=\\'no-img\\'><i class=\\'ti ti-box\\'></i><span>No image</span></div>'">`
          :`<div class="no-img"><i class="ti ti-box" style="font-size:32px;"></i><span>No image</span></div>`}
        ${p.isTop10?`<div class="top10-ribbon">#${p.top10Rank} Top 10</div>`:''}
      </div>
      <div class="product-card-body">
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-meta">
          <span class="badge badge-muted">${p.cat}</span>
          ${sizeLabel(p)?`<span class="badge badge-muted">${sizeLabel(p)}</span>`:''}
        </div>
        <div class="product-card-price">${fmt(p.price)} <span style="font-size:10px;font-weight:400;color:var(--text2);">per Pc</span></div>
        <div class="pkg-info">
          <div class="pkg-row"><span>1 Pack (${p.pcsPerPack||1} pcs)</span><span>${fmt((p.pcsPerPack||1)*p.price)}</span></div>
          <div class="pkg-row"><span>1 Carton (${p.pcsPerCarton||1} pcs)</span><span>${fmt((p.pcsPerCarton||1)*p.price)}</span></div>
          ${p.minAgentQty?`<div class="pkg-row" style="color:var(--text3);"><span>Min Agent</span><span>${p.minAgentQty} pcs</span></div>`:''}
          ${p.minShopQty ?`<div class="pkg-row" style="color:var(--text3);"><span>Min Shop</span><span>${p.minShopQty} pcs</span></div>`:''}
        </div>
      </div>
      <div class="product-card-footer">
        <button class="btn btn-sm" onclick="openEditProductModal('${p._id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-sm btn-red" onclick="removeProd('${p._id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('');
}

/* ═══ COMPANY MODALS (super admin) ═══════════════════ */
async function addCompany(){
  const name=document.getElementById('c-name').value.trim();
  const slug=document.getElementById('c-slug').value.trim().toLowerCase().replace(/\s+/g,'-');
  if(!name||!slug){toast('Name and slug required','err');return;}
  try{
    const data=await api('POST','/companies',{
      name,slug,
      industry:document.getElementById('c-industry').value.trim(),
      country:document.getElementById('c-country').value.trim()||'Ghana',
      currency:document.getElementById('c-currency').value.trim()||'GH₵',
      accentColor:document.getElementById('c-color').value||'#00e5ff',
      plan:document.getElementById('c-plan').value,
    });
    if(!data)return;
    companies.push(data.data);
    closeModal('add-company-modal');
    renderSuperDashboard(); renderCompanies();
    toast('Company created','ok');
  }catch(e){toast(e.message,'err');}
}

function openEditCompanyModal(id){
  const c=companies.find(x=>x._id===id);if(!c)return;
  document.getElementById('edit-company-id').value=c._id;
  document.getElementById('edit-c-name').value=c.name||'';
  document.getElementById('edit-c-industry').value=c.industry||'';
  document.getElementById('edit-c-country').value=c.country||'Ghana';
  document.getElementById('edit-c-currency').value=c.currency||'GH₵';
  document.getElementById('edit-c-color').value=c.accentColor||'#00e5ff';
  document.getElementById('edit-c-plan').value=c.plan||'trial';
  document.getElementById('edit-c-logo').value=c.logo||'';
  openModal('edit-company-modal');
}
async function saveEditCompany(){
  const id=document.getElementById('edit-company-id').value;
  try{
    const data=await api('PUT',`/companies/${id}`,{
      name:document.getElementById('edit-c-name').value.trim(),
      industry:document.getElementById('edit-c-industry').value.trim(),
      country:document.getElementById('edit-c-country').value.trim(),
      currency:document.getElementById('edit-c-currency').value.trim(),
      accentColor:document.getElementById('edit-c-color').value,
      plan:document.getElementById('edit-c-plan').value,
      logo:document.getElementById('edit-c-logo').value.trim()||undefined,
    });
    if(!data)return;
    const idx=companies.findIndex(c=>c._id===id);if(idx>=0)companies[idx]=data.data;
    closeModal('edit-company-modal');renderSuperDashboard();renderCompanies();toast('Updated','ok');
  }catch(e){toast(e.message,'err');}
}
async function suspendCompany(id){
  if(!confirm('Suspend this company? Their users will not be able to log in.'))return;
  try{await api('PATCH',`/companies/${id}/suspend`);const c=companies.find(x=>x._id===id);if(c)c.isActive=false;renderSuperDashboard();renderCompanies();toast('Company suspended','info');}
  catch(e){toast(e.message,'err');}
}
async function activateCompany(id){
  try{await api('PATCH',`/companies/${id}/activate`);const c=companies.find(x=>x._id===id);if(c)c.isActive=true;renderSuperDashboard();renderCompanies();toast('Company activated','ok');}
  catch(e){toast(e.message,'err');}
}

/* ═══ PROMOTIONS MODAL ═══════════════════════════════ */
function openAddPromoModal(){
  document.getElementById('promo-name').value='';
  document.getElementById('promo-code').value='';
  document.getElementById('promo-desc').value='';
  document.getElementById('promo-start').value='';
  document.getElementById('promo-end').value='';
  openModal('promo-modal');
}
async function savePromo(){
  const name=document.getElementById('promo-name').value.trim();
  const code=document.getElementById('promo-code').value.trim().toUpperCase();
  if(!name||!code){toast('Name and code required','err');return;}
  try{
    const data=await api('POST','/promotions',{
      name,code,
      description:document.getElementById('promo-desc').value.trim(),
      startDate:document.getElementById('promo-start').value||undefined,
      endDate:document.getElementById('promo-end').value||undefined,
      tiers:[
        {name:'Gold',  minSpend:parseFloat(document.getElementById('tier-gold-min').value)||5000,  rewardValue:parseFloat(document.getElementById('tier-gold-reward').value)||500,  durationMonths:3,color:'#ffb300'},
        {name:'Silver',minSpend:parseFloat(document.getElementById('tier-silver-min').value)||2500, rewardValue:parseFloat(document.getElementById('tier-silver-reward').value)||200, durationMonths:3,color:'#90a4ae'},
        {name:'Bronze',minSpend:parseFloat(document.getElementById('tier-bronze-min').value)||1000, rewardValue:parseFloat(document.getElementById('tier-bronze-reward').value)||75,  durationMonths:3,color:'#a1887f'},
      ],
    });
    if(!data)return;
    promotions.push(data.data);
    closeModal('promo-modal');renderPromotions();toast('Promotion created','ok');
  }catch(e){toast(e.message,'err');}
}

/* ═══ DETAIL PAGES ═══════════════════════════════════ */
function openDistDetail(distId){
  const d=distributors.find(x=>x._id===distId);if(!d)return;
  const i=distributors.indexOf(d);
  const dId=distId;
  const sv=distStockVal(dId);
  const dis=dispatches.filter(x=>(x.distributorId?._id||x.distributorId)===dId).reduce((s,x)=>s+x.qty*x.price,0);
  const con=dispatches.filter(x=>(x.distributorId?._id||x.distributorId)===dId&&x.confirmed).reduce((s,x)=>s+x.qty*x.price,0);
  const distAgents=agents.filter(a=>agentDistId(a)===dId);
  const distShops=shops.filter(s=>(s.distributorId?._id||s.distributorId)===dId);
  const totalDebt=distShops.reduce((s,sh)=>s+(sh.creditBalance||0),0);
  const lowStock=products.filter(p=>getQty(dId,p._id)<=10);
  const pct=dis>0?Math.min(100,Math.round(con/dis*100)):0;
  const pc=pct>=80?'var(--green)':pct>=50?'var(--amber)':'var(--red)';

  document.getElementById('detail-overlay').innerHTML=`
    <div class="detail-topbar">
      <button class="btn btn-sm" onclick="closeDetail()"><i class="ti ti-arrow-left"></i> Back</button>
      <div style="width:10px;height:10px;border-radius:50%;background:${gc(i)};"></div>
      <span style="font-family:var(--font-head);font-size:17px;font-weight:700;">${d.name}</span>
      <span class="badge ${TYPE_BADGE[d.type]||'badge-muted'}">${d.type}</span>
      ${d.location?`<span class="badge badge-muted"><i class="ti ti-map-pin" style="font-size:9px;"></i>${d.location}</span>`:''}
      <button class="btn btn-sm btn-amber" style="margin-left:auto;" onclick="openImportModal('${dId}','${d.name}')"><i class="ti ti-file-import"></i> Import Stock</button>
    </div>
    <div class="detail-body">
      <div class="stat-grid">
        <div class="stat-card cyan"><div class="stat-icon"><i class="ti ti-package"></i></div><div class="stat-val">${fmt(sv)}</div><div class="stat-label">Stock Value</div></div>
        <div class="stat-card violet"><div class="stat-icon"><i class="ti ti-truck-delivery"></i></div><div class="stat-val">${fmt(dis)}</div><div class="stat-label">Dispatched</div></div>
        <div class="stat-card green"><div class="stat-icon"><i class="ti ti-circle-check"></i></div><div class="stat-val">${fmt(con)}</div><div class="stat-label">Confirmed</div></div>
        <div class="stat-card red"><div class="stat-icon"><i class="ti ti-credit-card"></i></div><div class="stat-val">${fmt(totalDebt)}</div><div class="stat-label">Credit in Trade</div></div>
        <div class="stat-card pink"><div class="stat-icon"><i class="ti ti-users"></i></div><div class="stat-val">${distAgents.length}</div><div class="stat-label">Agents</div></div>
        <div class="stat-card blue"><div class="stat-icon"><i class="ti ti-building"></i></div><div class="stat-val">${distShops.length}</div><div class="stat-label">Shops</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;" class="two-col">
        <div class="card">
          <div class="card-title"><i class="ti ti-address-book"></i> Contact</div>
          ${d.contact?`<div class="dist-info-row"><i class="ti ti-user" style="color:${gc(i)};"></i>${d.contact}</div>`:''}
          ${d.address?`<div class="dist-info-row"><i class="ti ti-map-pin" style="color:${gc(i)};"></i>${d.address}</div>`:''}
          ${d.phone?`<div class="dist-info-row"><i class="ti ti-phone" style="color:${gc(i)};"></i>${d.phone}</div>`:''}
          ${d.whatsapp?`<div class="dist-info-row"><i class="ti ti-brand-whatsapp" style="color:#25D366;"></i>${d.whatsapp}</div>`:''}
          ${d.email?`<div class="dist-info-row"><i class="ti ti-mail" style="color:${gc(i)};"></i>${d.email}</div>`:''}
        </div>
        <div class="card">
          <div class="card-title"><i class="ti ti-chart-bar"></i> Performance</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:13px;color:var(--text2);">Confirmation Rate</span>
            <span style="font-family:var(--font-mono);font-size:18px;font-weight:600;color:${pc};">${pct}%</span>
          </div>
          <div class="perf-bar"><div class="perf-fill" style="width:${pct}%;background:${pc};"></div></div>
          ${lowStock.length?`<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:5px;">${lowStock.slice(0,6).map(p=>{const q=getQty(dId,p._id);return`<span class="badge ${q===0?'badge-red':'badge-amber'}">${p.name}: ${q===0?'OUT':q}</span>`;}).join('')}</div>`:'<div style="margin-top:10px;font-size:12px;color:var(--green);"><i class="ti ti-check"></i> All products stocked</div>'}
        </div>
      </div>
      <div class="card" style="margin-bottom:14px;">
        <div class="card-title"><i class="ti ti-users"></i> Team (${distAgents.length})</div>
        <div class="agent-grid">
          ${distAgents.map((a,idx)=>{
            const s=agentStats(a._id);
            return`<div class="agent-card" style="cursor:pointer;" onclick="closeDetail();openAgentDetail('${a._id}')">
              <div class="agent-card-top" style="border-top:2px solid ${gc(idx)};">
                <div class="agent-avatar" style="background:${gb(idx)};color:${gc(idx)};"><i class="ti ${a.role==='OMR'?'ti-id-badge-2':'ti-user-check'}"></i></div>
                <div style="flex:1;min-width:0;">
                  <div style="font-family:var(--font-head);font-size:15px;font-weight:700;">${a.name}</div>
                  <span class="badge ${ROLE_BADGE[a.role]||'badge-muted'}">${a.role}</span>
                </div>
                <i class="ti ti-chevron-right" style="color:var(--text3);"></i>
              </div>
              <div class="agent-stats">
                <div class="agent-stat"><div class="agent-stat-val col-violet">${s.units}</div><div class="agent-stat-lbl">Units</div></div>
                <div class="agent-stat"><div class="agent-stat-val col-amber">${fmt(s.val)}</div><div class="agent-stat-lbl">Value</div></div>
                <div class="agent-stat"><div class="agent-stat-val col-green">${fmt(s.conf)}</div><div class="agent-stat-lbl">Conf.</div></div>
                <div class="agent-stat"><div class="agent-stat-val ${s.pend>0?'col-red':'col-green'}">${fmt(s.pend)}</div><div class="agent-stat-lbl">Pend.</div></div>
              </div>
            </div>`;
          }).join('')||'<div class="empty">No agents yet.</div>'}
        </div>
      </div>
      <div class="card">
        <div class="flex-between">
          <div class="card-title" style="margin:0;"><i class="ti ti-building"></i> Shops (${distShops.length})</div>
          <button class="btn btn-sm btn-green" onclick="showQuickAddShop('${dId}')"><i class="ti ti-plus"></i> Add Shop</button>
        </div>
        <div class="shop-grid" style="margin-top:12px;">
          ${distShops.map(sh=>{
            const agent=agents.find(a=>a._id===(sh.assignedAgent?._id||sh.assignedAgent));
            return`<div class="shop-card">
              <div class="shop-card-header">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div style="font-weight:700;">${sh.name}</div>
                  ${(sh.creditBalance||0)>0?`<span class="shop-debt">${fmt(sh.creditBalance)}</span>`:'<span class="badge badge-green" style="font-size:9px;">Clear</span>'}
                </div>
                <div style="font-size:11px;color:var(--text2);">${sh.locationName||'—'}</div>
              </div>
              <div class="shop-card-body">
                ${sh.ownerName?`<div style="font-size:12px;color:var(--text2);">${sh.ownerName} · ${sh.ownerContact||''}</div>`:''}
                ${agent?`<span class="badge ${ROLE_BADGE[agent.role]||'badge-muted'}" style="font-size:9px;margin-top:5px;">${agent.name}</span>`:''}
                ${sh.avcTier&&sh.avcTier!=='none'?`<span class="badge badge-${sh.avcTier}" style="margin-top:5px;">AVC ${sh.avcTier.toUpperCase()}</span>`:''}
              </div>
            </div>`;
          }).join('')||'<div class="empty">No shops yet.</div>'}
        </div>
      </div>
    </div>`;
  document.getElementById('detail-overlay').style.display='block';
}

function openAgentDetail(agentId){
  const a=agents.find(x=>x._id===agentId);if(!a)return;
  const dist=distributors.find(d=>d._id===agentDistId(a));
  const s=agentStats(agentId);
  const agentShops=shops.filter(sh=>(sh.assignedAgent?._id||sh.assignedAgent)===agentId);
  const owingShops=agentShops.filter(sh=>(sh.creditBalance||0)>0);
  const now=new Date();
  const monthTarget=targets.find(t=>(t.agentId?._id||t.agentId)===agentId&&t.month===now.getMonth()+1&&t.year===now.getFullYear());
  const mT=monthTarget?.monthlyTarget||0;
  const mPct=mT>0?Math.min(100,Math.round(s.val/mT*100)):0;
  const pc=mPct>=100?'var(--green)':mPct>=70?'var(--amber)':'var(--red)';
  const top10Products=products.filter(p=>p.isTop10).sort((a,b)=>(a.top10Rank||99)-(b.top10Rank||99));

  document.getElementById('detail-overlay').innerHTML=`
    <div class="detail-topbar">
      <button class="btn btn-sm" onclick="closeDetail()"><i class="ti ti-arrow-left"></i> Back</button>
      <div class="agent-avatar" style="width:30px;height:30px;font-size:14px;background:${gb(0)};color:${gc(0)};border-radius:8px;display:flex;align-items:center;justify-content:center;"><i class="ti ${a.role==='OMR'?'ti-id-badge-2':'ti-user-check'}"></i></div>
      <span style="font-family:var(--font-head);font-size:17px;font-weight:700;">${a.name}</span>
      <span class="badge ${ROLE_BADGE[a.role]||'badge-muted'}">${a.role}</span>
      ${dist?`<span class="badge badge-muted">${dist.name}</span>`:''}
      <button class="btn btn-sm" style="margin-left:auto;" onclick="openEditAgentModal('${agentId}')"><i class="ti ti-edit"></i> Edit</button>
    </div>
    <div class="detail-body">
      <div class="stat-grid">
        <div class="stat-card violet"><div class="stat-icon"><i class="ti ti-target"></i></div><div class="stat-val">${fmt(mT)}</div><div class="stat-label">Monthly Target</div></div>
        <div class="stat-card green"><div class="stat-icon"><i class="ti ti-trending-up"></i></div><div class="stat-val">${mPct}%</div><div class="stat-label">Achieved</div></div>
        <div class="stat-card cyan"><div class="stat-icon"><i class="ti ti-package"></i></div><div class="stat-val">${s.units}</div><div class="stat-label">Units Sold</div></div>
        <div class="stat-card amber"><div class="stat-icon"><i class="ti ti-cash"></i></div><div class="stat-val">${fmt(s.val)}</div><div class="stat-label">Total Value</div></div>
        <div class="stat-card blue"><div class="stat-icon"><i class="ti ti-building"></i></div><div class="stat-val">${agentShops.length}</div><div class="stat-label">Shops</div></div>
        <div class="stat-card red"><div class="stat-icon"><i class="ti ti-credit-card"></i></div><div class="stat-val">${owingShops.length}</div><div class="stat-label">Owing</div></div>
      </div>
      ${mT>0?`<div class="card" style="margin-bottom:14px;">
        <div class="flex-between" style="margin-bottom:6px;">
          <div class="card-title" style="margin:0;"><i class="ti ti-chart-line"></i> Monthly Target</div>
          <span style="font-family:var(--font-mono);font-size:15px;color:${pc};">${mPct}%</span>
        </div>
        <div class="perf-bar"><div class="perf-fill" style="width:${mPct}%;background:${pc};"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-top:5px;"><span>Achieved: ${fmt(s.val)}</span><span>Target: ${fmt(mT)}</span></div>
        <div class="week-bars">
          ${['wk1','wk2','wk3','wk4','wk5'].map((wk,j)=>{
            const wT=monthTarget?.weeklyTargets?.[wk]||0;
            const wPct=wT>0?Math.min(100,Math.round((s.val/5)/wT*100)):0;
            const wc=wPct>=100?'var(--green)':wPct>=70?'var(--amber)':'var(--red)';
            return`<div class="wk-wrap"><div class="wk-label">WK${j+1}</div><div class="wk-bar"><div class="wk-fill" style="height:${wPct}%;background:${wc};"></div></div><div class="wk-pct" style="color:${wc};">${wPct}%</div></div>`;
          }).join('')}
        </div>
      </div>`:''}
      ${top10Products.length?`<div class="card" style="margin-bottom:14px;">
        <div class="card-title"><i class="ti ti-list-check" style="color:var(--amber);"></i> Top 10 Lines — Stock Status</div>
        <div class="top10-grid">
          ${top10Products.map(p=>{
            const dId=agentDistId(a);
            const q=getQty(dId,p._id);
            const status=q===0?'out':q<p.minAgentQty?'low':'ok';
            const sc=status==='ok'?'col-green':status==='low'?'col-amber':'col-red';
            return`<div class="top10-card ${status}">
              <div style="font-size:11px;font-weight:700;color:var(--text1);">#${p.top10Rank} ${p.name}</div>
              <div class="top10-qty ${sc}">${q}</div>
              <div style="font-size:10px;color:var(--text3);">Min: ${p.minAgentQty} pcs</div>
              <span class="badge badge-${status==='ok'?'green':status==='low'?'amber':'red'}" style="margin-top:5px;">${status==='ok'?'OK':status==='low'?'Low':'OUT'}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`:''}
      <div class="card" style="margin-bottom:14px;">
        <div class="flex-between">
          <div class="card-title" style="margin:0;"><i class="ti ti-building"></i> Shops (${agentShops.length})</div>
          <button class="btn btn-sm btn-green" onclick="showQuickAddShop('${agentDistId(a)}','${agentId}')"><i class="ti ti-plus"></i> Add Shop</button>
        </div>
        ${owingShops.length?`<div style="margin:10px 0;padding:8px 12px;background:rgba(255,82,82,.08);border:1px solid rgba(255,82,82,.2);border-radius:8px;font-size:12px;color:var(--red);"><i class="ti ti-alert-circle"></i> ${owingShops.length} shop${owingShops.length!==1?'s':''} with credit: ${fmt(owingShops.reduce((s,sh)=>s+(sh.creditBalance||0),0))}</div>`:''}
        <div class="shop-grid" style="margin-top:10px;">
          ${agentShops.map(sh=>`<div class="shop-card">
            <div class="shop-card-header">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <div style="font-weight:700;font-size:13px;">${sh.name}</div>
                ${(sh.creditBalance||0)>0?`<span class="shop-debt">${fmt(sh.creditBalance)}</span>`:'<span class="badge badge-green" style="font-size:9px;">Clear</span>'}
              </div>
              <div style="font-size:11px;color:var(--text2);">${sh.locationName||'—'}</div>
            </div>
            <div class="shop-card-body">
              ${sh.ownerName?`<div style="font-size:11px;color:var(--text2);">${sh.ownerName} · ${sh.ownerContact||''}</div>`:''}
              ${sh.avcTier&&sh.avcTier!=='none'?`<span class="badge badge-${sh.avcTier}" style="margin-top:5px;">AVC ${sh.avcTier.toUpperCase()}</span>`:''}
            </div>
          </div>`).join('')||'<div class="empty">No shops assigned yet.</div>'}
        </div>
      </div>
      <div class="card">
        <div class="card-title"><i class="ti ti-address-book"></i> Contact</div>
        ${a.phone?`<div class="dist-info-row"><i class="ti ti-phone" style="color:var(--pink);"></i>${a.phone}</div>`:''}
        ${a.whatsapp?`<div class="dist-info-row"><i class="ti ti-brand-whatsapp" style="color:#25D366;"></i>${a.whatsapp}</div>`:''}
        ${a.email?`<div class="dist-info-row"><i class="ti ti-mail" style="color:var(--pink);"></i>${a.email}</div>`:''}
        ${a.address?`<div class="dist-info-row"><i class="ti ti-home" style="color:var(--pink);"></i>${a.address}</div>`:''}
        ${a.emergency?`<div class="dist-info-row"><i class="ti ti-urgent" style="color:var(--red);"></i>${a.emergency}</div>`:''}
      </div>
    </div>`;
  document.getElementById('detail-overlay').style.display='block';
}

function closeDetail(){
  const el=document.getElementById('detail-overlay');
  if(el){el.innerHTML='';el.style.display='none';}
}

function showQuickAddShop(distId, agentId=''){
  document.getElementById('s-shop-dist').value=distId||'';
  refreshAllSelects();
  if(agentId) document.getElementById('s-shop-agent').value=agentId;
  closeDetail();
  sw('setup-section',null,'Setup');
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelector('[onclick*="setup-section"]')?.classList.add('active');
  document.getElementById('s-shop-name').focus();
  toast('Fill in the shop details below','info');
}

/* ═══ EXCEL IMPORT ═══════════════════════════════════ */
let _importDistId=null, _importRows=[], _importCols=[], _importMapped=[];

function openImportModal(distId,distName){
  _importDistId=distId;
  document.getElementById('import-dist-label').textContent='→ '+distName;
  resetImport();
  openModal('import-modal');
}
function closeImportModal(){ closeModal('import-modal'); setTimeout(resetImport,300); }
function resetImport(){
  _importRows=[];_importCols=[];_importMapped=[];
  document.getElementById('import-step-1').style.display='block';
  document.getElementById('import-step-2').style.display='none';
  document.getElementById('import-step-3').style.display='none';
  document.getElementById('import-apply-btn').style.display='none';
  document.getElementById('import-file-input').value='';
  document.getElementById('import-preview').innerHTML='';
  document.getElementById('import-footer').innerHTML=`
    <button class="btn" onclick="closeImportModal()"><i class="ti ti-x"></i> Cancel</button>
    <button class="btn btn-amber" id="import-apply-btn" onclick="applyImport()" style="display:none;"><i class="ti ti-check"></i> Apply to Stock</button>`;
}
function handleImportDrop(e){
  e.preventDefault();
  document.getElementById('import-zone').classList.remove('drag-over');
  if(e.dataTransfer.files[0]) handleImportFile(e.dataTransfer.files[0]);
}
function handleImportFile(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const wb=XLSX.read(e.target.result,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const data=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
      if(!data||data.length<2){alert('File empty or invalid.');return;}
      _importCols=data[0].map(h=>String(h).trim()).filter(h=>h);
      _importRows=data.slice(1).filter(r=>r.some(c=>c!==''));
      const pG=_importCols.find(h=>/product|item|name|sku/i.test(h))||_importCols[0];
      const qG=_importCols.find(h=>/qty|quantity|stock|count|units/i.test(h))||_importCols[1];
      ['map-prod-col','map-qty-col'].forEach(id=>{
        const sel=document.getElementById(id);while(sel.options.length)sel.remove(0);
        _importCols.forEach(h=>sel.add(new Option(h,h)));
      });
      document.getElementById('map-prod-col').value=pG||_importCols[0];
      document.getElementById('map-qty-col').value=qG||_importCols[1]||_importCols[0];
      document.getElementById('import-sheet-name').textContent='Sheet: '+wb.SheetNames[0];
      document.getElementById('import-step-1').style.display='none';
      document.getElementById('import-step-2').style.display='block';
      previewImport();
    }catch(err){alert('Could not read: '+err.message);}
  };
  reader.readAsArrayBuffer(file);
}
function previewImport(){
  const pCol=document.getElementById('map-prod-col').value;
  const qCol=document.getElementById('map-qty-col').value;
  const pIdx=_importCols.indexOf(pCol),qIdx=_importCols.indexOf(qCol);
  _importMapped=_importRows.map(row=>{
    const raw=String(row[pIdx]||'').trim();const qty=parseInt(row[qIdx])||0;
    if(!raw)return null;
    const match=products.find(p=>p.name.toLowerCase()===raw.toLowerCase()||p.name.toLowerCase().includes(raw.toLowerCase())||raw.toLowerCase().includes(p.name.toLowerCase()));
    return{raw,qty,matched:!!match,prodId:match?._id||null,prodName:match?.name||raw};
  }).filter(Boolean);
  const matched=_importMapped.filter(r=>r.matched).length;
  const unmatched=_importMapped.filter(r=>!r.matched).length;
  document.getElementById('import-preview').innerHTML=`
    <div style="margin-bottom:6px;font-size:12px;">
      <span class="match-badge match-ok">${matched} matched</span>
      ${unmatched?`<span class="match-badge match-warn" style="margin-left:4px;">${unmatched} will skip</span>`:''}
    </div>
    <div style="max-height:220px;overflow-y:auto;"><table style="font-size:11px;width:100%;">
      <thead><tr style="background:var(--bg3);">
        <th style="padding:5px 8px;text-align:left;color:var(--text2);">In File</th>
        <th style="padding:5px 8px;text-align:left;color:var(--text2);">Matched</th>
        <th style="padding:5px 8px;text-align:right;color:var(--text2);">Qty</th>
        <th style="padding:5px 8px;text-align:center;color:var(--text2);">Status</th>
      </tr></thead>
      <tbody>${_importMapped.map(r=>`<tr style="border-bottom:1px solid var(--border);">
        <td style="padding:5px 8px;">${r.raw}</td>
        <td style="padding:5px 8px;color:${r.matched?'var(--text1)':'var(--text3)'};">${r.matched?r.prodName:'—'}</td>
        <td style="padding:5px 8px;text-align:right;font-family:var(--font-mono);color:var(--cyan);">${r.qty}</td>
        <td style="padding:5px 8px;text-align:center;">${r.matched?'<span class="match-badge match-ok">✓</span>':'<span class="match-badge match-warn">Skip</span>'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  document.getElementById('import-apply-btn').style.display=matched>0?'inline-flex':'none';
}
async function applyImport(){
  const updates=_importMapped.filter(r=>r.matched&&r.prodId).map(r=>({productId:r.prodId,qty:r.qty}));
  try{
    await api('POST',`/stock/import/${_importDistId}`,{updates});
    updates.forEach(u=>{
      const idx=stock.findIndex(s=>(s.distributorId?._id||s.distributorId)===_importDistId&&(s.productId?._id||s.productId)===u.productId);
      if(idx>=0)stock[idx].qty=u.qty;else stock.push({distributorId:_importDistId,productId:u.productId,qty:u.qty});
    });
    const skipped=_importMapped.filter(r=>!r.matched).length;
    document.getElementById('import-step-2').style.display='none';
    document.getElementById('import-step-3').style.display='block';
    document.getElementById('import-summary-text').textContent=`${updates.length} updated · ${skipped} skipped`;
    document.getElementById('import-result-list').innerHTML=updates.map(u=>{
      const p=products.find(x=>x._id===u.productId);
      return`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;"><i class="ti ti-circle-check" style="color:var(--green);flex-shrink:0;"></i><span style="flex:1;">${p?.name||u.productId}</span><span class="badge badge-cyan" style="font-family:var(--font-mono);">→ ${u.qty}</span></div>`;
    }).join('');
    document.getElementById('import-footer').innerHTML=`<button class="btn btn-green" onclick="closeImportModal();renderAll();"><i class="ti ti-check"></i> Done</button>`;
    renderAll();
  }catch(e){toast(e.message,'err');}
}
function downloadStockTemplate(){
  const headers=['Product','Category','Top10 Rank','Unit Price','Qty'];
  const rows=products.map(p=>[p.name,p.cat,p.isTop10?p.top10Rank:'',p.price,0]);
  const ws=XLSX.utils.aoa_to_sheet([headers,...rows]);
  ws['!cols']=[{wch:35},{wch:16},{wch:12},{wch:14},{wch:10}];
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'Stock Update');
  XLSX.writeFile(wb,`Stock_Template_${today()}.xlsx`);
}

/* ═══ EXCEL EXPORT ═══════════════════════════════════ */
function exportAllExcel(){
  const wb=XLSX.utils.book_new();
  // Distributors
  const dH=['Company Name','Type','Region','Location','Address','Contact','Phone','Email','Stock Value','Shops','Agents'];
  const dR=distributors.map(d=>[d.name,d.type,d.regionId?.name||'',d.location||'',d.address||'',d.contact||'',d.phone||'',d.email||'',distStockVal(d._id).toFixed(2),shops.filter(s=>(s.distributorId?._id||s.distributorId)===d._id).length,agents.filter(a=>agentDistId(a)===d._id).length]);
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([dH,...dR]),'Distributors');
  // Agents
  const aH=['Name','Role','Distributor','Phone','Email','Address','Emergency','Units','Value','Confirmed','Pending'];
  const aR=agents.map(a=>{const dist=distributors.find(d=>d._id===agentDistId(a));const s=agentStats(a._id);return[a.name,a.role,dist?.name||'',a.phone||'',a.email||'',a.address||'',a.emergency||'',s.units,s.val.toFixed(2),s.conf.toFixed(2),s.pend.toFixed(2)];});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([aH,...aR]),'Agents');
  // Shops
  const sH=['Shop Name','Distributor','Assigned Agent','Location','Owner','Contact','AVC Tier','Credit Balance'];
  const sR=shops.map(sh=>{const dist=distributors.find(d=>d._id===(sh.distributorId?._id||sh.distributorId));const ag=agents.find(a=>a._id===(sh.assignedAgent?._id||sh.assignedAgent));return[sh.name,dist?.name||'',ag?.name||'',sh.locationName||'',sh.ownerName||'',sh.ownerContact||'',sh.avcTier||'none',(sh.creditBalance||0).toFixed(2)];});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([sH,...sR]),'Shops');
  // Dispatches
  const dispH=['Date','Distributor','Agent','Role','Product','Qty','Price','Total','Status'];
  const dispR=dispatches.sort((a,b)=>b.date.localeCompare(a.date)).map(e=>{
    const dist=e.distributorId?.name||distributors.find(d=>d._id===(e.distributorId?._id||e.distributorId))?.name||'';
    const ag=e.agentId?.name||agents.find(a=>a._id===(e.agentId?._id||e.agentId))?.name||'';
    const role=e.agentId?.role||agents.find(a=>a._id===(e.agentId?._id||e.agentId))?.role||'';
    const prod=e.productId?.name||products.find(p=>p._id===(e.productId?._id||e.productId))?.name||'';
    return[e.date,dist,ag,role,prod,e.qty,e.price,(e.qty*e.price).toFixed(2),e.confirmed?'Confirmed':'Pending'];
  });
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([dispH,...dispR]),'Dispatches');
  XLSX.writeFile(wb,`Report_${today()}.xlsx`);
  toast('Excel report downloaded','ok');
}

/* ═══ SHOP SALES ═════════════════════════════════════ */
let _currentSaleMethod = 'cash';
let _lastReceipt = null;

function openSaleModal(shopId, distId, agentId, shopName) {
  document.getElementById('sale-shop-id').value    = shopId;
  document.getElementById('sale-dist-id').value    = distId;
  document.getElementById('sale-agent-id').value   = agentId;
  document.getElementById('sale-shop-label').textContent = shopName;
  document.getElementById('sale-qty').value        = '';
  document.getElementById('sale-price').value      = '';
  document.getElementById('sale-note').value       = '';
  document.getElementById('sale-total-display').textContent = cur() + ' 0.00';
  document.getElementById('sale-momo-number').value = '';

  // Populate product select
  const sel = document.getElementById('sale-product');
  sel.innerHTML = '<option value="">Select product…</option>';
  products.forEach(p => sel.add(new Option(`${p.name} — ${fmt(p.price)}`, p._id)));

  selectPayMethod('cash');
  openModal('sale-modal');
}

function selectPayMethod(method) {
  _currentSaleMethod = method;
  ['cash','momo','credit'].forEach(m => {
    const tab = document.getElementById(`pay-tab-${m}`);
    tab.classList.toggle('active', m === method);
  });
  document.getElementById('momo-field').style.display    = method === 'momo'   ? 'block' : 'none';
  document.getElementById('credit-notice').style.display = method === 'credit' ? 'block' : 'none';
}

function autoFillSalePrice() {
  const prodId = document.getElementById('sale-product').value;
  const p = products.find(x => x._id === prodId);
  if (p) { document.getElementById('sale-price').value = p.price; updateSaleTotal(); }
}

function updateSaleTotal() {
  const qty   = parseFloat(document.getElementById('sale-qty').value)   || 0;
  const price = parseFloat(document.getElementById('sale-price').value) || 0;
  document.getElementById('sale-total-display').textContent = fmt(qty * price);
}

async function submitSale(printAfter = false) {
  const shopId    = document.getElementById('sale-shop-id').value;
  const distId    = document.getElementById('sale-dist-id').value;
  const agentId   = document.getElementById('sale-agent-id').value;
  const productId = document.getElementById('sale-product').value;
  const qty       = parseInt(document.getElementById('sale-qty').value);
  const price     = parseFloat(document.getElementById('sale-price').value);
  const note      = document.getElementById('sale-note').value.trim();
  const momoNumber= document.getElementById('sale-momo-number').value.trim();

  if (!productId)     { toast('Select a product','err'); return; }
  if (!qty || qty<1)  { toast('Enter a valid quantity','err'); return; }
  if (!price || price<=0) { toast('Enter a valid price','err'); return; }

  try {
    const data = await api('POST', '/shopsales', {
      shopId, distributorId: distId, agentId, productId,
      date: today(), qty, price, note,
      paymentMethod: _currentSaleMethod,
      momoNumber: _currentSaleMethod === 'momo' ? momoNumber : undefined,
    });
    if (!data) return;
    _lastReceipt = data.data;

    // Update local shop credit if credit sale
    if (_currentSaleMethod === 'credit') {
      const sh = shops.find(s => s._id === shopId);
      if (sh) sh.creditBalance = (sh.creditBalance || 0) + qty * price;
    }

    closeModal('sale-modal');
    toast('Sale logged — ' + data.data.receiptNo, 'ok');
    renderShops(); renderDashboard();

    if (printAfter) showReceiptModal(data.data);
  } catch(e) { toast(e.message, 'err'); }
}

/* ═══ RECEIPT ════════════════════════════════════════ */
function showReceiptModal(sale) {
  document.getElementById('receipt-preview-body').innerHTML = buildReceiptHTML(sale);
  openModal('receipt-modal');
}

function buildReceiptHTML(sale) {
  const shop    = sale.shopId;
  const prod    = sale.productId;
  const agent   = sale.agentId;
  const dist    = sale.distributorId;
  const total   = sale.qty * sale.price;
  const payLabels = { cash:'CASH', momo:'MOBILE MONEY (MoMo)', credit:'CREDIT' };
  const payColors = { cash:'pay-cash', momo:'pay-momo', credit:'pay-credit' };
  const company = currentCompany?.name || 'Distribution Co.';

  return `<div class="receipt" id="receipt-content">
    <div class="receipt-header">
      <div class="receipt-title">${company}</div>
      <div style="font-size:11px;margin-top:2px;">Sales Receipt</div>
    </div>
    <div class="receipt-row"><span>Receipt No:</span><span><strong>${sale.receiptNo}</strong></span></div>
    <div class="receipt-row"><span>Date:</span><span>${sale.date}</span></div>
    <div class="receipt-row"><span>Agent:</span><span>${agent?.name||'—'} (${agent?.role||''})</span></div>
    <div class="receipt-row"><span>Distributor:</span><span>${dist?.name||'—'}</span></div>
    <hr class="receipt-divider">
    <div class="receipt-row bold"><span>Shop:</span><span>${shop?.name||'—'}</span></div>
    <div class="receipt-row"><span>Owner:</span><span>${shop?.ownerName||'—'}</span></div>
    <div class="receipt-row"><span>Location:</span><span>${shop?.locationName||shop?.address||'—'}</span></div>
    <hr class="receipt-divider">
    <div class="receipt-row bold"><span>Product:</span><span>${prod?.name||'—'}</span></div>
    <div class="receipt-row"><span>Qty:</span><span>${sale.qty} units</span></div>
    <div class="receipt-row"><span>Unit Price:</span><span>${fmt(sale.price)}</span></div>
    <div class="receipt-row total"><span>TOTAL</span><span>${fmt(total)}</span></div>
    <hr class="receipt-divider">
    <div class="receipt-row">
      <span>Payment:</span>
      <span class="payment-badge ${payColors[sale.paymentMethod]||'pay-cash'}">${payLabels[sale.paymentMethod]||'CASH'}</span>
    </div>
    ${sale.paymentMethod==='momo'&&sale.momoNumber?`<div class="receipt-row"><span>MoMo No:</span><span>${sale.momoNumber}</span></div>`:''}
    ${sale.paymentMethod==='credit'?`<div class="receipt-row" style="color:#c62828;font-weight:700;"><span>Status:</span><span>UNPAID — On Credit</span></div>`:''}
    ${sale.note?`<div class="receipt-row"><span>Note:</span><span>${sale.note}</span></div>`:''}
    <div class="receipt-footer">
      <div>Thank you for your business!</div>
      <div style="margin-top:4px;font-size:10px;">Powered by DistroSaaS</div>
    </div>
  </div>`;
}

function printReceipt() {
  const content = document.getElementById('receipt-content');
  if (!content) { toast('No receipt to print','err'); return; }
  const frame = document.getElementById('print-receipt-frame');
  frame.style.display = 'block';
  frame.innerHTML = `<style>
    body{font-family:'Courier New',monospace;padding:20px;color:#111;background:#fff;}
    .receipt{max-width:320px;margin:0 auto;font-size:13px;line-height:1.6;}
    .receipt-header{text-align:center;border-bottom:2px dashed #ccc;padding-bottom:10px;margin-bottom:10px;}
    .receipt-title{font-size:18px;font-weight:700;letter-spacing:.1em;}
    .receipt-divider{border:none;border-top:1px dashed #ccc;margin:8px 0;}
    .receipt-row{display:flex;justify-content:space-between;gap:10px;margin-bottom:3px;}
    .receipt-row.bold{font-weight:700;}
    .receipt-row.total{font-size:15px;font-weight:700;border-top:2px dashed #ccc;padding-top:8px;margin-top:4px;}
    .receipt-footer{text-align:center;border-top:1px dashed #ccc;padding-top:10px;margin-top:10px;font-size:11px;color:#666;}
    .payment-badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;}
    .pay-cash{background:#e8f5e9;color:#2e7d32;}
    .pay-momo{background:#fff3e0;color:#e65100;}
    .pay-credit{background:#fce4ec;color:#c62828;}
  </style>${content.outerHTML}`;
  window.print();
  setTimeout(() => { frame.style.display = 'none'; frame.innerHTML = ''; }, 1000);
}

/* ═══ SHOP DETAIL — photo + maps ════════════════════ */
function shopDetailHTML(sh) {
  const dist  = distributors.find(d => d._id === (sh.distributorId?._id||sh.distributorId));
  const agent = agents.find(a => a._id === (sh.assignedAgent?._id||sh.assignedAgent));
  const mapsEmbed = sh.googleMapsUrl
    ? `<div class="shop-map">
        <iframe src="https://maps.google.com/maps?q=${sh.lat||''},${sh.lng||''}&z=16&output=embed" allowfullscreen loading="lazy"></iframe>
       </div>`
    : sh.lat && sh.lng
      ? `<div class="shop-map">
          <iframe src="https://maps.google.com/maps?q=${sh.lat},${sh.lng}&z=16&output=embed" allowfullscreen loading="lazy"></iframe>
         </div>`
      : `<div style="font-size:12px;color:var(--text3);margin-top:8px;"><i class="ti ti-map-off"></i> No map location set — edit shop to add coordinates or Google Maps URL</div>`;

  return `
    ${sh.photoUrl ? `<div class="shop-photo"><img src="${sh.photoUrl}" alt="${sh.name}" onerror="this.parentNode.innerHTML='<span>Photo unavailable</span>'"></div>` : '<div class="shop-photo"><span><i class="ti ti-camera-off" style="font-size:24px;display:block;margin-bottom:4px;"></i>No photo yet — edit shop to add one</span></div>'}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;" class="two-col">
      <div>
        <div style="font-family:var(--font-head);font-size:18px;font-weight:700;">${sh.name}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:4px;">${sh.locationName||sh.address||'—'}</div>
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
          ${sh.avcTier&&sh.avcTier!=='none'?`<span class="badge badge-${sh.avcTier}">AVC ${sh.avcTier.toUpperCase()}</span>`:''}
          ${dist?`<span class="badge badge-muted">${dist.name}</span>`:''}
          ${agent?`<span class="badge ${ROLE_BADGE[agent.role]||'badge-muted'}">${agent.name}</span>`:''}
        </div>
      </div>
      <div>
        ${sh.ownerName?`<div class="dist-info-row"><i class="ti ti-user" style="color:var(--blue);"></i><strong>${sh.ownerName}</strong></div>`:''}
        ${sh.ownerContact?`<div class="dist-info-row"><i class="ti ti-phone" style="color:var(--blue);"></i>${sh.ownerContact}</div>`:''}
        ${sh.ownerWhatsapp?`<div class="dist-info-row"><i class="ti ti-brand-whatsapp" style="color:#25D366;"></i>${sh.ownerWhatsapp}</div>`:''}
        ${(sh.creditBalance||0)>0?`<div class="dist-info-row" style="margin-top:8px;"><i class="ti ti-credit-card" style="color:var(--red);"></i><span class="shop-debt">${fmt(sh.creditBalance)} on credit</span></div>`:'<div class="dist-info-row" style="margin-top:8px;"><i class="ti ti-check" style="color:var(--green);"></i><span style="color:var(--green);font-size:12px;">No outstanding credit</span></div>'}
      </div>
    </div>
    ${mapsEmbed}
    ${sh.googleMapsUrl?`<div style="margin-top:8px;"><a href="${sh.googleMapsUrl}" target="_blank" class="btn btn-sm btn-blue"><i class="ti ti-map-2"></i> Open in Google Maps</a></div>`:''}`;
}

/* ═══ UPDATE saveEditShop to include photo + maps ════ */
// Patch: add photo/maps fields when saving
const _origSaveEditShop = saveEditShop;
saveEditShop = async function() {
  const id = document.getElementById('edit-shop-id').value;
  try {
    const data = await api('PUT', `/shops/${id}`, {
      name:          document.getElementById('edit-shop-name').value.trim(),
      distributorId: document.getElementById('edit-shop-dist').value,
      assignedAgent: document.getElementById('edit-shop-agent').value || undefined,
      ownerName:     document.getElementById('edit-shop-owner').value.trim(),
      ownerContact:  document.getElementById('edit-shop-contact').value.trim(),
      ownerWhatsapp: document.getElementById('edit-shop-wa').value.trim(),
      address:       document.getElementById('edit-shop-addr').value.trim(),
      locationName:  document.getElementById('edit-shop-loc').value.trim(),
      avcTier:       document.getElementById('edit-shop-avc').value,
      creditBalance: parseFloat(document.getElementById('edit-shop-credit').value) || 0,
      photoUrl:      document.getElementById('edit-shop-photo')?.value.trim() || undefined,
      googleMapsUrl: document.getElementById('edit-shop-maps')?.value.trim() || undefined,
      lat:           parseFloat(document.getElementById('edit-shop-lat')?.value) || undefined,
      lng:           parseFloat(document.getElementById('edit-shop-lng')?.value) || undefined,
    });
    if (!data) return;
    const idx = shops.findIndex(s => s._id === id);
    if (idx >= 0) shops[idx] = data.data;
    closeModal('edit-shop-modal');
    renderAll();
    toast('Shop updated', 'ok');
  } catch(e) { toast(e.message, 'err'); }
};

// Also pre-fill photo/maps in openEditShopModal
const _origOpenEditShop = openEditShopModal;
openEditShopModal = function(id) {
  _origOpenEditShop(id);
  const sh = shops.find(x => x._id === id); if (!sh) return;
  const photoEl = document.getElementById('edit-shop-photo');
  const mapsEl  = document.getElementById('edit-shop-maps');
  const latEl   = document.getElementById('edit-shop-lat');
  const lngEl   = document.getElementById('edit-shop-lng');
  if (photoEl) photoEl.value = sh.photoUrl || '';
  if (mapsEl)  mapsEl.value  = sh.googleMapsUrl || '';
  if (latEl)   latEl.value   = sh.lat || '';
  if (lngEl)   lngEl.value   = sh.lng || '';
};
<<<<<<< HEAD

/* ═══════════════════════════════════════════════════
   SALESPERSON VIEW — COMPLETE IMPLEMENTATION
   Security: all data filtered to this agent only
═══════════════════════════════════════════════════ */

// ── State ────────────────────────────────────────────
let spPayMethod   = 'cash';
let spProductRows = 0;
let spShops       = [];   // shops assigned to this agent only
let spOrders      = [];   // orders created by this agent only
let spTargetData  = null; // this agent's current month target
let spProducts    = [];   // company products
let spStock       = [];   // stock for this agent's distributor
let spTheme       = localStorage.getItem('sp-theme') || 'dark';

// ── Show / hide SP view ──────────────────────────────
function showSpView() {
  document.getElementById('sp-view').classList.add('active');
  const topbar = document.querySelector('.topbar');
  const layout = document.querySelector('.layout');
  if (topbar) topbar.style.display = 'none';
  if (layout) layout.style.display = 'none';
  document.getElementById('login-screen').classList.add('hidden');
  applySpTheme(spTheme);
}
function hideSpView() {
  document.getElementById('sp-view').classList.remove('active');
  const topbar = document.querySelector('.topbar');
  const layout = document.querySelector('.layout');
  if (topbar) topbar.style.display = '';
  if (layout) layout.style.display = '';
}

// ── Theme ─────────────────────────────────────────────
function applySpTheme(theme) {
  spTheme = theme;
  localStorage.setItem('sp-theme', theme);
  if (theme === 'light') {
    document.documentElement.style.setProperty('--bg0','#f0f4f8');
    document.documentElement.style.setProperty('--bg1','#ffffff');
    document.documentElement.style.setProperty('--bg2','#ffffff');
    document.documentElement.style.setProperty('--bg3','#f0f4f8');
    document.documentElement.style.setProperty('--bg4','#e2e8f0');
    document.documentElement.style.setProperty('--text1','#1a202c');
    document.documentElement.style.setProperty('--text2','#4a5568');
    document.documentElement.style.setProperty('--text3','#a0aec0');
    document.documentElement.style.setProperty('--border','rgba(0,0,0,.08)');
    document.documentElement.style.setProperty('--border2','rgba(0,0,0,.12)');
  } else {
    document.documentElement.style.removeProperty('--bg0');
    document.documentElement.style.removeProperty('--bg1');
    document.documentElement.style.removeProperty('--bg2');
    document.documentElement.style.removeProperty('--bg3');
    document.documentElement.style.removeProperty('--bg4');
    document.documentElement.style.removeProperty('--text1');
    document.documentElement.style.removeProperty('--text2');
    document.documentElement.style.removeProperty('--text3');
    document.documentElement.style.removeProperty('--border');
    document.documentElement.style.removeProperty('--border2');
  }
}
function toggleSpTheme() {
  applySpTheme(spTheme === 'dark' ? 'light' : 'dark');
  const btn = document.getElementById('sp-theme-btn');
  if (btn) btn.innerHTML = spTheme==='light'
    ? '<i class="ti ti-moon"></i>'
    : '<i class="ti ti-sun"></i>';
}

// ── Greeting ──────────────────────────────────────────
function spGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Navigate between sp pages ─────────────────────────
function spNav(pageId, btnEl) {
  document.querySelectorAll('.sp-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sp-nav-btn').forEach(b => b.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  if (btnEl) btnEl.classList.add('active');
  // Also update bottom nav active state by data-page
  document.querySelectorAll('.sp-nav-btn[data-page]').forEach(b => {
    if (b.dataset.page === pageId) b.classList.add('active');
  });
  if (pageId === 'sp-home')     renderSpHome();
  if (pageId === 'sp-shops')    renderSpShops();
  if (pageId === 'sp-orders')   renderSpOrders();
  if (pageId === 'sp-stock')    renderSpStock();
  if (pageId === 'sp-neworder') renderSpNewOrder();
}

// ── Load all sp data (SECURE — agent filtered) ────────
async function loadSpData() {
  try {
    // Extract agentId safely — handle object, string, or undefined
    const rawAgentId = currentUser?.agentId;
    const agentId = rawAgentId?._id 
      ? String(rawAgentId._id)
      : rawAgentId 
        ? String(rawAgentId) 
        : null;
    const now = new Date();

    // Set greeting
    const greetEl  = document.getElementById('sp-greeting');
    const nameEl   = document.getElementById('sp-name');
    const compEl   = document.getElementById('sp-company-name');
    if (greetEl) greetEl.textContent = spGreeting();
    if (nameEl)  nameEl.textContent  = currentUser.fullName;
    if (compEl)  compEl.textContent  = currentCompany?.name || 'Beiersdorf Ghana';

    // Set date
    const dateEl = document.getElementById('sp-today-date');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GH',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

    // Fetch ONLY this agent's data
    // Safety check — if no agentId, can't load data
    if (!agentId) {
      const el = document.getElementById('sp-home-content');
      if (el) el.innerHTML = '<div class="empty" style="color:var(--amber);"><i class="ti ti-alert-triangle"></i><br><br>Your account is not linked to an agent record yet.<br><br>Please ask your admin to link your account to an agent.</div>';
      return;
    }

    const [pRes, sRes, shRes, oRes, tRes] = await Promise.all([
      api('GET', '/products'),
      api('GET', '/stock'),
      api('GET', `/shops?agentId=${agentId}`),
      api('GET', `/shopsales?agentId=${agentId}`),
      api('GET', `/targets?agentId=${agentId}&month=${now.getMonth()+1}&year=${now.getFullYear()}`),
    ]);

    spProducts = pRes?.data  || [];
    spStock    = sRes?.data  || [];
    spShops    = shRes?.data || [];
    spOrders   = oRes?.data  || [];

    const targets  = tRes?.data || [];
    spTargetData   = targets[0] || null;

    // Populate shop select for new order
    const shopSel = document.getElementById('sp-order-shop');
    if (shopSel) {
      shopSel.innerHTML = '<option value="">Select shop…</option>';
      spShops.forEach(s => shopSel.add(new Option(s.name, s._id)));
    }

    renderSpHome();
  } catch(e) { toast('Error loading data: ' + e.message, 'err'); }
}

// ── HOME ──────────────────────────────────────────────
function renderSpHome() {
  const now      = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const monthStr = todayStr.slice(0,7); // YYYY-MM

  // Stats
  const allOrders   = spOrders;
  const todayOrders = allOrders.filter(o => o.date === todayStr);
  const monthOrders = allOrders.filter(o => (o.date||'').startsWith(monthStr));

  // Totals — from ShopSale model: qty * price
  const calcVal = orders => orders.reduce((s,o) => s + (o.qty||0)*(o.price||0), 0);
  const todayVal = calcVal(todayOrders);
  const monthVal = calcVal(monthOrders);

  // Credit / outstanding
  const totalCredit = spShops.reduce((s,sh) => s+(sh.creditBalance||0), 0);
  const totalInvoiced = monthVal;
  const collected     = monthOrders.filter(o=>o.paymentMethod!=='credit').reduce((s,o)=>s+(o.qty||0)*(o.price||0),0);
  const outstanding   = totalCredit;

  // Target progress
  const mTarget = spTargetData?.monthlyTarget || 0;
  const mPct    = mTarget > 0 ? Math.min(100, Math.round(monthVal/mTarget*100)) : 0;
  const mColor  = mPct>=100?'var(--green)':mPct>=70?'var(--amber)':'var(--red)';

  // Overdue shops
  const overdueShops = spShops.filter(s => (s.creditBalance||0) > 0);

  const el = document.getElementById('sp-home-content');
  if (!el) return;

  el.innerHTML = `
    <!-- Today card -->
    <div class="sp-today-card">
      <div class="sp-today-date" id="sp-today-date">${now.toLocaleDateString('en-GH',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
      <div class="sp-today-title">${spGreeting()}, ${currentUser.fullName.split(' ')[0]}! 👋</div>
      <div class="sp-today-stats">
        <div class="sp-today-stat">
          <div class="sp-today-stat-val col-cyan">${fmt(todayVal)}</div>
          <div class="sp-today-stat-lbl">Today Sales</div>
        </div>
        <div class="sp-today-stat">
          <div class="sp-today-stat-val col-green">${todayOrders.length}</div>
          <div class="sp-today-stat-lbl">Orders</div>
        </div>
        <div class="sp-today-stat">
          <div class="sp-today-stat-val col-violet">${spShops.length}</div>
          <div class="sp-today-stat-lbl">Shops</div>
        </div>
      </div>
    </div>

    <!-- Monthly stats -->
    <div class="card" style="margin-bottom:12px;">
      <div class="card-title"><i class="ti ti-calendar-stats" style="color:var(--accent);"></i> This Month</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
        <div style="background:var(--bg3);border-radius:10px;padding:12px;text-align:center;">
          <div class="font-mono" style="font-size:16px;font-weight:700;color:var(--cyan);">${fmt(totalInvoiced)}</div>
          <div style="font-size:10px;color:var(--text2);text-transform:uppercase;margin-top:3px;">Total Invoiced</div>
        </div>
        <div style="background:var(--bg3);border-radius:10px;padding:12px;text-align:center;">
          <div class="font-mono" style="font-size:16px;font-weight:700;color:var(--green);">${fmt(collected)}</div>
          <div style="font-size:10px;color:var(--text2);text-transform:uppercase;margin-top:3px;">Value Collected</div>
        </div>
        <div style="background:var(--bg3);border-radius:10px;padding:12px;text-align:center;">
          <div class="font-mono" style="font-size:16px;font-weight:700;color:var(--red);">${fmt(outstanding)}</div>
          <div style="font-size:10px;color:var(--text2);text-transform:uppercase;margin-top:3px;">Outstanding</div>
        </div>
        <div style="background:var(--bg3);border-radius:10px;padding:12px;text-align:center;">
          <div class="font-mono" style="font-size:16px;font-weight:700;color:var(--amber);">${fmt(totalCredit)}</div>
          <div style="font-size:10px;color:var(--text2);text-transform:uppercase;margin-top:3px;">Credit Held</div>
        </div>
      </div>
    </div>

    <!-- Target progress -->
    ${mTarget > 0 ? `
    <div class="card" style="margin-bottom:12px;">
      <div class="card-title"><i class="ti ti-target" style="color:var(--violet);"></i> Monthly Target</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:13px;color:var(--text2);">Achievement</span>
        <span class="font-mono" style="font-size:20px;font-weight:700;color:${mColor};">${mPct}%</span>
      </div>
      <div class="sp-target-bar"><div class="sp-target-fill" style="width:${mPct}%;background:${mColor};"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-top:5px;">
        <span>${fmt(monthVal)} achieved</span>
        <span>${fmt(mTarget)} target</span>
      </div>
    </div>` : `
    <div style="padding:10px 14px;background:rgba(255,179,0,.08);border:1px solid rgba(255,179,0,.2);border-radius:9px;font-size:12px;color:var(--amber);margin-bottom:12px;">
      <i class="ti ti-info-circle"></i> No target set for this month. Ask your admin to set your target.
    </div>`}

    <!-- Quick actions -->
    <div class="sp-actions">
      <div class="sp-action-btn green" onclick="spNav('sp-neworder',null)">
        <i class="ti ti-file-plus"></i><span>New Order</span>
      </div>
      <div class="sp-action-btn cyan" onclick="spNav('sp-shops',null)">
        <i class="ti ti-building"></i><span>My Shops</span>
      </div>
      <div class="sp-action-btn amber" onclick="spNav('sp-orders',null)">
        <i class="ti ti-list"></i><span>My Orders</span>
      </div>
      <div class="sp-action-btn pink" onclick="spNav('sp-stock',null)">
        <i class="ti ti-package"></i><span>Top 10 Stock</span>
      </div>
    </div>

    <!-- Overdue alerts -->
    ${overdueShops.length > 0 ? `
    <div style="margin-bottom:12px;">
      <div style="font-size:11px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">
        <i class="ti ti-alert-circle"></i> Overdue Credit (${overdueShops.length} shop${overdueShops.length!==1?'s':''})
      </div>
      ${overdueShops.map(s=>`
        <div class="sp-shop-item overdue" style="margin-bottom:6px;" onclick="spNav('sp-shops',null)">
          <div class="sp-shop-icon" style="background:rgba(255,82,82,.1);"><i class="ti ti-credit-card" style="color:var(--red);font-size:20px;"></i></div>
          <div class="sp-shop-info">
            <div class="sp-shop-name">${s.name}</div>
            <div class="sp-shop-sub">${s.locationName||s.address||'—'}</div>
            <div class="sp-shop-debt">Owes ${fmt(s.creditBalance)}</div>
          </div>
          <i class="ti ti-chevron-right" style="color:var(--text3);"></i>
        </div>`).join('')}
    </div>` : ''}

    <!-- Recent orders -->
    <div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">
      Recent Orders Today
    </div>
    ${todayOrders.length === 0
      ? '<div class="empty">No orders logged today.</div>'
      : todayOrders.slice(0,5).map(o => {
          const shop = spShops.find(s=>s._id===(o.shopId?._id||o.shopId));
          const prod = spProducts.find(p=>p._id===(o.productId?._id||o.productId));
          const total = (o.qty||0)*(o.price||0);
          const payColor = {cash:'col-green',momo:'col-amber',credit:'col-red'}[o.paymentMethod]||'col-green';
          return `
          <div style="background:var(--bg2);border:1px solid var(--border2);border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:13px;">${shop?.name||'—'}</div>
              <div style="font-size:11px;color:var(--text2);">${prod?.name||'—'} × ${o.qty||0}</div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div class="font-mono ${payColor}" style="font-size:14px;font-weight:700;">${fmt(total)}</div>
              <div style="font-size:10px;color:var(--text2);">${(o.paymentMethod||'CASH').toUpperCase()}</div>
            </div>
          </div>`;
        }).join('')}
  `;
}

// ── MY SHOPS ──────────────────────────────────────────
function renderSpShops() {
  const el = document.getElementById('sp-shops-content');
  if (!el) return;
  const search = document.getElementById('sp-shop-search')?.value.toLowerCase()||'';
  let list = spShops.filter(s => s.isActive !== false);
  if (search) list = list.filter(s=>(s.name+s.locationName+s.ownerName).toLowerCase().includes(search));

  el.innerHTML = list.length === 0
    ? '<div class="empty">No shops assigned yet.</div>'
    : list.map(s => {
        const debt = s.creditBalance||0;
        return `
        <div class="sp-shop-item ${debt>0?'overdue':''}" style="margin-bottom:10px;">
          <div class="sp-shop-icon" style="background:${debt>0?'rgba(255,82,82,.1)':'var(--bg3)'};">
            <i class="ti ti-building" style="color:${debt>0?'var(--red)':'var(--text2)'}; font-size:20px;"></i>
          </div>
          <div class="sp-shop-info" onclick="spOpenShopOrder('${s._id}')">
            <div class="sp-shop-name">${s.name}</div>
            <div class="sp-shop-sub">${s.locationName||s.address||'—'}${s.ownerName?' · '+s.ownerName:''}</div>
            ${debt>0
              ?`<div class="sp-shop-debt"><i class="ti ti-alert-circle" style="font-size:10px;"></i> Owes ${fmt(debt)}</div>`
              :`<div style="font-size:11px;color:var(--green);margin-top:2px;"><i class="ti ti-check" style="font-size:10px;"></i> Clear</div>`}
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0;">
            <button class="btn btn-sm btn-green" onclick="spOpenShopOrder('${s._id}')"><i class="ti ti-plus"></i> Order</button>
            <button class="btn btn-sm" onclick="spViewShopOrders('${s._id}','${s.name}')"><i class="ti ti-list"></i> History</button>
          </div>
        </div>`;
      }).join('');
}

function spOpenShopOrder(shopId) {
  const shopSel = document.getElementById('sp-order-shop');
  if (shopSel) shopSel.value = shopId;
  spNav('sp-neworder', null);
  document.querySelectorAll('.sp-nav-btn[data-page="sp-neworder"]').forEach(b=>b.classList.add('active'));
  document.querySelectorAll('.sp-nav-btn:not([data-page="sp-neworder"])').forEach(b=>b.classList.remove('active'));
}

function spViewShopOrders(shopId, shopName) {
  // Switch to orders page filtered by this shop
  const shopFilter = document.getElementById('sp-orders-shop-filter');
  if (shopFilter) shopFilter.value = shopId;
  spNav('sp-orders', null);
}

// ── MY ORDERS ─────────────────────────────────────────
let spOrderStatusFilter = 'all';
let spOrderPeriodFilter = 'month';

function renderSpOrders() {
  const el = document.getElementById('sp-orders-content');
  if (!el) return;

  const now      = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const weekStart= new Date(now); weekStart.setDate(now.getDate()-now.getDay()+1);
  const weekStr  = weekStart.toISOString().split('T')[0];
  const monthStr = todayStr.slice(0,7);
  const shopFlt  = document.getElementById('sp-orders-shop-filter')?.value||'';

  // Period filter
  let periodFiltered = [...spOrders];
  if (spOrderPeriodFilter==='today') periodFiltered=periodFiltered.filter(o=>o.date===todayStr);
  else if (spOrderPeriodFilter==='week') periodFiltered=periodFiltered.filter(o=>o.date>=weekStr);
  else if (spOrderPeriodFilter==='month') periodFiltered=periodFiltered.filter(o=>(o.date||'').startsWith(monthStr));

  if (shopFlt) periodFiltered=periodFiltered.filter(o=>(o.shopId?._id||o.shopId)===shopFlt);

  // Status filter
  const filterOrder = o => {
    const total = (o.qty||0)*(o.price||0);
    const paid  = o.isPaid ? total : 0;
    const bal   = total - paid;
    const isCredit = o.paymentMethod==='credit';
    switch(spOrderStatusFilter) {
      case 'owing':    return !o.isPaid && isCredit;
      case 'paid':     return o.isPaid;
      case 'credit':   return isCredit;
      case 'overdue':  return !o.isPaid && isCredit && o.creditDue && o.creditDue < todayStr;
      case 'pending':  return !o.deliveredAt;
      default: return true;
    }
  };
  const filtered = periodFiltered.filter(filterOrder);

  // Totals for tabs
  const totalAll     = periodFiltered.length;
  const totalOwing   = periodFiltered.filter(o=>!o.isPaid&&o.paymentMethod==='credit').length;
  const totalPaid    = periodFiltered.filter(o=>o.isPaid).length;
  const totalCredit  = periodFiltered.filter(o=>o.paymentMethod==='credit').length;
  const totalOverdue = periodFiltered.filter(o=>!o.isPaid&&o.paymentMethod==='credit'&&o.creditDue&&o.creditDue<todayStr).length;
  const totalPending = periodFiltered.filter(o=>!o.deliveredAt).length;

  const grandTotal = filtered.reduce((s,o)=>s+(o.qty||0)*(o.price||0),0);

  el.innerHTML = `
    <!-- Period filter -->
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;overflow-x:auto;padding-bottom:4px;">
      ${[['all','All'],['today','Today'],['week','This Week'],['month','This Month']].map(([v,l])=>`
        <button class="tab-btn ${spOrderPeriodFilter===v?'active':''}" onclick="spOrderPeriodFilter='${v}';renderSpOrders();">${l}</button>`).join('')}
    </div>

    <!-- Shop filter -->
    <div class="form-group" style="margin-bottom:10px;">
      <select id="sp-orders-shop-filter" onchange="renderSpOrders()" style="font-size:12px;padding:7px 10px;">
        <option value="">All Shops</option>
        ${spShops.map(s=>`<option value="${s._id}">${s.name}</option>`).join('')}
      </select>
    </div>

    <!-- Status tabs -->
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;overflow-x:auto;padding-bottom:4px;">
      ${[
        ['all','All',totalAll,'badge-muted'],
        ['owing','Owing',totalOwing,'badge-red'],
        ['paid','Paid',totalPaid,'badge-green'],
        ['credit','Credit',totalCredit,'badge-amber'],
        ['overdue','Overdue',totalOverdue,'badge-red'],
        ['pending','Pending Delivery',totalPending,'badge-cyan'],
      ].map(([v,l,c,cls])=>`
        <button onclick="spOrderStatusFilter='${v}';renderSpOrders();"
          style="padding:5px 10px;border-radius:20px;font-size:10px;font-weight:700;cursor:pointer;border:1px solid var(--border2);
          background:${spOrderStatusFilter===v?'var(--accent-dim)':'var(--bg3)'};
          color:${spOrderStatusFilter===v?'var(--accent)':'var(--text2)'};">
          ${l} <span style="background:var(--bg4);padding:1px 5px;border-radius:10px;">${c}</span>
        </button>`).join('')}
    </div>

    <!-- Summary bar -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg3);border-radius:8px;margin-bottom:12px;">
      <span style="font-size:12px;color:var(--text2);">${filtered.length} order${filtered.length!==1?'s':''}</span>
      <span class="font-mono" style="font-size:14px;font-weight:700;color:var(--accent);">${fmt(grandTotal)}</span>
    </div>

    <!-- Order list -->
    ${filtered.length === 0
      ? '<div class="empty">No orders match this filter.</div>'
      : filtered.map(o => {
          const shop = spShops.find(s=>s._id===(o.shopId?._id||o.shopId));
          const prod = spProducts.find(p=>p._id===(o.productId?._id||o.productId));
          const total = (o.qty||0)*(o.price||0);
          const isOverdue = !o.isPaid && o.paymentMethod==='credit' && o.creditDue && o.creditDue < todayStr;
          const payColors  = {cash:'badge-green',momo:'badge-amber',credit:'badge-red'};
          const payClass   = payColors[o.paymentMethod]||'badge-green';
          return `
          <div style="background:var(--bg2);border:1px solid ${isOverdue?'var(--red)':'var(--border2)'};border-radius:12px;padding:13px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div>
                <div style="font-weight:700;font-size:14px;">${shop?.name||'—'}</div>
                <div style="font-size:11px;color:var(--text2);">${o.date||'—'}</div>
              </div>
              <div style="text-align:right;">
                <div class="font-mono" style="font-size:15px;font-weight:700;color:var(--cyan);">${fmt(total)}</div>
                <span class="badge ${payClass}" style="font-size:9px;">${(o.paymentMethod||'CASH').toUpperCase()}</span>
              </div>
            </div>
            <div style="font-size:12px;color:var(--text2);">${prod?.name||'—'} × ${o.qty||0} ${o.unit||'pcs'}</div>
            <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;align-items:center;">
              ${o.isPaid?'<span class="badge badge-green" style="font-size:9px;"><i class="ti ti-check" style="font-size:9px;"></i> Paid</span>':'<span class="badge badge-amber" style="font-size:9px;">Unpaid</span>'}
              ${isOverdue?'<span class="badge badge-red" style="font-size:9px;"><i class="ti ti-alert-circle" style="font-size:9px;"></i> OVERDUE</span>':''}
              ${o.deliveredAt?'<span class="badge badge-cyan" style="font-size:9px;"><i class="ti ti-check" style="font-size:9px;"></i> Delivered</span>':'<span class="badge badge-muted" style="font-size:9px;">Pending Delivery</span>'}
              <button class="btn btn-sm" style="margin-left:auto;padding:3px 8px;" onclick="spPrintOrderReceipt('${o._id}')"><i class="ti ti-printer"></i></button>
            </div>
          </div>`;
        }).join('')}
  `;
}

// ── NEW ORDER ──────────────────────────────────────────
function renderSpNewOrder() {
  const shopSel = document.getElementById('sp-order-shop');
  if (!shopSel) return;
  const current = shopSel.value;
  shopSel.innerHTML = '<option value="">Select shop…</option>';
  spShops.forEach(s => shopSel.add(new Option(s.name, s._id)));
  if (current) shopSel.value = current;

  // Reset products
  const prodWrap = document.getElementById('sp-order-products');
  if (prodWrap) { prodWrap.innerHTML = ''; spProductRows = 0; }
  spAddProductRow();
  spCalcTotal();
  spSelectPay('cash');
}

function spSelectPay(method) {
  spPayMethod = method;
  ['cash','momo','credit'].forEach(m => {
    const tab = document.getElementById('sp-pay-'+m);
    if (tab) tab.classList.toggle('active', m===method);
  });
  const momoWrap   = document.getElementById('sp-momo-wrap');
  const creditWrap = document.getElementById('sp-credit-wrap');
  if (momoWrap)   momoWrap.style.display   = method==='momo'   ? 'block' : 'none';
  if (creditWrap) creditWrap.style.display = method==='credit' ? 'block' : 'none';
}

function spAddProductRow() {
  spProductRows++;
  const rowId = 'spr-' + spProductRows;

  // Group products by category for filter
  const categories = [...new Set(spProducts.map(p=>p.cat).filter(Boolean))].sort();
  const prodOptions = spProducts.map(p=>`<option value="${p._id}" data-price="${p.price}" data-ppp="${p.pcsPerPack||1}" data-ctm="${p.pcsPerCarton||1}" data-cat="${p.cat||''}">${p.name}${p.sizeValue?' ('+p.sizeValue+(p.sizeUnit||'ml')+')':''}</option>`).join('');

  const row = `
  <div class="sp-order-product-row" id="${rowId}">
    <button class="sp-remove-prod" onclick="spRemoveRow('${rowId}')"><i class="ti ti-x"></i></button>
    <div class="form-group" style="margin-bottom:6px;">
      <label>Category Filter</label>
      <select onchange="spFilterProdsByCategory(this,'${rowId}')" style="font-size:12px;padding:6px 8px;">
        <option value="">All Products</option>
        ${categories.map(c=>`<option value="${c}">${c}</option>`).join('')}
        <option value="roll-on-50ml">Roll-Ons 50ml only</option>
        <option value="spray-150ml">Sprays 150ml only</option>
        <option value="spray-250ml">Sprays 250ml only</option>
        <option value="lotion-400ml">Lotions 400ml only</option>
        <option value="lotion-250ml">Lotions 250ml only</option>
      </select>
    </div>
    <div class="form-group" style="margin-bottom:6px;">
      <label>Product *</label>
      <select class="sp-prod-select" id="${rowId}-prod" onchange="spAutoPrice(this,'${rowId}')">
        <option value="">Select product…</option>
        ${prodOptions}
      </select>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:6px;">
      <div class="form-group">
        <label>Qty *</label>
        <input type="number" class="sp-prod-qty" id="${rowId}-qty" min="1" placeholder="0" oninput="spCalcTotal()">
      </div>
      <div class="form-group">
        <label>Unit</label>
        <select class="sp-prod-unit" id="${rowId}-unit" onchange="spCalcTotal()">
          <option value="pcs">Pcs</option>
          <option value="packs">Packs</option>
          <option value="cartons" selected>Cartons</option>
        </select>
      </div>
      <div class="form-group">
        <label>Price/Pc</label>
        <input type="number" class="sp-prod-price" id="${rowId}-price" min="0" placeholder="0.00" oninput="spCalcTotal()">
      </div>
    </div>
    <div id="${rowId}-conv" style="font-size:11px;color:var(--text3);margin-top:2px;"></div>
  </div>`;

  const wrap = document.getElementById('sp-order-products');
  if (wrap) wrap.insertAdjacentHTML('beforeend', row);
}

function spFilterProdsByCategory(sel, rowId) {
  const val     = sel.value;
  const prodSel = document.getElementById(rowId+'-prod');
  if (!prodSel) return;
  prodSel.innerHTML = '<option value="">Select product…</option>';

  let filtered = spProducts;
  if (val === 'roll-on-50ml') filtered = spProducts.filter(p=>p.cat?.toLowerCase().includes('roll')&&p.sizeValue===50);
  else if (val === 'spray-150ml') filtered = spProducts.filter(p=>p.cat?.toLowerCase().includes('spray')&&p.sizeValue===150);
  else if (val === 'spray-250ml') filtered = spProducts.filter(p=>p.cat?.toLowerCase().includes('spray')&&p.sizeValue===250);
  else if (val === 'lotion-400ml') filtered = spProducts.filter(p=>p.cat?.toLowerCase().includes('lotion')&&p.sizeValue===400);
  else if (val === 'lotion-250ml') filtered = spProducts.filter(p=>p.cat?.toLowerCase().includes('lotion')&&p.sizeValue===250);
  else if (val) filtered = spProducts.filter(p=>p.cat===val);

  filtered.forEach(p => {
    const opt = new Option(`${p.name}${p.sizeValue?' ('+p.sizeValue+(p.sizeUnit||'ml')+')':''}`, p._id);
    opt.dataset.price = p.price;
    opt.dataset.ppp   = p.pcsPerPack||1;
    opt.dataset.ctm   = p.pcsPerCarton||1;
    opt.dataset.cat   = p.cat||'';
    prodSel.add(opt);
  });
}

function spRemoveRow(rowId) {
  document.getElementById(rowId)?.remove();
  spCalcTotal();
}

function spAutoPrice(sel, rowId) {
  const opt   = sel.options[sel.selectedIndex];
  const price = parseFloat(opt?.dataset?.price||0);
  const priceEl = document.getElementById(rowId+'-price');
  if (priceEl && price) { priceEl.value = price; spCalcTotal(); }
}

function spCalcTotal() {
  const rows = document.querySelectorAll('.sp-order-product-row');
  let total = 0;
  rows.forEach(row => {
    const sel   = row.querySelector('.sp-prod-select');
    const opt   = sel?.options[sel.selectedIndex];
    const qty   = parseFloat(row.querySelector('.sp-prod-qty')?.value)||0;
    const price = parseFloat(row.querySelector('.sp-prod-price')?.value)||0;
    const unit  = row.querySelector('.sp-prod-unit')?.value||'pcs';
    const ppp   = parseInt(opt?.dataset?.ppp||1);
    const ctm   = parseInt(opt?.dataset?.ctm||1);
    let pcs = qty;
    if (unit==='packs')   pcs = qty*ppp;
    if (unit==='cartons') pcs = qty*ctm;
    const lineTotal = pcs * price;
    total += lineTotal;
    const convEl = row.querySelector('[id$="-conv"]');
    if (convEl && qty>0) convEl.textContent = `= ${pcs} pcs · ${fmt(lineTotal)}`;
    else if (convEl) convEl.textContent = '';
  });
  const el = document.getElementById('sp-order-total-val');
  if (el) el.textContent = fmt(total);
}

async function spSubmitOrder(printAfter) {
  const shopId = document.getElementById('sp-order-shop')?.value;
  if (!shopId) { toast('Please select a shop','err'); return; }

  const rows     = document.querySelectorAll('.sp-order-product-row');
  let valid      = true;
  let firstProd  = null;
  let firstQty   = 0;
  let firstPrice = 0;
  let firstUnit  = 'pcs';

  // For now use first product row (ShopSale model is single product)
  rows.forEach(row => {
    const sel   = row.querySelector('.sp-prod-select');
    const prodId= sel?.value;
    const qty   = parseFloat(row.querySelector('.sp-prod-qty')?.value)||0;
    const price = parseFloat(row.querySelector('.sp-prod-price')?.value)||0;
    const unit  = row.querySelector('.sp-prod-unit')?.value||'pcs';
    const opt   = sel?.options[sel.selectedIndex];
    const ppp   = parseInt(opt?.dataset?.ppp||1);
    const ctm   = parseInt(opt?.dataset?.ctm||1);
    if (!prodId||!qty||!price) { valid=false; return; }
    if (!firstProd) {
      firstProd  = prodId;
      const pcs  = unit==='packs'?qty*ppp:unit==='cartons'?qty*ctm:qty;
      firstQty   = pcs;
      firstPrice = price;
      firstUnit  = unit;
    }
  });

  if (!valid||!firstProd) { toast('Fill in all product details','err'); return; }

  const agentId = currentUser?.agentId?._id || currentUser?.agentId;
  const shop    = spShops.find(s=>s._id===shopId);
  const distId  = shop?.distributorId?._id || shop?.distributorId;

  const body = {
    shopId,
    agentId,
    distributorId: distId,
    productId:     firstProd,
    date:          new Date().toISOString().split('T')[0],
    qty:           firstQty,
    price:         firstPrice,
    paymentMethod: spPayMethod,
    momoNumber:    spPayMethod==='momo' ? document.getElementById('sp-momo-num')?.value||'' : undefined,
    isPaid:        spPayMethod !== 'credit',
    note:          document.getElementById('sp-order-notes')?.value||'',
  };

  try {
    const data = await api('POST', '/shopsales', body);
    if (!data) return;
    spOrders.unshift(data.data);

    // Update local shop credit
    if (spPayMethod === 'credit') {
      const sh = spShops.find(s=>s._id===shopId);
      if (sh) sh.creditBalance = (sh.creditBalance||0) + firstQty*firstPrice;
    }

    toast('Order saved!', 'ok');

    // Reset form
    const prodWrap = document.getElementById('sp-order-products');
    if (prodWrap) { prodWrap.innerHTML=''; spProductRows=0; }
    spAddProductRow();
    const notesEl = document.getElementById('sp-order-notes');
    if (notesEl) notesEl.value = '';
    spSelectPay('cash');
    spCalcTotal();

    if (printAfter) spPrintOrderReceipt(data.data._id, data.data);
    spNav('sp-home', null);
    document.querySelectorAll('.sp-nav-btn[data-page="sp-home"]').forEach(b=>b.classList.add('active'));
    document.querySelectorAll('.sp-nav-btn:not([data-page="sp-home"])').forEach(b=>b.classList.remove('active'));

  } catch(e) { toast(e.message,'err'); }
}

// ── TOP 10 STOCK ──────────────────────────────────────
const SP_TOP10_PRODUCTS = [
  'Nivea Nourishing Cocoa Lotion 400ml',
  'Nivea Perfect and Radiant Lotion 400ml',
  'Nivea Rich Nourishing Lotion 400ml',
  'Nivea Dry Impact Roll-On 50ml',
  'Nivea Dry Comfort Roll-On 50ml',
  'Nivea Pearl and Beauty Roll-On 50ml',
  'Nivea Cool Kick Roll-On 50ml',
  'Nivea Fresh Energy Roll-On 50ml',
  'Nivea Deep Original Roll-On 50ml',
  'Nivea Deep Roll-On 50ml',
];

function renderSpStock() {
  const el = document.getElementById('sp-stock-content');
  if (!el) return;

  const shop = spShops[0];
  const distId = shop?.distributorId?._id 
    ? String(shop.distributorId._id)
    : shop?.distributorId 
      ? String(shop.distributorId) 
      : null;

  // Match top10 products from the product list
  const top10 = spProducts
    .filter(p => p.isTop10)
    .sort((a,b)=>(a.top10Rank||99)-(b.top10Rank||99));

  if (!top10.length) {
    el.innerHTML = '<div class="empty">No Top 10 products configured yet. Ask your admin to set them up.</div>';
    return;
  }

  el.innerHTML = `
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px;">
      Track minimum stock levels for the 10 key Nivea lines
    </div>
    ${top10.map(p => {
      const stockEntry = spStock.find(s =>
        String(s.productId?._id||s.productId) === String(p._id) &&
        String(s.distributorId?._id||s.distributorId) === String(distId)
      );
      const qty    = stockEntry?.qty || 0;
      const minQty = p.minAgentQty || 0;
      const status = qty===0?'out':qty<minQty?'low':'ok';
      const colors = {ok:'var(--green)',low:'var(--amber)',out:'var(--red)'};
      const labels = {ok:'In Stock',low:'Low Stock',out:'OUT OF STOCK'};
      const classes= {ok:'sp10-ok',low:'sp10-low',out:'sp10-out'};
      const pct    = minQty>0 ? Math.min(100,Math.round(qty/minQty*100)) : 100;

      return `
      <div class="sp-top10-item" style="border-color:${status==='out'?'rgba(255,82,82,.4)':status==='low'?'rgba(255,179,0,.3)':'var(--border2)'};">
        <div class="sp-top10-rank" style="color:${colors[status]};">#${p.top10Rank}</div>
        <div class="sp-top10-info" style="flex:1;">
          <div class="sp-top10-name">${p.name}</div>
          <div class="sp-top10-sub">${p.sizeValue||''}${p.sizeUnit||''} · Min: ${minQty} pcs · ${p.pcsPerCarton||1} pcs/Ctn</div>
          <div style="margin-top:5px;">
            <div style="height:5px;background:var(--bg4);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${colors[status]};border-radius:3px;"></div>
            </div>
          </div>
          <span class="sp-top10-status ${classes[status]}" style="margin-top:5px;">${labels[status]}</span>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div class="sp-top10-qty" style="color:${colors[status]};">${qty}</div>
          <div style="font-size:10px;color:var(--text2);">pcs</div>
        </div>
      </div>`;
    }).join('')}
  `;
}

// ── RECEIPT PRINT ──────────────────────────────────────
function spPrintOrderReceipt(orderId, orderData) {
  const order = orderData || spOrders.find(o=>o._id===orderId);
  if (!order) { toast('Order not found','err'); return; }

  const shop    = spShops.find(s=>s._id===(order.shopId?._id||order.shopId));
  const prod    = spProducts.find(p=>p._id===(order.productId?._id||order.productId));
  const company = currentCompany?.name || 'Beiersdorf Ghana';
  const total   = (order.qty||0)*(order.price||0);
  const payLabels = {cash:'CASH',momo:'MOBILE MONEY (MoMo)',credit:'CREDIT'};
  const payColors = {cash:'pay-cash',momo:'pay-momo',credit:'pay-credit'};

  const receiptHtml = `
  <div class="receipt">
    <div class="receipt-header">
      <div class="receipt-title">${company}</div>
      <div style="font-size:11px;">Sales Receipt</div>
    </div>
    <div class="receipt-row"><span>Receipt No:</span><span><strong>${order.receiptNo||orderId}</strong></span></div>
    <div class="receipt-row"><span>Date:</span><span>${order.date||'—'}</span></div>
    <div class="receipt-row"><span>Agent:</span><span>${currentUser.fullName}</span></div>
    <hr class="receipt-divider">
    <div class="receipt-row bold"><span>Shop:</span><span>${shop?.name||'—'}</span></div>
    <div class="receipt-row"><span>Owner:</span><span>${shop?.ownerName||'—'}</span></div>
    <div class="receipt-row"><span>Location:</span><span>${shop?.locationName||'—'}</span></div>
    <hr class="receipt-divider">
    <div class="receipt-row bold"><span>Product:</span><span>${prod?.name||order.productName||'—'}</span></div>
    <div class="receipt-row"><span>Qty:</span><span>${order.qty} ${order.unit||'pcs'}</span></div>
    <div class="receipt-row"><span>Unit Price:</span><span>${fmt(order.price||0)}</span></div>
    <div class="receipt-row total"><span>TOTAL</span><span>${fmt(total)}</span></div>
    <hr class="receipt-divider">
    <div class="receipt-row">
      <span>Payment:</span>
      <span class="payment-badge ${payColors[order.paymentMethod]||'pay-cash'}">${payLabels[order.paymentMethod]||'CASH'}</span>
    </div>
    ${order.paymentMethod==='credit'&&order.creditDue?`<div class="receipt-row"><span>Due Date:</span><span>${order.creditDue}</span></div>`:''}
    ${!order.isPaid?`<div class="receipt-row" style="color:#c62828;font-weight:700;"><span>Status:</span><span>UNPAID</span></div>`:''}
    ${order.note?`<div class="receipt-row"><span>Note:</span><span>${order.note}</span></div>`:''}
    <div class="receipt-footer">
      <div>Thank you for your business!</div>
      <div style="font-size:10px;margin-top:4px;">Powered by DistroSaaS</div>
    </div>
  </div>`;

  const previewEl = document.getElementById('receipt-preview-body');
  if (previewEl) previewEl.innerHTML = receiptHtml;
  openModal('receipt-modal');
}

// ── SYNC BUTTON ────────────────────────────────────────
async function spSyncData() {
  const btn = document.getElementById('sp-sync-btn');
  if (btn) { btn.innerHTML='<i class="ti ti-loader-2" style="animation:spin .8s linear infinite;"></i> Syncing…'; btn.disabled=true; }
  try {
    await loadSpData();
    toast('Data synced successfully!', 'ok');
  } catch(e) {
    toast('Sync failed: ' + e.message, 'err');
  } finally {
    if (btn) { btn.innerHTML='<i class="ti ti-refresh"></i> Sync'; btn.disabled=false; }
  }
}

// ── EXCEL EXPORT (sp own data only) ───────────────────
function spExportExcel() {
  const wb = XLSX.utils.book_new();
  const now = new Date();

  // Orders sheet
  const oHeaders = ['Date','Shop','Product','Qty','Unit','Unit Price','Total','Payment','Status','Delivered'];
  const oRows = spOrders.map(o => {
    const shop = spShops.find(s=>s._id===(o.shopId?._id||o.shopId));
    const prod = spProducts.find(p=>p._id===(o.productId?._id||o.productId));
    const total = (o.qty||0)*(o.price||0);
    return [
      o.date||'', shop?.name||'—', prod?.name||'—',
      o.qty||0, o.unit||'pcs', o.price||0, total,
      o.paymentMethod||'cash',
      o.isPaid?'Paid':'Unpaid',
      o.deliveredAt?'Delivered':'Pending',
    ];
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([oHeaders,...oRows]), 'My Orders');

  // Shops sheet
  const sHeaders = ['Shop Name','Location','Owner','Contact','AVC Tier','Credit Balance'];
  const sRows = spShops.map(s=>[s.name,s.locationName||'',s.ownerName||'',s.ownerContact||'',s.avcTier||'none',s.creditBalance||0]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([sHeaders,...sRows]), 'My Shops');

  XLSX.writeFile(wb, `${currentUser.fullName.replace(/\s+/g,'_')}_Report_${now.toISOString().slice(0,10)}.xlsx`);
  toast('Excel exported!', 'ok');
}



/* ═══════════════════════════════════════════════════
   TARGET MANAGEMENT — ADMIN
   Set monthly + weekly targets per agent
═══════════════════════════════════════════════════ */

async function openTargetModal() {
  const now = new Date();

  // Set defaults
  const monthSel = document.getElementById('target-month');
  const yearEl   = document.getElementById('target-year');
  if (monthSel) monthSel.value = now.getMonth() + 1;
  if (yearEl)   yearEl.value   = now.getFullYear();

  // Ensure agents are loaded
  if (!agents || agents.length === 0) {
    try {
      const aRes = await api('GET', '/agents');
      if (aRes) agents = aRes.data;
    } catch(e) {
      toast('Could not load agents: ' + e.message, 'err');
      return;
    }
  }

  // Ensure distributors are loaded
  if (!distributors || distributors.length === 0) {
    try {
      const dRes = await api('GET', '/distributors');
      if (dRes) distributors = dRes.data;
    } catch(e) { console.warn('Could not load distributors:', e.message); }
  }

  // Check modal exists
  const modal = document.getElementById('target-modal');
  if (!modal) {
    toast('Target modal missing — please refresh the page', 'err');
    return;
  }

  await loadTargetAgentRows();
  openModal('target-modal');
}

async function loadTargetAgentRows() {
  const el = document.getElementById('target-agents-list');
  if (!el) return;

  const month = parseInt(document.getElementById('target-month')?.value) || new Date().getMonth()+1;
  const year  = parseInt(document.getElementById('target-year')?.value)  || new Date().getFullYear();

  el.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text2);"><i class="ti ti-loader-2"></i> Loading agents…</div>';

  try {
    // Fetch existing targets for this period
    const tRes = await api('GET', `/targets?month=${month}&year=${year}`);
    const existing = tRes?.data || [];

    if (!agents || agents.length === 0) {
      el.innerHTML = '<div class="empty">No agents found. Add agents in Setup first.</div>';
      return;
    }

    el.innerHTML = agents.map(a => {
      const dist  = distributors.find(d => d._id === (a.distributorId?._id||a.distributorId));
      const t     = existing.find(x => String(x.agentId?._id||x.agentId) === String(a._id));
      const mt    = t?.monthlyTarget || 0;
      const wt    = t?.weeklyTargets || {};

      return `
      <div style="padding:16px 0;border-bottom:1px solid var(--border);">
        <!-- Agent header -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:var(--bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="ti ${a.role==='OMR'?'ti-id-badge-2':'ti-user-check'}" style="font-size:18px;color:var(--accent);"></i>
          </div>
          <div>
            <div style="font-weight:700;font-size:14px;color:var(--text1);">${a.name}</div>
            <div style="font-size:11px;color:var(--text2);">${a.role} · ${dist?.name||'—'}</div>
          </div>
          ${mt > 0 ? `<span class="badge badge-green" style="margin-left:auto;">Set: ${fmt(mt)}</span>` : '<span class="badge badge-muted" style="margin-left:auto;">Not set</span>'}
        </div>

        <!-- Monthly target -->
        <div class="form-group" style="margin-bottom:10px;">
          <label>Monthly Target (GH₵)</label>
          <input type="number" id="tgt-m-${a._id}" value="${mt||''}" min="0"
            placeholder="e.g. 15000"
            oninput="spAutoFillWeekly('${a._id}')"
            style="font-size:14px;padding:10px 12px;">
        </div>

        <!-- Weekly breakdown -->
        <div>
          <div style="font-size:10px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">
            Weekly Breakdown (WK1–WK5)
          </div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
            ${['wk1','wk2','wk3','wk4','wk5'].map((wk,i) => `
              <div>
                <div style="font-size:9px;color:var(--text3);text-align:center;margin-bottom:4px;font-weight:700;">WK${i+1}</div>
                <input type="number" id="tgt-${wk}-${a._id}"
                  value="${wt[wk]||''}" min="0" placeholder="0"
                  style="text-align:center;padding:7px 4px;font-size:11px;">
              </div>`).join('')}
          </div>
        </div>
      </div>`;
    }).join('');

  } catch(e) {
    el.innerHTML = `<div class="empty" style="color:var(--red);">Error: ${e.message}</div>`;
  }
}

function spAutoFillWeekly(agentId) {
  const monthly = parseFloat(document.getElementById('tgt-m-' + agentId)?.value) || 0;
  if (!monthly) return;
  const perWeek = Math.round(monthly / 5);
  ['wk1','wk2','wk3','wk4','wk5'].forEach(wk => {
    const el = document.getElementById(`tgt-${wk}-${agentId}`);
    if (el && !el.value) el.value = perWeek;
  });
}

async function saveAllTargets() {
  const month = parseInt(document.getElementById('target-month')?.value) || new Date().getMonth()+1;
  const year  = parseInt(document.getElementById('target-year')?.value)  || new Date().getFullYear();

  const btn = document.querySelector('#target-modal .btn-violet');
  if (btn) { btn.disabled=true; btn.innerHTML='<i class="ti ti-loader-2"></i> Saving…'; }

  let saved=0, failed=0, skipped=0;

  for (const a of agents) {
    const mEl = document.getElementById('tgt-m-' + a._id);
    if (!mEl) continue;
    const monthlyTarget = parseFloat(mEl.value) || 0;

    if (monthlyTarget === 0) { skipped++; continue; }

    const weeklyTargets = {
      wk1: parseFloat(document.getElementById(`tgt-wk1-${a._id}`)?.value) || Math.round(monthlyTarget/5),
      wk2: parseFloat(document.getElementById(`tgt-wk2-${a._id}`)?.value) || Math.round(monthlyTarget/5),
      wk3: parseFloat(document.getElementById(`tgt-wk3-${a._id}`)?.value) || Math.round(monthlyTarget/5),
      wk4: parseFloat(document.getElementById(`tgt-wk4-${a._id}`)?.value) || Math.round(monthlyTarget/5),
      wk5: parseFloat(document.getElementById(`tgt-wk5-${a._id}`)?.value) || Math.round(monthlyTarget/5),
    };

    try {
      await api('POST', '/targets', {
        agentId:       a._id,
        distributorId: a.distributorId?._id || a.distributorId,
        month, year, monthlyTarget, weeklyTargets,
      });
      saved++;
    } catch(e) {
      console.error('Target save failed for', a.name, ':', e.message);
      failed++;
    }
  }

  if (btn) { btn.disabled=false; btn.innerHTML='<i class="ti ti-device-floppy"></i> Save All Targets'; }
  closeModal('target-modal');

  if (saved > 0) {
    toast(`✅ Targets saved for ${saved} agent${saved!==1?'s':''}${skipped?' ('+skipped+' skipped)':''}`, 'ok');
  } else if (failed > 0) {
    toast('Failed to save. Try again.', 'err');
  } else {
    toast('No targets entered — fill in monthly amounts first.', 'info');
  }

  // Refresh local targets
  try {
    const tRes = await api('GET', '/targets');
    if (tRes) targets = tRes.data;
  } catch(_) {}
}


Object.assign(window, {
  // Auth
  doLogin, doRegister, doLogout, showRegisterForm, goHome,
=======
Object.assign(window, {
  // Auth
  doLogin, doRegister, doLogout, showRegisterForm,
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
  // Nav
  sw, toggleSidebar, closeSidebar,
  // Modals
  openModal, closeModal,
  closeImportModal, openImportModal,
  handleImportDrop, handleImportFile, previewImport, applyImport, downloadStockTemplate,
  // Super admin
  addCompany, openEditCompanyModal, saveEditCompany, suspendCompany, activateCompany,
  superSwitchCompany, backToSuperAdmin,
  // Distributors
  addDistributor, removeDist, openEditDistModal, saveEditDist,
  // Agents
  addAgent, removeAgent, openEditAgentModal, saveEditAgent,
  renderAgents,
  // Shops
  addShop, removeShop, openEditShopModal, saveEditShop, showQuickAddShop,
  renderShops,
  // Products
  addProduct, removeProd, openEditProductModal, saveEditProduct,
  renderProductCatalogue, updatePkgSummary, updateEditPkgSummary,
  applyPkgPreset, previewProdImg,
  // Stock
  saveStock,
  // Dispatch
  addDispatch, confirmDispatch, deleteDispatch, filterAgentsByDist, autofillPrice,
  renderDispatch,
  // Reports
  renderReports,
  // Promotions
  openAddPromoModal, savePromo, removePromo,
  // Detail pages
  openDistDetail, openAgentDetail, closeDetail,
  // Sales & receipts
  openSaleModal, selectPayMethod, autoFillSalePrice, updateSaleTotal,
  submitSale, showReceiptModal, printReceipt,
<<<<<<< HEAD
  // Salesperson view
  showSpView, hideSpView, spNav, spSelectPay, toggleSpTheme,
  spAddProductRow, spRemoveRow, spAutoPrice, spCalcTotal, spFilterProdsByCategory,
  spSubmitOrder, spPrintOrderReceipt, spOpenShopOrder, spViewShopOrders,
  renderSpShops, renderSpOrders, renderSpStock, spViewShopOrders,
  spSyncData, spExportExcel,
  // Targets
  openTargetModal, loadTargetAgentRows, saveAllTargets, spAutoFillWeekly,
=======
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
  // Export
  exportAllExcel,
});

/* ═══ INIT ════════════════════════════════════════════ */
<<<<<<< HEAD
// Run after window.assign so all functions are globally available
// Init — runs immediately after window functions are assigned
=======
>>>>>>> a50ac663ea68032a9b040b7c973b5a0b9334bfdf
const dateEl = document.getElementById('d-date');
if (dateEl) dateEl.value = today();
checkAuth();
