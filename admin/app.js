/* ══════════════════════════════════════════════
   CHÁCARA O ALVO — Admin Panel app.js
   ══════════════════════════════════════════════ */

var SUPABASE_URL = 'https://jgascbtbwyvflpicixyd.supabase.co';
var SUPABASE_KEY = 'sb_publishable_czELIEaD2b6ZLNZowXmW-g_CDZENy6d';
var db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── State ───────────────────────────────────── */
var allOrcamentos = [];
var currentFilter = 'todos';
var currentSearch = '';
var currentOrcamento = null;

/* ── Helpers ─────────────────────────────────── */
var PT_MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
var PT_WEEKDAYS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

function formatDate(isoStr) {
  if (!isoStr) return '—';
  var d = new Date(isoStr + 'T12:00:00');
  return d.getDate() + ' de ' + PT_MONTHS[d.getMonth()] + ' de ' + d.getFullYear();
}

function formatDateShort(isoStr) {
  if (!isoStr) return '—';
  var d = new Date(isoStr + 'T12:00:00');
  return String(d.getDate()).padStart(2,'0') + '/' +
         String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  var d = new Date(isoStr);
  return String(d.getDate()).padStart(2,'0') + '/' +
         String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear() +
         ' às ' + String(d.getHours()).padStart(2,'0') + ':' +
         String(d.getMinutes()).padStart(2,'0');
}

function weekdayOf(isoStr) {
  var d = new Date(isoStr + 'T12:00:00');
  return PT_WEEKDAYS[d.getDay()];
}

function statusBadge(status) {
  var map = {
    'novo':           '<span class="badge badge-novo">Novo</span>',
    'em_atendimento': '<span class="badge badge-atendimento">Em atendimento</span>',
    'fechado':        '<span class="badge badge-fechado">Fechado</span>'
  };
  return map[status] || '<span class="badge">' + status + '</span>';
}

function agendaBadge(status) {
  return status === 'reservado'
    ? '<span class="badge badge-reservado">Reservado</span>'
    : '<span class="badge badge-bloqueado">Bloqueado</span>';
}

function esc(str) {
  if (!str) return '—';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function arrayToStr(arr) {
  if (!arr || !arr.length) return '—';
  return Array.isArray(arr) ? arr.join(', ') : arr;
}

/* ── Auth ────────────────────────────────────── */
var loginForm    = document.getElementById('loginForm');
var loginError   = document.getElementById('loginError');
var loginBtn     = document.getElementById('loginBtn');
var screenLogin  = document.getElementById('screenLogin');
var screenApp    = document.getElementById('screenApp');
var sidebarUser  = document.getElementById('sidebarUser');

db.auth.onAuthStateChange(function(event, session) {
  if (session) {
    screenLogin.hidden = true;
    screenApp.hidden   = false;
    sidebarUser.textContent = session.user.email;
    loadAll();
  } else {
    screenLogin.hidden = false;
    screenApp.hidden   = true;
  }
});

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  loginError.hidden = true;
  loginBtn.textContent = 'Entrando…';
  loginBtn.disabled = true;

  var email    = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;

  var result = await db.auth.signInWithPassword({ email: email, password: password });

  if (result.error) {
    loginError.textContent = 'E-mail ou senha incorretos.';
    loginError.hidden = false;
    loginBtn.textContent = 'Entrar';
    loginBtn.disabled = false;
  }
});

document.getElementById('btnLogout').addEventListener('click', async function() {
  await db.auth.signOut();
});

/* ── Navigation ──────────────────────────────── */
var sections = {
  overview:   document.getElementById('sectionOverview'),
  orcamentos: document.getElementById('sectionOrcamentos'),
  agenda:     document.getElementById('sectionAgenda')
};
var topbarTitle = document.getElementById('topbarTitle');
var titles = { overview: 'Visão Geral', orcamentos: 'Orçamentos', agenda: 'Agenda' };

function showSection(name) {
  Object.keys(sections).forEach(function(k) {
    sections[k].hidden = (k !== name);
  });
  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.getAttribute('data-section') === name);
  });
  topbarTitle.textContent = titles[name] || '';
  closeSidebar();
}

document.querySelectorAll('[data-section]').forEach(function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    showSection(this.getAttribute('data-section'));
  });
});

