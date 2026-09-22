/* ============================================================
   SmartSeva — app.js
   Full platform logic: storage, customers, documents, timers
   ============================================================ */

// ─── DATA ────────────────────────────────────────────────────
console.log("✅ app.js Loaded");
const SERVICE_DAYS = {
  'Income Certificate': 15,
  'Caste Certificate': 21,
  'Domicile Certificate': 21,
  'PAN Card': 30,
  'Aadhaar Update': 14,
  'PM Kisan Registration': 30,
  'Passport Application': 45,
  'Driving License': 30,
  'Scholarship': 60,
  'Property Record (7/12)': 7,
  'PMAY Housing': 45,
  'Ayushman Bharat': 30,
  'Birth Certificate': 10,
  'Death Certificate': 10,
  'Marriage Certificate': 15,
};

const SERVICE_DOCS = {
  'Income Certificate':     ['Aadhaar card', 'Ration card', 'Electricity bill', 'Passport photo'],
  'Caste Certificate':      ['Aadhaar card', 'Ration card', 'Passport photo', 'School leaving certificate'],
  'Domicile Certificate':   ['Aadhaar card', 'Ration card', 'Passport photo', '15-year residence proof'],
  'PAN Card':               ['Aadhaar card', 'Passport photo', 'Signature on white paper'],
  'Aadhaar Update':         ['Proof of address', 'Proof of identity', 'Mobile number'],
  'PM Kisan Registration':  ['Aadhaar card', 'Land record (7/12)', 'Bank passbook', 'Mobile number'],
  'Passport Application':   ['Aadhaar card', 'Birth certificate', 'Passport photo ×2', 'Police verification'],
  'Driving License':        ['Aadhaar card', 'Passport photo', 'Signature', 'Medical certificate (Form 1A)'],
  'Scholarship':            ['Aadhaar card', 'Caste certificate', 'Income certificate', 'Previous year marksheet', 'Bank passbook'],
  'Property Record (7/12)': ['Application form', 'Previous record copy', 'Survey number details'],
  'PMAY Housing':           ['Aadhaar card', 'Income certificate', 'Ration card', 'Bank passbook', 'Photo'],
  'Ayushman Bharat':        ['Aadhaar card', 'Ration card', 'Mobile number'],
  'Birth Certificate':      ['Hospital discharge summary', 'Parents Aadhaar', 'Application form'],
  'Death Certificate':      ['Hospital death summary', 'Applicant Aadhaar', 'Application form'],
  'Marriage Certificate':   ['Both Aadhaar cards', 'Wedding photo', 'Witness details ×2', 'Marriage invitation card'],
};

const SERVICE_INFO = {
  'Income Certificate':     { fee: '₹0 (free)', portal: 'aaplesarkar.mahaonline.gov.in' },
  'Caste Certificate':      { fee: '₹0 (free)', portal: 'aaplesarkar.mahaonline.gov.in' },
  'PAN Card':               { fee: '₹107 (online)', portal: 'onlineservices.nsdl.com' },
  'Aadhaar Update':         { fee: '₹50', portal: 'uidai.gov.in' },
  'PM Kisan Registration':  { fee: '₹0 (free)', portal: 'pmkisan.gov.in' },
  'Passport Application':   { fee: '₹1500–3500', portal: 'passportindia.gov.in' },
  'Driving License':        { fee: '₹200–500', portal: 'sarathi.parivahan.gov.in' },
  'Scholarship':            { fee: '₹0 (free)', portal: 'mahadbt.maharashtra.gov.in' },
};

const PORTALS = [
  { name: 'e-MahaBhumi',        url: 'https://mahabhumi.gov.in',                     icon: 'fa-map-location-dot', color: 'di-amber', desc: 'Land records, 7/12 extract' },
  { name: 'Aaple Sarkar',       url: 'https://aaplesarkar.mahaonline.gov.in',         icon: 'fa-building-columns', color: 'di-blue',  desc: 'Income, caste, domicile certs' },
  { name: 'MahaDBT',            url: 'https://mahadbt.maharashtra.gov.in',            icon: 'fa-hand-holding-dollar', color: 'di-green', desc: 'Scholarship & scheme benefits' },
  { name: 'UIDAI / Aadhaar',    url: 'https://uidai.gov.in',                          icon: 'fa-id-card',          color: 'di-blue',  desc: 'Aadhaar update, enroll, download' },
  { name: 'PAN / NSDL',         url: 'https://www.onlineservices.nsdl.com',           icon: 'fa-credit-card',      color: 'di-purple', desc: 'PAN card apply & correction' },
  { name: 'Passport Seva',      url: 'https://passportindia.gov.in',                  icon: 'fa-passport',         color: 'di-blue',  desc: 'Passport apply, renew, track' },
  { name: 'DigiLocker',         url: 'https://digilocker.gov.in',                     icon: 'fa-lock',             color: 'di-amber', desc: 'Digital document storage' },
  { name: 'PM Kisan',           url: 'https://pmkisan.gov.in',                        icon: 'fa-tractor',          color: 'di-green', desc: 'Farmer benefit registration' },
  { name: 'Ayushman Bharat',    url: 'https://pmjay.gov.in',                          icon: 'fa-heart-pulse',      color: 'di-red',   desc: 'Health insurance — PMJAY' },
  { name: 'SARATHI DL',         url: 'https://sarathi.parivahan.gov.in',              icon: 'fa-car',              color: 'di-amber', desc: 'Driving license apply & renew' },
  { name: 'VAHAN (RC)',         url: 'https://vahan.parivahan.gov.in',                icon: 'fa-car-side',         color: 'di-purple', desc: 'Vehicle registration & RC' },
  { name: 'Income Tax',         url: 'https://incometax.gov.in',                      icon: 'fa-file-invoice-dollar', color: 'di-blue', desc: 'ITR filing & tax records' },
  { name: 'GST Portal',         url: 'https://gst.gov.in',                            icon: 'fa-file-invoice',     color: 'di-amber', desc: 'GST registration & returns' },
  { name: 'Employment Exchange',url: 'https://www.mahaswayam.gov.in',                 icon: 'fa-briefcase',        color: 'di-green', desc: 'Job registration & schemes' },
  { name: 'Election Commission',url: 'https://voters.eci.gov.in',                     icon: 'fa-person-booth',     color: 'di-purple', desc: 'Voter ID, EPIC, registration' },
];