/* Sidebar mobile */
var sidebar     = document.getElementById('sidebar');
var sidebarClose = document.getElementById('sidebarClose');
var topbarMenu  = document.getElementById('topbarMenu');

topbarMenu.addEventListener('click', function() { sidebar.classList.add('open'); });
sidebarClose.addEventListener('click', closeSidebar);
function closeSidebar() { sidebar.classList.remove('open'); }

/* Refresh */
document.getElementById('btnRefresh').addEventListener('click', loadAll);

/* ── Load All Data ───────────────────────────── */
async function loadAll() {
  await Promise.all([loadOrcamentos(), loadAgenda()]);
}

/* ── Orçamentos ──────────────────────────────── */
async function loadOrcamentos() {
  var result = await db.from('orcamentos').select('*').order('created_at', { ascending: false });

  if (result.error) { console.error(result.error); return; }

  allOrcamentos = result.data || [];

  updateKPIs();
  renderTableRecentes();
  renderTableOrcamentos();
  updateNavBadge();
}

function updateKPIs() {
  var total      = allOrcamentos.length;
  var novos      = allOrcamentos.filter(function(o) { return o.status === 'novo'; }).length;
  var atendimento = allOrcamentos.filter(function(o) { return o.status === 'em_atendimento'; }).length;
  var fechados   = allOrcamentos.filter(function(o) { return o.status === 'fechado'; }).length;

  document.getElementById('kpiTotal').textContent      = total;
  document.getElementById('kpiNovos').textContent      = novos;
  document.getElementById('kpiAtendimento').textContent = atendimento;
  document.getElementById('kpiFechados').textContent   = fechados;
}

function updateNavBadge() {
  var novos = allOrcamentos.filter(function(o) { return o.status === 'novo'; }).length;
  var badge = document.getElementById('navBadgeNovos');
  badge.textContent = novos;
  badge.hidden = (novos === 0);
}

function renderTableRecentes() {
  var recentes = allOrcamentos.slice(0, 6);
  var tbody = document.getElementById('tbodyRecentes');
  if (!recentes.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Nenhuma solicitação ainda.</td></tr>';
    return;
  }
  tbody.innerHTML = recentes.map(function(o) {
    return '<tr>' +
      '<td><strong>' + esc(o.nome) + '</strong></td>' +
      '<td>' + esc(arrayToStr(o.tipo_evento)) + '</td>' +
      '<td>' + formatDateShort(o.data_evento) + '</td>' +
      '<td>' + statusBadge(o.status) + '</td>' +
      '<td><button class="btn-sm btn-sm--primary" onclick="openModal(\'' + o.id + '\')">Ver</button></td>' +
    '</tr>';
  }).join('');
}

function renderTableOrcamentos() {
  var data = allOrcamentos.filter(function(o) {
    var matchFilter = currentFilter === 'todos' || o.status === currentFilter;
    var q = currentSearch.toLowerCase();
    var matchSearch = !q ||
      (o.nome  && o.nome.toLowerCase().includes(q)) ||
      (o.email && o.email.toLowerCase().includes(q)) ||
      (o.telefone && o.telefone.includes(q));
    return matchFilter && matchSearch;
  });

  var tbody = document.getElementById('tbodyOrcamentos');
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="table-empty">Nenhum resultado encontrado.</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(function(o) {
    return '<tr>' +
      '<td style="white-space:nowrap;font-size:0.78rem;color:var(--ink-50)">' + formatDateTime(o.created_at) + '</td>' +
      '<td><strong>' + esc(o.nome) + '</strong><br><span style="font-size:0.78rem;color:var(--ink-50)">' + esc(o.email) + '</span></td>' +
      '<td>' + esc(o.telefone) + '</td>' +
      '<td>' + esc(arrayToStr(o.tipo_evento)) + '</td>' +
      '<td style="white-space:nowrap">' + formatDateShort(o.data_evento) + '</td>' +
      '<td>' + esc(o.convidados) + '</td>' +
      '<td>' + statusBadge(o.status) + '</td>' +
      '<td><button class="btn-sm btn-sm--primary" onclick="openModal(\'' + o.id + '\')">Detalhes</button></td>' +
    '</tr>';
  }).join('');
}

/* Filtros */
document.querySelectorAll('.filter-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    this.classList.add('active');
    currentFilter = this.getAttribute('data-filter');
    renderTableOrcamentos();
  });
});

/* Busca */
document.getElementById('searchOrcamentos').addEventListener('input', function() {
  currentSearch = this.value;
  renderTableOrcamentos();
});

/* ── Modal Detalhe ───────────────────────────── */
var modal       = document.getElementById('modalOrcamento');
var modalBody   = document.getElementById('modalBody');
var statusActions = document.getElementById('statusActions');

function openModal(id) {
  currentOrcamento = allOrcamentos.find(function(o) { return o.id === id; });
  if (!currentOrcamento) return;

  var o = currentOrcamento;

  modalBody.innerHTML =
    '<div class="detail-grid">' +
      '<div class="detail-item">' +
        '<span class="detail-label">Nome</span>' +
        '<span class="detail-value">' + esc(o.nome) + '</span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">Status</span>' +
        '<span class="detail-value">' + statusBadge(o.status) + '</span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">E-mail</span>' +
        '<span class="detail-value"><a href="mailto:' + esc(o.email) + '" style="color:var(--verde-500)">' + esc(o.email) + '</a></span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">Telefone</span>' +
        '<span class="detail-value"><a href="tel:' + esc(o.telefone) + '" style="color:var(--verde-500)">' + esc(o.telefone) + '</a></span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">Tipo de evento</span>' +
        '<span class="detail-value">' + esc(arrayToStr(o.tipo_evento)) + '</span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">Nº de convidados</span>' +
        '<span class="detail-value">' + esc(o.convidados) + '</span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">Data do evento</span>' +
        '<span class="detail-value">' + formatDate(o.data_evento) + '</span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">Flexível com a data?</span>' +
        '<span class="detail-value">' + (o.flexibilidade ? 'Sim' : 'Não') + '</span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">Espaços</span>' +
        '<span class="detail-value">' + esc(arrayToStr(o.espacos)) + '</span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">Serviços</span>' +
        '<span class="detail-value">' + esc(arrayToStr(o.servicos)) + '</span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">Investimento previsto</span>' +
        '<span class="detail-value">' + esc(o.investimento) + '</span>' +
      '</div>' +
      '<div class="detail-item">' +
        '<span class="detail-label">Como conheceu</span>' +
        '<span class="detail-value">' + esc(o.como_conheceu) + '</span>' +
      '</div>' +
      (o.mensagem ? '<div class="detail-item full"><span class="detail-label">Mensagem</span><span class="detail-value" style="white-space:pre-line">' + esc(o.mensagem) + '</span></div>' : '') +
      '<div class="detail-item"><span class="detail-label">Solicitado em</span><span class="detail-value">' + formatDateTime(o.created_at) + '</span></div>' +
    '</div>';

  /* Botões de status */
  var btns = '<span>Alterar status:</span>';
  if (o.status !== 'novo')           btns += '<button class="btn-sm" onclick="updateStatus(\'' + o.id + '\',\'novo\')">Novo</button>';
  if (o.status !== 'em_atendimento') btns += '<button class="btn-sm btn-sm--primary" onclick="updateStatus(\'' + o.id + '\',\'em_atendimento\')">Em atendimento</button>';
  if (o.status !== 'fechado')        btns += '<button class="btn-sm" style="border-color:#86efac;color:#166534" onclick="updateStatus(\'' + o.id + '\',\'fechado\')">Fechado ✓</button>';
  btns += '<a href="https://wa.me/55' + o.telefone.replace(/\D/g,'') + '" target="_blank" rel="noopener" class="btn-sm" style="border-color:#86efac;color:#166534">WhatsApp ↗</a>';
  statusActions.innerHTML = btns;

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

async function updateStatus(id, newStatus) {
  var result = await db.from('orcamentos')
    .update({ status: newStatus })
    .eq('id', id);

  if (result.error) { alert('Erro ao atualizar status: ' + result.error.message); return; }

  /* Atualiza local */
  allOrcamentos = allOrcamentos.map(function(o) {
    return o.id === id ? Object.assign({}, o, { status: newStatus }) : o;
  });
  currentOrcamento = Object.assign({}, currentOrcamento, { status: newStatus });

  updateKPIs();
  updateNavBadge();
  renderTableRecentes();
  renderTableOrcamentos();
  openModal(id); /* re-renderiza o modal */
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

/* ── Agenda ──────────────────────────────────── */
var agendaRows = [];

async function loadAgenda() {
  var result = await db.from('agenda').select('*').order('data', { ascending: true });
  if (result.error) { console.error(result.error); return; }

  agendaRows = result.data || [];
  renderAgendaMini();
  renderAgendaTable();
}

function renderAgendaMini() {
  var mini   = document.getElementById('agendaMini');
  var today  = new Date().toISOString().split('T')[0];
  var future = agendaRows.filter(function(r) { return r.data >= today; }).slice(0, 5);

  if (!future.length) {
    mini.innerHTML = '<li class="table-empty">Nenhuma data bloqueada.</li>';
    return;
  }
  mini.innerHTML = future.map(function(r) {
    return '<li>' +
      '<div><span class="agenda-date">' + formatDateShort(r.data) + '</span> · ' +
      '<span class="agenda-desc">' + weekdayOf(r.data) + '</span></div>' +
      '<div>' + agendaBadge(r.status) + '</div>' +
    '</li>';
  }).join('');
}

function renderAgendaTable() {
  var today  = new Date().toISOString().split('T')[0];
  var tbody  = document.getElementById('tbodyAgenda');
  var count  = document.getElementById('agendaCount');
  var future = agendaRows.filter(function(r) { return r.data >= today; });

  count.textContent = future.length;

  if (!agendaRows.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Nenhuma data bloqueada.</td></tr>';
    return;
  }
  tbody.innerHTML = agendaRows.map(function(r) {
    var isPast = r.data < today;
    return '<tr style="' + (isPast ? 'opacity:0.45;' : '') + '">' +
      '<td><strong>' + formatDateShort(r.data) + '</strong></td>' +
      '<td>' + weekdayOf(r.data) + '</td>' +
      '<td>' + esc(r.descricao) + '</td>' +
      '<td>' + agendaBadge(r.status) + '</td>' +
      '<td>' +
        (isPast ? '' : '<button class="btn-sm btn-sm--danger" onclick="removeAgenda(\'' + r.id + '\',\'' + r.data + '\')">Liberar</button>') +
      '</td>' +
    '</tr>';
  }).join('');
}

/* Adicionar data */
var formAgenda    = document.getElementById('formAgenda');
var agendaError   = document.getElementById('agendaError');
var agendaSuccess = document.getElementById('agendaSuccess');

formAgenda.addEventListener('submit', async function(e) {
  e.preventDefault();
  agendaError.hidden   = true;
  agendaSuccess.hidden = true;

  var data    = document.getElementById('agendaData').value;
  var desc    = document.getElementById('agendaDesc').value.trim() || null;
  var status  = document.getElementById('agendaStatus').value;
  var btn     = formAgenda.querySelector('button[type="submit"]');

  if (!data) { agendaError.textContent = 'Selecione uma data.'; agendaError.hidden = false; return; }

  btn.textContent = 'Bloqueando…';
  btn.disabled = true;

  var result = await db.from('agenda').insert([{ data: data, descricao: desc, status: status }]);

  btn.textContent = 'Bloquear data';
  btn.disabled = false;

  if (result.error) {
    var msg = result.error.message || '';
    agendaError.textContent = msg.includes('unique') || msg.includes('duplicate')
      ? 'Esta data já está bloqueada.'
      : 'Erro: ' + msg;
    agendaError.hidden = false;
    return;
  }

  agendaSuccess.textContent = 'Data ' + formatDateShort(data) + ' bloqueada com sucesso!';
  agendaSuccess.hidden = false;
  formAgenda.reset();
  setTimeout(function() { agendaSuccess.hidden = true; }, 4000);

  await loadAgenda();
});

/* Remover data */
async function removeAgenda(id, data) {
  if (!confirm('Liberar a data ' + formatDateShort(data) + '? Ela ficará disponível no calendário do site.')) return;
  var result = await db.from('agenda').delete().eq('id', id);
  if (result.error) { alert('Erro: ' + result.error.message); return; }
  await loadAgenda();
}