// ─── DB ──────────────────────────────────────────────────────
let DB = { customers: [], documents: [], settings: {}, income: [] };
let draftTimer = null;
let incomeFilter = 'today';
let docsFilter = 'all';

function loadDB() {
  try {
    const raw = localStorage.getItem('smartseva_db');
    if (raw) DB = JSON.parse(raw);
    if (!DB.customers) DB.customers = [];
    if (!DB.documents) DB.documents = [];
    if (!DB.settings) DB.settings = {};
  } catch(e) { console.warn('DB load error', e); }
  applySettings();
  loadCustomers();    // customers come from the backend
  loadDocuments();    // documents come from the backend too
  refreshAll();
}

function saveDB() {
  try { localStorage.setItem('smartseva_db', JSON.stringify(DB)); } catch(e) {}
}

// ─── TOAST ───────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  el.style.borderColor = type === 'error' ? 'var(--danger)' : 'var(--success)';
  el.style.color = type === 'error' ? 'var(--danger)' : 'var(--success)';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

function markDraft() {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => toast('Draft auto-saved'), 1400);
}

// ─── NAVIGATION ──────────────────────────────────────────────
function navTo(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + page);
  if (pg) pg.classList.add('active');

  const titles = {
    home: 'Dashboard', customers: 'Customers', 'new-doc': 'New document',
    docs: 'All documents', timers: 'Timers & status', income: 'Daily income',
    portals: 'Gov portals', receipt: 'Receipt generator', settings: 'Settings'
  };
  document.getElementById('page-title').textContent = titles[page] || page;

  document.getElementById('sidebar').classList.remove('open');

  if (page === 'home') renderHome();
  if (page === 'docs') renderDocs();
  if (page === 'timers') renderTimers();
  if (page === 'income') renderIncome();
  if (page === 'customers') renderCustomers();
  if (page === 'portals') renderPortals();
  if (page === 'settings') renderSettings();
  if (page === 'receipt') populateReceiptSelect();
}

// ─── SETTINGS ────────────────────────────────────────────────
function applySettings() {
  const s = DB.settings;
  if (s.kendra) document.getElementById('kendra-name-display').textContent = s.kendra;
  if (s.kendra) setVal('s-kendra', s.kendra);
  if (s.operator) setVal('s-operator', s.operator);
  if (s.village) setVal('s-village', s.village);
  if (s.mobile) setVal('s-mobile', s.mobile);
  if (s.address) setVal('s-address', s.address);
}

function saveSettings() {
  DB.settings = {
    kendra: getVal('s-kendra'),
    operator: getVal('s-operator'),
    village: getVal('s-village'),
    mobile: getVal('s-mobile'),
    address: getVal('s-address'),
  };
  saveDB();
  applySettings();
  toast('Settings saved');
}

function renderSettings() {
  applySettings();
  const bytes = JSON.stringify(DB).length;
  document.getElementById('storage-info').innerHTML = `
    <b>${DB.customers.length}</b> customer${DB.customers.length !== 1 ? 's' : ''} stored &nbsp;·&nbsp;
    <b>${DB.documents.length}</b> document${DB.documents.length !== 1 ? 's' : ''} stored<br>
    Storage used: ~${(bytes / 1024).toFixed(1)} KB of ~5 MB localStorage<br>
    <span style="color:var(--text-muted)">Data is saved in this browser only. Export feature coming soon.</span>
  `;
}

function clearAllData() {
  if (!confirm('This will delete ALL customers and documents. Are you sure?')) return;
  DB = { customers: [], documents: [], settings: DB.settings };
  saveDB();
  refreshAll();
  toast('All data cleared');
}

// ─── CUSTOMERS ───────────────────────────────────────────────
async function saveCustomer() {
  const customer = {
    full_name: getVal('c-name').trim(),
    mobile: getVal('c-mobile').trim(),
    aadhaar: getVal('c-aadhaar').trim(),
    dob: getVal('c-dob'),
    father_name: getVal('c-father').trim(),
    caste: getVal('c-caste'),
    email: getVal('c-email').trim(),
    village: getVal('c-village').trim(),
    address: getVal('c-address').trim()
  };

  if (!customer.full_name || !customer.mobile) {
    toast('Name and Mobile are required', 'error');
    return;
  }

  try {
    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });

    let data = {};
    try { data = await response.json(); } catch (_) { /* non-JSON error body, ignore */ }

    if (!response.ok) {
      toast(data.message || `Failed to save customer (${response.status})`, 'error');
      return;
    }

    toast('Customer saved successfully');
    clearCustForm();
    await loadCustomers();
  } catch (err) {
    console.error('saveCustomer error:', err);
    toast('Server connection failed — is the backend running?', 'error');
  }
}

function clearCustForm() {
  ['c-name','c-mobile','c-aadhaar','c-father','c-email','c-village','c-address'].forEach(id => setVal(id, ''));
  setVal('c-dob', '');
}

async function loadCustomers() {
  try {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error('Failed to load customers (' + res.status + ')');
    DB.customers = await res.json();
  } catch (err) {
    console.error('loadCustomers error:', err);
    toast('Could not load customers — is the backend running?', 'error');
    DB.customers = DB.customers || [];
  }
  renderCustomers();
  updateNavBadges();
}

function filterCustomers(q) { renderCustomers(q); }

function docCountForCustomer(mobile) {
  return DB.documents.filter(d => d.mobile === mobile).length;
}

// Renders the customer list table — was missing entirely before.
function renderCustomers(query) {
  const wrap = document.getElementById('cust-list-wrap');
  const countLabel = document.getElementById('cust-count-label');
  const colors = ['di-blue', 'di-green', 'di-amber', 'di-purple'];

  const q = (query !== undefined ? query : (document.getElementById('cust-search')?.value || '')).trim().toLowerCase();

  let list = DB.customers || [];
  if (q) {
    list = list.filter(c =>
      ((c.full_name || '') + (c.mobile || '')).toLowerCase().includes(q)
    );
  }

  countLabel.textContent = list.length + (list.length === 1 ? ' customer' : ' customers');

  if (list.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><i class="fa-solid fa-users"></i><p>No customers found.<br>Add your first customer to get started.</p></div>`;
    return;
  }

  wrap.innerHTML = list.map((c, i) => `
    <div class="customer-row" onclick="showCustomerModal(${c.id})">
      <div class="avatar ${colors[i % 4]}">
        ${esc((c.full_name || '?').substring(0, 2).toUpperCase())}
      </div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${esc(c.full_name)}</div>
        <div style="font-size:11px;color:var(--text-muted)">
          ${esc(c.mobile)}${c.caste ? ' · ' + esc(c.caste) : ''}${c.village ? ' · ' + esc(c.village) : ''}
        </div>
      </div>
      <div style="font-size:11px;color:var(--text-muted)">${docCountForCustomer(c.mobile)} doc${docCountForCustomer(c.mobile) !== 1 ? 's' : ''}</div>
    </div>
  `).join('');
}

function showCustomerModal(id) {
  const c = DB.customers.find(c => c.id === id);
  if (!c) return;
  const docs = DB.documents.filter(d => d.mobile === c.mobile);

  document.getElementById('modal-title').textContent = c.full_name;
  document.getElementById('modal-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      ${mrow('Mobile', c.mobile)}
      ${mrow('Aadhaar', c.aadhaar || '—')}
      ${mrow('Date of birth', c.dob || '—')}
      ${mrow('Caste', c.caste || '—')}
      ${mrow("Father's name", c.father_name || '—')}
      ${mrow('Email', c.email || '—')}
      ${mrow('Village', c.village || '—')}
    </div>
    ${c.address ? `<div style="font-size:12px;color:var(--text-3);margin-bottom:16px"><b>Address:</b> ${esc(c.address)}</div>` : ''}
    <div style="font-size:13px;font-weight:600;margin-bottom:8px">Documents (${docs.length})</div>
    ${docs.length === 0 ? '<p style="font-size:12px;color:var(--text-muted)">No documents yet.</p>' :
      docs.map(d => `<div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid var(--border)">
        <span>${esc(d.service)} — ${esc(d.submittedDate)}</span>
        <span class="status-pill ${statusPillClass(d.status, d)}">${d.status}</span>
      </div>`).join('')
    }
    <div style="margin-top:14px;display:flex;gap:8px">
      <button class="btn btn-primary btn-sm" onclick="closeModal();prefillDoc('${c.mobile}')"><i class="fa-solid fa-file-plus"></i> New document</button>
      <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${id})"><i class="fa-solid fa-trash"></i> Delete</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('cust-modal').classList.add('open');
}

function mrow(label, value) {
  return `<div><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px">${label}</div><div style="font-size:13px;font-weight:500">${esc(String(value))}</div></div>`;
}

async function deleteCustomer(id) {
  if (!confirm('Delete this customer?')) return;
  try {
    const res = await fetch('/api/customers/' + id, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed (' + res.status + ')');
    closeModal();
    await loadCustomers();
    toast('Customer deleted');
  } catch (err) {
    console.error('deleteCustomer error:', err);
    toast('Could not delete customer — is the backend running?', 'error');
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('cust-modal').classList.remove('open');
}

// ─── DOCUMENT BUILDER ────────────────────────────────────────
function prefillDoc(mobile) {
  navTo('new-doc');
  setVal('d-mobile', mobile);
  onDocMobileInput(mobile);
}

function onDocMobileInput(val) {
  const dd = document.getElementById('autofill-dd');
  const colors = ['di-blue', 'di-green', 'di-amber', 'di-purple'];
  const clean = val.replace(/\s/g, '');

  if (clean.length < 3) { dd.classList.remove('show'); return; }

  const matches = DB.customers.filter(c => c.mobile.replace(/\s/g, '').includes(clean));

  if (matches.length > 0 && clean.length < 10) {
    dd.innerHTML = matches.map((c, i) => `
      <div class="customer-row" onclick="selectCustomerForDoc('${c.mobile}')">
        <div class="avatar ${colors[i % 4]}">
          ${esc((c.full_name || '?').substring(0, 2).toUpperCase())}
        </div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600">${esc(c.full_name)}</div>
          <div style="font-size:11px;color:var(--text-muted)">
            ${esc(c.mobile)}${c.caste ? ' · ' + esc(c.caste) : ''}${c.village ? ' · ' + esc(c.village) : ''}
          </div>
        </div>
      </div>
    `).join('');
    dd.classList.add('show');
  } else {
    dd.classList.remove('show');
  }

  const exact = DB.customers.find(c => c.mobile.replace(/\s/g, '') === clean || c.mobile === val.trim());
  if (exact) selectCustomerForDoc(exact.mobile, false);
}

function selectCustomerForDoc(mobile, closeDD = true) {
  const c = DB.customers.find(c => c.mobile === mobile);
  if (!c) return;
  setVal('d-mobile', c.mobile);
  setVal('d-name', c.full_name);
  setVal('d-aadhaar', c.aadhaar || '');
  setVal('d-father', c.father_name || '');
  setVal('d-caste', c.caste || '');
  setVal('d-address', c.address || '');
  document.getElementById('autofill-banner').style.display = 'flex';
  if (closeDD) document.getElementById('autofill-dd').classList.remove('show');
}

function onServiceChange() {
  const svc = getVal('d-service');
  const sub = getVal('d-submitted');
  const days = SERVICE_DAYS[svc];

  if (sub && days) {
    const d = new Date(sub);
    d.setDate(d.getDate() + days);
    setVal('d-expected', d.toISOString().split('T')[0]);
  }

  const box = document.getElementById('doc-checklist');
  const items = document.getElementById('checklist-items');
  if (SERVICE_DOCS[svc]) {
    box.style.display = 'block';
    items.innerHTML = `<div class="checklist-items">${SERVICE_DOCS[svc].map(doc => `
      <div class="check-item" onclick="this.classList.toggle('checked');this.querySelector('i').className=this.classList.contains('checked')?'fa-solid fa-check':'fa-regular fa-circle'">
        <i class="fa-regular fa-circle"></i> ${esc(doc)}
      </div>`).join('')}</div>`;
  } else { box.style.display = 'none'; }

  const strip = document.getElementById('service-info-strip');
  const info = SERVICE_INFO[svc];
  if (info) {
    strip.style.display = 'flex';
    strip.innerHTML = `
      <span><i class="fa-solid fa-clock"></i> Processing: <b>${days} working days</b></span>
      <span><i class="fa-solid fa-indian-rupee-sign"></i> Govt fee: <b>${info.fee}</b></span>
      <span><i class="fa-solid fa-link"></i> Portal: <b>${info.portal}</b></span>`;
  } else if (days) {
    strip.style.display = 'flex';
    strip.innerHTML = `<span><i class="fa-solid fa-clock"></i> Processing: <b>${days} working days</b></span>`;
  } else { strip.style.display = 'none'; }
}

async function saveDocument() {
  const svc = getVal('d-service');
  const name = getVal('d-name').trim();
  const mobile = getVal('d-mobile').trim();
  if (!svc) { toast('Please select a service type', 'error'); return; }
  if (!name) { toast('Customer name is required', 'error'); return; }

  const submitted = getVal('d-submitted') || today();
  const days = SERVICE_DAYS[svc] || 14;
  let expected = getVal('d-expected');
  if (!expected) {
    const d = new Date(submitted);
    d.setDate(d.getDate() + days);
    expected = d.toISOString().split('T')[0];
  }

  const doc = {
    id: Date.now(),
    service: svc,
    customerName: name,
    mobile,
    aadhaar: getVal('d-aadhaar'),
    father: getVal('d-father'),
    caste: getVal('d-caste'),
    address: getVal('d-address'),
    fee: parseInt(getVal('d-fee')) || 0,
    ref: getVal('d-ref'),
    notes: getVal('d-notes'),
    submittedDate: submitted,
    expectedDate: expected,
    expectedDays: days,
    status: 'Processing',
    createdAt: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/smartseva-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });

    let data = {};
    try { data = await res.json(); } catch (_) { /* ignore */ }

    if (!res.ok) {
      toast(data.message || `Failed to save document (${res.status})`, 'error');
      return;
    }

    toast(`Document saved — timer set for ${days} days`);
    clearDocForm();
    await loadDocuments();
  } catch (err) {
    console.error('saveDocument error:', err);
    toast('Server connection failed — is the backend running?', 'error');
  }
}

async function loadDocuments() {
  try {
    const res = await fetch('/api/smartseva-documents');
    if (!res.ok) throw new Error('Failed to load documents (' + res.status + ')');
    const data = await res.json();

    // Map backend column names (snake_case) to the shape the rest of app.js expects
    DB.documents = (data.documents || []).map(d => ({
      id: d.id,
      service: d.service,
      customerName: d.customer_name,
      mobile: d.mobile,
      aadhaar: d.aadhaar,
      father: d.father_name,
      caste: d.caste,
      address: d.address,
      fee: d.fee,
      ref: d.ref_no,
      notes: d.notes,
      submittedDate: d.submitted_date ? String(d.submitted_date).split('T')[0] : '',
      expectedDate: d.expected_date ? String(d.expected_date).split('T')[0] : '',
      expectedDays: d.expected_days,
      status: d.status,
      createdAt: d.created_at,
      doneAt: d.done_at
    }));
  } catch (err) {
    console.error('loadDocuments error:', err);
    toast('Could not load documents — is the backend running?', 'error');
    DB.documents = DB.documents || [];
  }
  updateNavBadges();
  refreshHome();
}

function clearDocForm() {
  ['d-service','d-name','d-mobile','d-aadhaar','d-father','d-caste','d-address','d-fee','d-ref','d-notes','d-expected'].forEach(id => setVal(id, ''));
  setVal('d-submitted', '');
  document.getElementById('autofill-banner').style.display = 'none';
  document.getElementById('doc-checklist').style.display = 'none';
  document.getElementById('service-info-strip').style.display = 'none';
  document.getElementById('autofill-dd').classList.remove('show');
}

async function updateDocStatus(id, status) {
  try {
    const res = await fetch(`/api/smartseva-documents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!res.ok) throw new Error('Failed to update status (' + res.status + ')');

    await loadDocuments();
    renderDocs();
    renderTimers();
    updateNavBadges();
    toast('Status updated to ' + status);
  } catch (err) {
    console.error('updateDocStatus error:', err);
    toast('Could not update status — is the backend running?', 'error');
  }
}

async function deleteDocument(id) {
  if (!confirm('Delete this document?')) return;
  try {
    const res = await fetch(`/api/smartseva-documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed (' + res.status + ')');

    await loadDocuments();
    renderDocs();
    updateNavBadges();
    toast('Document deleted');
  } catch (err) {
    console.error('deleteDocument error:', err);
    toast('Could not delete document — is the backend running?', 'error');
  }
}

// ─── RENDER HOME ─────────────────────────────────────────────
function refreshHome() {
  if (document.getElementById('page-home').classList.contains('active')) renderHome();
}

function renderHome() {
  const todayStr = today();
  const todayDocs = DB.documents.filter(d => d.createdAt && d.createdAt.startsWith(todayStr));
  const todayIncome = todayDocs.reduce((s, d) => s + (d.fee || 0), 0);
  const pending = DB.documents.filter(d => d.status !== 'Done').length;
  const overdue = DB.documents.filter(d => d.status !== 'Done' && daysLeft(d) < 0).length;

  document.getElementById('home-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Today's income</div>
      <div class="stat-val" style="color:var(--success)">₹${todayIncome.toLocaleString()}</div>
      <div class="stat-sub">${todayDocs.length} doc${todayDocs.length !== 1 ? 's' : ''} today</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total customers</div>
      <div class="stat-val">${DB.customers.length}</div>
      <div class="stat-sub">in database</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">All documents</div>
      <div class="stat-val">${DB.documents.length}</div>
      <div class="stat-sub">${pending} pending</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Overdue</div>
      <div class="stat-val" style="color:${overdue > 0 ? 'var(--danger)' : 'var(--text)'}">${overdue}</div>
      <div class="stat-sub" style="color:${overdue > 0 ? 'var(--danger)' : 'var(--text-muted)'}">
        ${overdue > 0 ? 'need attention' : 'all on track'}
      </div>
    </div>`;

  document.getElementById('docs-today-count').textContent = todayDocs.length + ' today';

  const recent = DB.documents.slice(0, 6);
  if (recent.length === 0) {
    document.getElementById('home-recent-docs').innerHTML = `
      <div class="empty-state"><i class="fa-solid fa-file-circle-plus"></i><p>No documents yet.<br>Create your first one.</p></div>`;
  } else {
    document.getElementById('home-recent-docs').innerHTML = recent.map(d => docRowHTML(d, false)).join('');
  }

  const alerts = DB.documents.filter(d => d.status !== 'Done' && daysLeft(d) <= 3);
  const alertBadge = document.getElementById('timer-alert-badge');
  alertBadge.textContent = alerts.length + ' alert' + (alerts.length !== 1 ? 's' : '');
  alertBadge.className = 'badge ' + (alerts.length > 0 ? 'red' : 'green');

  if (alerts.length === 0) {
    document.getElementById('home-timers').innerHTML = `
      <div class="empty-state"><i class="fa-solid fa-circle-check" style="color:var(--success)"></i><p>All documents on track.<br>No urgent timers.</p></div>`;
  } else {
    document.getElementById('home-timers').innerHTML = alerts.slice(0, 5).map(d => {
      const dl = daysLeft(d);
      return `<div class="doc-row">
        <div class="doc-icon di-red"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="doc-info">
          <div class="doc-name">${esc(d.customerName)}</div>
          <div class="doc-meta">${esc(d.service)}</div>
          <div class="timer-label" style="color:var(--${dl < 0 ? 'danger' : 'warning'})">
            ${dl < 0 ? 'Overdue by ' + Math.abs(dl) + ' day' + (Math.abs(dl) !== 1 ? 's' : '') : dl + ' day' + (dl !== 1 ? 's' : '') + ' remaining'}
          </div>
        </div>
        <button class="btn btn-sm" onclick="updateDocStatus(${d.id},'Done')"><i class="fa-solid fa-check"></i> Done</button>
      </div>`;
    }).join('');
  }
}

// ─── RENDER DOCS ─────────────────────────────────────────────
function renderDocs(filter) {
  if (filter) docsFilter = filter;
  let docs = [...DB.documents];

  if (docsFilter === 'processing') docs = docs.filter(d => d.status !== 'Done');
  if (docsFilter === 'done') docs = docs.filter(d => d.status === 'Done');
  if (docsFilter === 'overdue') docs = docs.filter(d => d.status !== 'Done' && daysLeft(d) < 0);

  const wrap = document.getElementById('docs-list-wrap');
  if (docs.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><i class="fa-solid fa-folder-open"></i><p>No documents in this category.</p></div>`;
  } else {
    wrap.innerHTML = docs.map(d => docRowHTML(d, true)).join('');
  }
}

function docRowHTML(d, showActions) {
  const dl = daysLeft(d);
  const tc = timerColors(dl, d.expectedDays || 14);
  const pct = d.status === 'Done' ? 100 : Math.max(0, Math.min(100, Math.round((1 - dl / (d.expectedDays || 14)) * 100)));
  const iconColor = serviceIconColor(d.service);

  return `<div class="doc-row">
    <div class="doc-icon ${iconColor}"><i class="fa-solid fa-file-lines"></i></div>
    <div class="doc-info" style="flex:1">
      <div class="doc-name">${esc(d.customerName)} — ${esc(d.service)}</div>
      <div class="doc-meta">${d.submittedDate}${d.fee ? ' · ₹' + d.fee : ''}${d.ref ? ' · ' + esc(d.ref) : ''}</div>
      ${d.status !== 'Done' ? `
        <div class="timer-bar"><div class="timer-fill ${tc.bar}" style="width:${pct}%"></div></div>
        <div class="timer-label" style="color:var(--${dl < 0 ? 'danger' : dl <= 3 ? 'warning' : 'text-muted'})">
          ${dl < 0 ? 'Overdue by ' + Math.abs(dl) + ' day' + (Math.abs(dl) !== 1 ? 's' : '') : dl + ' day' + (dl !== 1 ? 's' : '') + ' left · Due ' + d.expectedDate}
        </div>` : `
        <div class="timer-label" style="color:var(--success)"><i class="fa-solid fa-check"></i> Done${d.doneAt ? ' — ' + d.doneAt.split('T')[0] : ''}</div>`}
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0">
      <span class="status-pill ${statusPillClass(d.status, d)}">${d.status}</span>
      ${showActions ? `
        ${d.status !== 'Done' ? `<button class="btn btn-sm" onclick="updateDocStatus(${d.id},'Done')"><i class="fa-solid fa-check"></i> Mark done</button>` : ''}
        <button class="btn btn-sm btn-danger" onclick="deleteDocument(${d.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
    </div>
  </div>`;
}

// ─── RENDER TIMERS ───────────────────────────────────────────
function renderTimers() {
  const active = DB.documents.filter(d => d.status !== 'Done');
  document.getElementById('timer-page-count').textContent = active.length + ' active';

  if (active.length === 0) {
    document.getElementById('timers-list').innerHTML = `
      <div class="card"><div class="empty-state"><i class="fa-solid fa-circle-check" style="color:var(--success)"></i><p>No active timers.<br>All documents are done or none created yet.</p></div></div>`;
    return;
  }

  const sorted = [...active].sort((a, b) => daysLeft(a) - daysLeft(b));
  document.getElementById('timers-list').innerHTML = sorted.map(d => {
    const dl = daysLeft(d);
    const tc = timerColors(dl, d.expectedDays || 14);
    const elapsed = (d.expectedDays || 14) - Math.max(0, dl);
    const pct = Math.max(0, Math.min(100, Math.round((1 - dl / (d.expectedDays || 14)) * 100)));
    const cardClass = dl < 0 ? 'urgent' : dl <= 3 ? 'warning' : 'ok';
    const iconColor = serviceIconColor(d.service);

    return `<div class="timer-card ${cardClass}">
      <div class="doc-icon ${iconColor}" style="width:40px;height:40px;font-size:16px;margin-top:0">
        <i class="fa-solid fa-file-lines"></i>
      </div>
      <div class="timer-body">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <div class="timer-name">${esc(d.customerName)}</div>
          <span class="status-pill ${tc.pill}">
            ${dl < 0 ? 'Overdue ' + Math.abs(dl) + 'd' : dl + ' day' + (dl !== 1 ? 's' : '') + ' left'}
          </span>
        </div>
        <div class="timer-service">${esc(d.service)}${d.ref ? ' · ' + esc(d.ref) : ''}</div>
        <div class="timer-dates">Submitted: ${d.submittedDate} &nbsp;·&nbsp; Due: ${d.expectedDate}</div>
        <div class="big-timer-bar"><div class="timer-fill ${tc.bar}" style="width:${pct}%"></div></div>
        <div class="timer-day-info">
          <span>Day ${elapsed} of ${d.expectedDays || 14}</span>
          <span>${d.expectedDays || 14} day govt. processing time</span>
        </div>
      </div>
      <button class="btn btn-sm" onclick="updateDocStatus(${d.id},'Done')" style="flex-shrink:0">
        <i class="fa-solid fa-check"></i> Done
      </button>
    </div>`;
  }).join('');
}

// ─── RENDER INCOME ───────────────────────────────────────────
function renderIncome(filter) {
  if (filter) incomeFilter = filter;
  const todayStr = today();
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = todayStr.substring(0, 7);

  let docs = DB.documents.filter(d => d.fee > 0);
  if (incomeFilter === 'today') docs = docs.filter(d => d.createdAt && d.createdAt.startsWith(todayStr));
  if (incomeFilter === 'week') docs = docs.filter(d => d.createdAt && new Date(d.createdAt) >= weekStart);
  if (incomeFilter === 'month') docs = docs.filter(d => d.createdAt && d.createdAt.startsWith(monthStart));

  const total = docs.reduce((s, d) => s + (d.fee || 0), 0);

  const byService = {};
  docs.forEach(d => {
    byService[d.service] = (byService[d.service] || 0) + d.fee;
  });

  document.getElementById('income-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total income</div>
      <div class="stat-val" style="color:var(--success)">₹${total.toLocaleString()}</div>
      <div class="stat-sub">${docs.length} transaction${docs.length !== 1 ? 's' : ''}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Top service</div>
      <div class="stat-val" style="font-size:15px">${Object.keys(byService).sort((a,b)=>byService[b]-byService[a])[0] || '—'}</div>
      <div class="stat-sub">${Object.keys(byService).length} service type${Object.keys(byService).length !== 1 ? 's' : ''}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg per document</div>
      <div class="stat-val">₹${docs.length ? Math.round(total / docs.length).toLocaleString() : 0}</div>
      <div class="stat-sub">per transaction</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Free services</div>
      <div class="stat-val">${DB.documents.filter(d => !d.fee || d.fee === 0).length}</div>
      <div class="stat-sub">₹0 fee applied</div>
    </div>`;

  document.getElementById('income-total').textContent = '₹' + total.toLocaleString();

  if (docs.length === 0) {
    document.getElementById('income-list').innerHTML = `
      <div class="empty-state"><i class="fa-solid fa-chart-bar"></i><p>No income recorded for this period.<br>Add fees when creating documents to track.</p></div>`;
    return;
  }

  document.getElementById('income-list').innerHTML = docs.map(d => `
    <div class="income-row">
      <div>
        <div style="font-size:13px;font-weight:600">${esc(d.service)}</div>
        <div style="font-size:11px;color:var(--text-muted)">${esc(d.customerName)} · ${d.submittedDate}</div>
      </div>
      <span class="income-amt">+₹${d.fee.toLocaleString()}</span>
    </div>`).join('');
}

// ─── RENDER PORTALS ──────────────────────────────────────────
function renderPortals() {
  document.getElementById('portals-grid').innerHTML = PORTALS.map(p => `
    <a class="portal-card" href="${p.url}" target="_blank" rel="noopener">
      <div class="portal-icon ${p.color}"><i class="fa-solid ${p.icon}"></i></div>
      <div class="portal-name">${esc(p.name)}</div>
      <div class="portal-desc">${esc(p.desc)}</div>
      <div class="portal-link"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px"></i> Open portal</div>
    </a>`).join('');
}

// ─── RECEIPT GENERATOR ───────────────────────────────────────
function populateReceiptSelect() {
  const sel = document.getElementById('r-doc-select');
  sel.innerHTML = '<option value="">— select a document —</option>' +
    DB.documents.map(d => `<option value="${d.id}">${esc(d.customerName)} — ${esc(d.service)} (${d.submittedDate})</option>`).join('');
  setVal('r-date', today());
}

function onReceiptDocSelect() {
  const id = parseInt(document.getElementById('r-doc-select').value);
  if (!id) return;
  const d = DB.documents.find(doc => doc.id === id);
  if (!d) return;
  setVal('r-name', d.customerName);
  setVal('r-service', d.service);
  setVal('r-amount', d.fee || '');
  setVal('r-ref', d.ref || '');
}

function generateReceipt() {
  const name = getVal('r-name');
  const service = getVal('r-service');
  const amount = getVal('r-amount');
  const date = getVal('r-date');
  const ref = getVal('r-ref');
  const kendra = DB.settings.kendra || 'SmartSeva Kendra';
  const operator = DB.settings.operator || '';
  const rcptNo = 'RC' + Date.now().toString().slice(-6);

  if (!name || !service) { toast('Name and service are required', 'error'); return; }

  document.getElementById('receipt-preview').innerHTML = `
    <div class="receipt-paper" id="receipt-paper">
      <div class="r-head">
        <div class="r-title">${esc(kendra)}</div>
        ${operator ? `<div class="r-sub">Operator: ${esc(operator)}</div>` : ''}
        ${DB.settings.village ? `<div class="r-sub">${esc(DB.settings.village)}</div>` : ''}
        ${DB.settings.mobile ? `<div class="r-sub">Mob: ${esc(DB.settings.mobile)}</div>` : ''}
        <div class="r-sub" style="margin-top:6px;font-weight:700">RECEIPT / पावती</div>
      </div>
      <div class="r-row"><span>Receipt no.</span><span>${rcptNo}</span></div>
      <div class="r-row"><span>Date</span><span>${date}</span></div>
      <div class="r-row"><span>Customer</span><span>${esc(name)}</span></div>
      <div class="r-row"><span>Service</span><span>${esc(service)}</span></div>
      ${ref ? `<div class="r-row"><span>Reference no.</span><span>${esc(ref)}</span></div>` : ''}
      <div class="r-row total"><span>Amount paid</span><span>₹${parseInt(amount || 0).toLocaleString()}</span></div>
      <div class="r-footer">
        Thank you for using ${esc(kendra)}<br>
        Operator signature: _______________<br>
        <small>This is a computer-generated receipt.</small>
      </div>
    </div>`;
  toast('Receipt generated');
}

function printReceipt() {
  const content = document.getElementById('receipt-paper');
  if (!content) { toast('Generate a receipt first', 'error'); return; }
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title>
    <style>body{font-family:Courier New,monospace;font-size:13px;padding:20px;max-width:320px;margin:auto}
    .r-head{text-align:center;border-bottom:2px dashed #999;padding-bottom:10px;margin-bottom:10px}
    .r-title{font-size:16px;font-weight:700}.r-sub{font-size:11px;color:#555}
    .r-row{display:flex;justify-content:space-between;padding:2px 0}
    .r-row.total{border-top:2px dashed #999;margin-top:8px;padding-top:8px;font-weight:700;font-size:15px}
    .r-footer{text-align:center;margin-top:12px;border-top:1px dashed #999;padding-top:10px;font-size:11px;color:#666}
    </style></head><body>${content.innerHTML}</body></html>`);
  w.document.close();
  w.print();
}

// ─── GLOBAL SEARCH ───────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('global-search');
  const dd = document.getElementById('search-dropdown');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dd.classList.remove('show'); return; }

    const custResults = DB.customers.filter(c => ((c.full_name || '') + (c.mobile || '') + (c.aadhaar || '')).toLowerCase().includes(q)).slice(0, 4);
    const docResults = DB.documents.filter(d => ((d.customerName || '') + (d.mobile || '') + (d.service || '') + (d.ref || '')).toLowerCase().includes(q)).slice(0, 4);

    let html = '';
    if (custResults.length > 0) {
      html += `<div style="padding:5px 12px;font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em">Customers</div>`;
      html += custResults.map(c => `<div class="sd-item" onclick="showCustomerModal(${c.id});document.getElementById('global-search').value='';document.getElementById('search-dropdown').classList.remove('show')">
        <div class="sd-label">${esc(c.full_name)}</div>
        <div class="sd-sub">${esc(c.mobile)}</div>
      </div>`).join('');
    }
    if (docResults.length > 0) {
      html += `<div style="padding:5px 12px;font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em">Documents</div>`;
      html += docResults.map(d => `<div class="sd-item" onclick="navTo('docs');setTimeout(()=>renderDocs('all'),50);document.getElementById('global-search').value='';document.getElementById('search-dropdown').classList.remove('show')">
        <div class="sd-label">${esc(d.customerName)} — ${esc(d.service)}</div>
        <div class="sd-sub">${d.submittedDate} · ₹${d.fee || 0}</div>
      </div>`).join('');
    }
    if (!html) html = `<div class="sd-item" style="color:var(--text-muted)">No results for "${esc(input.value)}"</div>`;
    dd.innerHTML = html;
    dd.classList.add('show');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-box')) dd.classList.remove('show');
    if (!e.target.closest('#page-new-doc')) document.getElementById('autofill-dd').classList.remove('show');
  });
}

// ─── NAV BADGES ──────────────────────────────────────────────
function updateNavBadges() {
  const pending = DB.documents.filter(d => d.status !== 'Done').length;
  const overdue = DB.documents.filter(d => d.status !== 'Done' && daysLeft(d) < 0).length;

  const docBadge = document.getElementById('nav-doc-badge');
  docBadge.textContent = pending;
  docBadge.style.display = pending > 0 ? 'inline' : 'none';

  const timerBadge = document.getElementById('nav-timer-badge');
  timerBadge.textContent = overdue;
  timerBadge.style.display = overdue > 0 ? 'inline' : 'none';
}

// ─── REFRESH ALL ─────────────────────────────────────────────
function refreshAll() {
  renderHome();
  updateNavBadges();
}

// ─── CLOCK ───────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('topbar-time').textContent =
    now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─── HELPERS ─────────────────────────────────────────────────
function today() { return new Date().toISOString().split('T')[0]; }
function getVal(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function daysLeft(doc) {
  const exp = new Date(doc.expectedDate);
  const now = new Date();
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

function timerColors(dl, total) {
  if (dl < 0) return { bar: 'tf-red', pill: 'sp-red' };
  if (dl / total < 0.25) return { bar: 'tf-red', pill: 'sp-red' };
  if (dl / total < 0.5) return { bar: 'tf-amber', pill: 'sp-amber' };
  return { bar: 'tf-green', pill: 'sp-green' };
}

function statusPillClass(status, doc) {
  if (status === 'Done') return 'sp-green';
  if (doc && daysLeft(doc) < 0) return 'sp-red';
  return 'sp-blue';
}

function serviceIconColor(svc) {
  const map = {
    'Income Certificate': 'di-green', 'Caste Certificate': 'di-purple',
    'PAN Card': 'di-blue', 'Aadhaar Update': 'di-amber',
    'PM Kisan Registration': 'di-green', 'Passport Application': 'di-blue',
    'Driving License': 'di-amber', 'Scholarship': 'di-purple',
    'Property Record (7/12)': 'di-amber', 'PMAY Housing': 'di-blue',
    'Ayushman Bharat': 'di-red', 'Domicile Certificate': 'di-green',
  };
  return map[svc] || 'di-blue';
}

// ─── EVENT WIRING ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', () => navTo(el.dataset.page));
  });

  document.querySelectorAll('.tab[data-tab]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.tab[data-tab]').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('tab-' + el.dataset.tab).classList.add('active');
      if (el.dataset.tab === 'cust-list') renderCustomers();
    });
  });

  document.querySelectorAll('.tab[data-tab-docs]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.tab[data-tab-docs]').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      renderDocs(el.dataset.tabDocs);
    });
  });

  document.querySelectorAll('.tab[data-tab-income]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.tab[data-tab-income]').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      renderIncome(el.dataset.tabIncome);
    });
  });

  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('modal-overlay').addEventListener('click', closeModal);

  initSearch();
  updateClock();
  setInterval(updateClock, 30000);
  setVal('d-submitted', today());
  setVal('r-date', today());
  loadDB();
});