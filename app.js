import { DAY, COLORS, CATEGORIES, elapsed, parts, duration, stats, milestones, restart, parseBackup, backup } from './model.js';
import { initialize, readState, updateState } from './storage.js';
import { setupUpdates, checkUpdates } from './updates.js';
const $ = selector => document.querySelector(selector);
const content = $('#content'), sheet = $('#sheet'), sheetBody = $('#sheet-body');
const paths = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  history: '<path d="M3 11a9 9 0 1 1 3 8M3 4v7h7M12 7v5l3 2"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
  close: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>', back: '<path d="m15 5-7 7 7 7"/>',
  reset: '<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>',
  up: '<path d="m6 14 6-6 6 6"/>', down: '<path d="m6 10 6 6 6-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  export: '<path d="M12 15V3m-4 4 4-4 4 4M5 14v6h14v-6"/>',
  import: '<path d="M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4"/>',
  archive: '<path d="M4 8h16v12H4zM3 3h18v5H3zM9 12h6"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M11 19h2"/>',
  edit: '<path d="m14 4 6 6M4 20l2-7L16 3a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L11 18z"/>'
};
export const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.history}</svg>`;
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const date = timestamp => new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(timestamp);
const localInput = timestamp => { const d = new Date(timestamp); return new Date(timestamp - d.getTimezoneOffset() * 60000).toISOString().slice(0,16); };
const days = ms => `${parts(ms).days} ${parts(ms).days === 1 ? 'dia' : 'dias'}`;
let state, page = 'home', selected = null, reordering = false, toastTimer, busy = false;
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('to-limpo-changes') : null;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4000); }
function getCounter(id = selected) { return state.counters.find(c => c.id === id); }
function requiredCounter(data, id) { const c = data.counters.find(c => c.id === id); if (!c) throw new Error('Esse contador foi removido em outra aba.'); return c; }
async function commit(mutator, message) {
  if (busy) return false;
  busy = true;
  try { state = await updateState(mutator); channel?.postMessage('changed'); applyTheme(); render(); if (message) toast(message); return true; }
  catch (error) { toast(error.message); return false; }
  finally { busy = false; }
}
function applyTheme() {
  document.documentElement.dataset.theme = state.settings.theme;
  const dark = state.settings.theme === 'dark' || (state.settings.theme === 'system' && matchMedia('(prefers-color-scheme:dark)').matches);
  $('meta[name="theme-color"]').content = dark ? '#000000' : '#f5f5f7';
}
function empty(title, copy, action = '') { return `<section class="panel empty">${icon('history')}<h2>${title}</h2><p>${copy}</p>${action}</section>`; }
function title(text) { $('#page-title').textContent = text; $('#add').hidden = page !== 'home' || !!selected; }
function card(c, index, list) {
  const s = stats(c), p = parts(s.current);
  return `<article class="counter-card" style="--tone:${c.color}">
    <button class="card-open" data-action="open" data-id="${escape(c.id)}" aria-label="Abrir ${escape(c.name)}">
      <div class="card-top"><span class="emoji" aria-hidden="true">${escape(c.emoji || '◷')}</span><span class="card-meta">${c.demo ? '<span class="tag">Exemplo</span>' : ''}${c.category ? escape(c.category) : ''}<span class="chevron">${icon('chevron')}</span></span></div>
      <div class="day-line"><strong class="day-number" data-time="days" data-counter="${escape(c.id)}">${p.days}</strong><span class="day-label" data-time="day-label" data-counter="${escape(c.id)}">${p.days === 1 ? 'dia' : 'dias'}</span></div>
      <h2 class="counter-name">${escape(c.name)}</h2>
      <div class="exact-time" data-time="duration" data-counter="${escape(c.id)}">${duration(s.current)}</div>
      <div class="card-footer"><span>Desde ${escape(date(c.start))}</span><span class="record-label" data-time="record" data-counter="${escape(c.id)}">Recorde: ${days(s.best)}</span></div>
    </button>
    ${reordering ? `<div class="move-controls"><button data-action="move" data-id="${escape(c.id)}" data-direction="-1" aria-label="Mover ${escape(c.name)} para cima" ${index === 0 ? 'disabled' : ''}>${icon('up')}</button><button data-action="move" data-id="${escape(c.id)}" data-direction="1" aria-label="Mover ${escape(c.name)} para baixo" ${index === list.length - 1 ? 'disabled' : ''}>${icon('down')}</button></div>` : `<button class="card-restart" data-action="restart" data-id="${escape(c.id)}">${icon('reset')}Recomeçar contador</button>`}
  </article>`;
}
function home() {
  title('Meu tempo');
  const counters = state.counters.filter(c => !c.archived);
  return `${state.counters.some(c => c.demo) ? '<div class="demo-note"><span>Contadores de demonstração</span><button data-action="remove-demo">Remover exemplos</button></div>' : ''}
    ${counters.length ? `<div class="section-row"><p>${counters.length} ${counters.length === 1 ? 'contador ativo' : 'contadores ativos'}</p><button class="text-button" data-action="reorder">${reordering ? 'Concluir' : 'Reorganizar'}</button></div>${reordering ? '<p class="muted">Use as setas. Cada mudança é salva automaticamente.</p>' : ''}<div class="counter-list">${counters.map((c, i) => card(c, i, counters)).join('')}</div>` : empty('Seu tempo começa aqui', 'Crie um contador para acompanhar o tempo desde a última vez.', '<button class="primary" data-action="create">Criar contador</button>')}`;
}
function metric(label, value, copy = '') { return `<div class="metric"><strong>${value}</strong><small>${label}${copy ? `<br>${copy}` : ''}</small></div>`; }
function historyRows(c) {
  return `<div class="history-item"><span class="history-dot"></span><div><strong data-time="current-history" data-counter="${escape(c.id)}">Sequência atual: ${days(elapsed(c.start))}</strong><small>Início: ${date(c.start)}${c.archived ? ' · Arquivado' : ''}</small></div></div>` + c.history.slice().reverse().map((h, i) => `<div class="history-item"><span class="history-dot"></span><div><strong>${days(h.end - h.start)}</strong><small>${duration(h.end - h.start)}<br>Início: ${date(h.start)}<br>Ocorrência: ${date(h.end)}<br>Novo início: ${date(h.newStart)}</small></div></div>`).join('');
}
function detail() {
  const c = getCounter();
  if (!c) { selected = null; return home(); }
  title('Seu contador');
  const s = stats(c), p = parts(s.current);
  return `<div class="detail-toolbar"><button class="back-button" data-action="back">${icon('back')}Voltar</button><button class="text-button" data-action="edit" data-id="${escape(c.id)}">Editar</button></div>
    <section class="panel hero" style="--tone:${c.color}"><div class="emoji" aria-hidden="true">${escape(c.emoji || '◷')}</div>
      ${c.archived ? '<p class="muted">Arquivado · a contagem continua</p>' : ''}
      <div class="day-line"><strong class="day-number" data-time="days" data-counter="${escape(c.id)}">${p.days}</strong><span class="day-label" data-time="day-label" data-counter="${escape(c.id)}">${p.days === 1 ? 'dia' : 'dias'}</span></div><h2 class="counter-name">${escape(c.name)}</h2>
      <div class="units">${['days','hours','minutes','seconds'].map((unit,i) => `<div><strong data-time="${unit}" data-counter="${escape(c.id)}">${String(p[unit]).padStart(i ? 2 : 1,'0')}</strong><small>${['dias','horas','minutos','segundos'][i]}</small></div>`).join('')}</div>
      <p class="muted">Desde ${date(c.start)}</p>${c.description ? `<p class="description">${escape(c.description)}</p>` : ''}
      <button class="primary full" data-action="restart" data-id="${escape(c.id)}">Recomeçar contador</button>
    </section>
    <section class="panel"><h2>Suas sequências</h2><div class="metrics">${metric('Melhor sequência', `<span data-time="best" data-counter="${escape(c.id)}">${days(s.best)}</span>`)}${metric('Média das anteriores', s.average === null ? '—' : days(s.average), s.average === null ? 'Ainda sem reinícios' : duration(s.average))}${metric('Reinícios', s.resets)}${metric('Criado em', new Date(c.createdAt).toLocaleDateString('pt-BR'))}</div></section>
    <section class="panel"><h2>Marcos</h2><div class="milestones" data-milestones="${escape(c.id)}">${milestoneHTML(c)}</div><p class="muted">Marcos da sequência atual. Meses e anos seguem o calendário.</p></section>
    <section class="panel" style="--tone:${c.color}"><h2>Histórico</h2><div style="margin-top:16px">${historyRows(c)}</div></section>
    <div class="form-actions"><button class="secondary" data-action="archive" data-id="${escape(c.id)}">${c.archived ? 'Desarquivar' : 'Arquivar'}</button><button class="danger-button" data-action="delete" data-id="${escape(c.id)}">Excluir contador</button></div>`;
}
function milestoneHTML(c) { return milestones(c.start).map(m => `<span class="milestone ${m.reached ? 'reached' : ''}" title="${date(m.at)}">${m.reached ? icon('check') : ''}${m.label}<span class="sr-only" hidden>${m.reached ? 'atingido' : ''}</span></span>`).join(''); }
function history() {
  title('Histórico');
  if (!state.counters.length) return empty('Nenhuma sequência ainda', 'Seus registros e recordes aparecerão aqui.');
  const resetCount = state.counters.reduce((sum,c) => sum + c.history.length, 0);
  const best = Math.max(...state.counters.map(c => stats(c).best));
  const entries = state.counters.flatMap(c => c.history.map(h => ({ c, h }))).sort((a,b) => b.h.end - a.h.end);
  return `<section class="panel"><div class="metrics">${metric('Maior sequência', days(best))}${metric('Reinícios registrados', resetCount)}</div></section>
    <div class="section-row"><h2>Contadores e recordes</h2></div><section class="panel">${state.counters.map(c => `<button class="history-link" data-action="open" data-id="${escape(c.id)}" style="--tone:${c.color}"><div class="history-item"><span class="history-dot"></span><div><strong>${escape(c.emoji)} ${escape(c.name)}</strong><small>Atual: ${days(elapsed(c.start))} · Recorde: ${days(stats(c).best)}<br>${c.history.length} reinícios${c.archived ? ' · Arquivado' : ''}${c.demo ? ' · Exemplo' : ''}</small></div></div></button>`).join('')}</section>
    <div class="section-row"><h2>Sequências anteriores</h2></div><section class="panel">${entries.length ? entries.map(({c,h}) => `<div class="history-item" style="--tone:${c.color}"><span class="history-dot"></span><div><strong>${escape(c.name)} · ${days(h.end-h.start)}</strong><small>${duration(h.end-h.start)}<br>${date(h.start)} → ${date(h.end)}</small></div></div>`).join('') : '<p class="muted">Ao recomeçar um contador, a sequência anterior fica registrada aqui.</p>'}</section>`;
}
function settingsRow(action, title, copy, symbol, danger = false) { return `<button class="setting-row ${danger ? 'danger' : ''}" data-action="${action}">${icon(symbol)}<span><strong>${title}</strong><small>${copy}</small></span><span class="chevron">${icon('chevron')}</span></button>`; }
function settings() {
  title('Ajustes');
  return `<section class="panel"><h2>Aparência</h2><div class="segmented">${[['system','Sistema'],['light','Claro'],['dark','Escuro']].map(([value,label]) => `<button data-action="theme" data-theme="${value}" aria-pressed="${state.settings.theme === value}">${label}</button>`).join('')}</div></section>
    <h2 class="settings-heading">Seus dados</h2><section class="panel settings-list">${settingsRow('export','Exportar backup','Todos os contadores e históricos em JSON','export')}${settingsRow('import','Importar backup','Validar e restaurar um arquivo JSON','import')}${settingsRow('archives','Contadores arquivados',`${state.counters.filter(c => c.archived).length} arquivados · a contagem continua`,'archive')}${state.counters.some(c => c.demo) ? settingsRow('remove-demo','Remover demonstração','Apagar apenas os contadores de exemplo','trash',true) : ''}</section>
    <p class="muted">Os dados ficam no armazenamento deste navegador ou PWA. Exporte um backup antes de limpar os dados do Safari ou trocar de dispositivo. O arquivo contém seus registros pessoais.</p>
    <h2 class="settings-heading">Aplicativo</h2><section class="panel settings-list">${settingsRow('install','Instalar no iPhone','Adicionar à Tela de Início pelo Safari','phone')}${settingsRow('check-update','Buscar atualização','Verificar se há uma nova versão','reset')}</section>
    <section class="panel privacy">${icon('shield')}<div><strong>Seu tempo é só seu</strong><p>Sem cadastro, analytics ou rastreadores. Os registros não são enviados a servidores.</p></div></section><p class="version">Tô limpo? · versão 1.0.0</p>`;
}
function render() {
  content.innerHTML = selected ? detail() : page === 'home' ? home() : page === 'history' ? history() : settings();
  document.querySelectorAll('[data-page]').forEach(button => {
    const current = button.dataset.page === page;
    if (current) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
  });
}
function tick() {
  if (!state || document.hidden) return;
  const now = Date.now();
  content.querySelectorAll('[data-time]').forEach(el => {
    const c = getCounter(el.dataset.counter); if (!c) return;
    const s = stats(c, now), p = parts(s.current), kind = el.dataset.time;
    const value = kind === 'duration' ? duration(s.current) : kind === 'record' ? `Recorde: ${days(s.best)}` : kind === 'best' ? days(s.best) : kind === 'current-history' ? `Sequência atual: ${days(s.current)}` : kind === 'day-label' ? p.days === 1 ? 'dia' : 'dias' : String(p[kind]).padStart(kind === 'days' ? 1 : 2,'0');
    if (el.textContent !== value) el.textContent = value;
  });
  content.querySelectorAll('[data-milestones]').forEach(el => {
    const c = getCounter(el.dataset.milestones); if (!c) return;
    const html = milestoneHTML(c); if (html !== el.innerHTML) el.innerHTML = html;
  });
}
function openSheet(heading, html) {
  $('#sheet-title').textContent = heading; sheetBody.innerHTML = html;
  if (!sheet.open) sheet.showModal();
  document.body.classList.add('modal-open'); sheet.scrollTop = 0;
}
function closeSheet() { sheet.close(); document.body.classList.remove('modal-open'); sheetBody.innerHTML = ''; }
function ask(heading, copy, label, callback, danger = false) {
  openSheet(heading, `<p class="confirm-copy">${escape(copy)}</p><p id="confirm-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="secondary" id="cancel-confirm">Cancelar</button><button class="${danger ? 'danger-button' : 'primary'}" id="accept-confirm">${label}</button></div>`);
  $('#cancel-confirm').onclick = closeSheet;
  $('#accept-confirm').onclick = async () => {
    const button = $('#accept-confirm'); button.disabled = true;
    try { if (await callback() !== false) closeSheet(); }
    catch (error) { $('#confirm-error').textContent = error.message; $('#confirm-error').hidden = false; }
    finally { if (button.isConnected) button.disabled = false; }
  };
}
function editor(id) {
  const c = id ? getCounter(id) : null;
  const now = Date.now();
  openSheet(c ? 'Editar contador' : 'Novo contador', `<form id="counter-form">
    <label class="field"><span>Nome do contador</span><input id="name" name="name" maxlength="80" placeholder="sem fazer aquilo" required value="${escape(c?.name || '')}"></label>
    <div class="field-grid"><label class="field"><span>Ícone ou emoji</span><input name="emoji" maxlength="32" placeholder="🌿" value="${escape(c?.emoji || '')}"></label><label class="field"><span>Categoria · opcional</span><select name="category"><option value="">Sem categoria</option>${[...new Set([...CATEGORIES, ...(c?.category ? [c.category] : [])])].map(cat => `<option ${cat === c?.category ? 'selected' : ''}>${escape(cat)}</option>`).join('')}</select></label></div>
    <div class="field"><span>Cor</span><div class="colors">${COLORS.map(color => `<button class="color-choice" type="button" data-color="${color}" style="--tone:${color}" aria-label="Cor ${color}" aria-pressed="${color === (c?.color || COLORS[0])}">${color === (c?.color || COLORS[0]) ? icon('check') : ''}</button>`).join('')}</div><label class="custom-color"><input id="color" name="color" type="color" value="${c?.color || COLORS[0]}">Escolher outra cor</label></div>
    <label class="field"><span>Data e hora de início</span><input id="start" name="start" type="datetime-local" max="${localInput(now)}" required value="${localInput(c?.start || now)}"></label><button class="text-button now-button" id="start-now" type="button">${c ? 'Usar data e hora de agora' : 'Começar agora'}</button>
    ${c?.history.length ? '<p class="muted">A alteração afeta só a sequência atual. O início deve ser posterior ao último reinício.</p>' : ''}
    <label class="field"><span>Descrição · opcional</span><textarea name="description" maxlength="1000" placeholder="Uma nota só sua">${escape(c?.description || '')}</textarea></label>
    <p id="form-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="secondary" type="button" id="cancel-form">Cancelar</button><button class="primary" type="submit">Salvar contador</button></div>
    </form>`);
  let preciseStart = c?.start || now;
  $('#start').oninput = () => { preciseStart = null; };
  $('#start-now').onclick = () => { preciseStart = Date.now(); $('#start').value = localInput(preciseStart); $('#start').max = localInput(preciseStart); };
  function setColor(color) { $('#color').value = color; sheetBody.querySelectorAll('[data-color]').forEach(b => { const chosen = b.dataset.color === color; b.setAttribute('aria-pressed',String(chosen)); b.innerHTML = chosen ? icon('check') : ''; }); }
  sheetBody.querySelectorAll('[data-color]').forEach(b => b.onclick = () => setColor(b.dataset.color));
  $('#color').oninput = e => setColor(e.target.value);
  $('#cancel-form').onclick = closeSheet;
  $('#counter-form').onsubmit = async e => {
    e.preventDefault();
    const form = e.target, fields = new FormData(form), start = preciseStart ?? new Date(fields.get('start')).getTime(), name = fields.get('name').trim();
    try {
      if (!name) throw new Error('Preencha o nome do contador.');
      if (!Number.isSafeInteger(start) || start < 0 || start > Date.now()) throw new Error('Escolha uma data de início válida, até agora.');
      const values = { name, emoji: fields.get('emoji').trim(), category: fields.get('category'), color: fields.get('color'), description: fields.get('description').trim(), start };
      const button = form.querySelector('[type=submit]'); button.disabled = true;
      const ok = await commit(data => {
        if (c) {
          const current = requiredCounter(data,c.id), last = current.history.at(-1);
          if (last && start < last.newStart) throw new Error('O início deve ser igual ou posterior ao último reinício.');
          Object.assign(current,values,{ demo:false });
        } else data.counters.push({ ...values, id:crypto.randomUUID(), createdAt:Date.now(), archived:false, demo:false, history:[] });
      }, c ? 'Contador atualizado' : 'Contador criado');
      if (ok) closeSheet(); else button.disabled = false;
    } catch (error) { $('#form-error').textContent = error.message; $('#form-error').hidden = false; }
  };
}
function restartDialog(id) {
  const c = getCounter(id); if (!c) return;
  openSheet('Recomeçar contador', `<p class="confirm-copy">${escape(c.name)}\nA sequência anterior será preservada no histórico.</p><label class="field"><span>Data e hora da ocorrência</span><input id="restart-date" type="datetime-local" min="${localInput(c.start)}" max="${localInput(Date.now())}" value="${localInput(Date.now())}" required></label><button class="text-button now-button" id="restart-now">Usar agora</button><p class="muted">O novo início será a data e hora da ocorrência.</p><p id="restart-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="secondary" id="cancel-reset">Cancelar</button><button class="primary" id="confirm-reset">Confirmar reinício</button></div>`);
  let at = null;
  $('#restart-date').oninput = () => { at = new Date($('#restart-date').value).getTime(); };
  $('#restart-now').onclick = () => { at = null; $('#restart-date').value = localInput(Date.now()); };
  $('#cancel-reset').onclick = closeSheet;
  $('#confirm-reset').onclick = async () => {
    const when = at ?? Date.now();
    if (!Number.isSafeInteger(when) || when < c.start || when > Date.now()) { $('#restart-error').hidden = false; $('#restart-error').textContent = 'Escolha uma ocorrência entre o início atual e agora.'; return; }
    $('#confirm-reset').disabled = true;
    if (await commit(data => restart(requiredCounter(data,id),when), 'Sequência registrada. Contador recomeçado.')) closeSheet();
    else $('#confirm-reset').disabled = false;
  };
}
async function exportBackup() {
  try {
    // Refresh before exporting, including changes made in another tab.
    state = await readState();
    const file = new Blob([JSON.stringify(backup(state),null,2)],{type:'application/json'});
    const url = URL.createObjectURL(file), a = document.createElement('a');
    a.href = url; a.download = `to-limpo-backup-${new Date().toISOString().slice(0,10)}.json`; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url),60000); toast('Backup preparado para salvar');
  } catch (error) { toast(error.message); }
}
async function importFile(file) {
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('O backup deve ter no máximo 5 MB.');
    const restored = parseBackup(JSON.parse(await file.text()));
    ask('Restaurar backup?', `Arquivo validado: ${restored.counters.length} contadores e ${restored.counters.reduce((sum,c) => sum + c.history.length,0)} reinícios.\n\nIsso substituirá todos os dados atuais. Exporte um backup antes se quiser preservá-los.`, 'Restaurar', async () => {
      const ok = await commit(() => restored, 'Backup restaurado');
      if (ok) { selected = null; reordering = false; render(); }
      return ok;
    });
  } catch (error) { toast(error instanceof SyntaxError ? 'O arquivo não contém um JSON válido. Nenhum dado foi substituído.' : error.message); }
  finally { $('#backup-file').value = ''; }
}
function archiveList() {
  const counters = state.counters.filter(c => c.archived);
  openSheet('Contadores arquivados', counters.length ? counters.map(c => `<div class="archive-row"><span>${escape(c.emoji)} ${escape(c.name)}</span><button data-action="open-archive" data-id="${escape(c.id)}">Abrir</button><button data-action="restore" data-id="${escape(c.id)}">Restaurar</button></div>`).join('') : '<p class="muted">Nenhum contador arquivado.</p>');
}
const actions = {
  create: () => editor(), open: id => { selected=id; reordering=false; render(); window.scrollTo(0,0); },
  back: () => { selected=null; render(); window.scrollTo(0,0); }, edit: id => editor(id), restart: restartDialog,
  reorder: () => { reordering=!reordering; render(); },
  move: async (id, button) => {
    await commit(data => {
      const active = data.counters.filter(c => !c.archived), from = active.findIndex(c => c.id === id), to = from + Number(button.dataset.direction);
      if (from < 0 || to < 0 || to >= active.length) return;
      const a = data.counters.findIndex(c => c.id === id), b = data.counters.findIndex(c => c.id === active[to].id);
      [data.counters[a],data.counters[b]] = [data.counters[b],data.counters[a]];
    });
    const moved = [...content.querySelectorAll('[data-action=move]')].find(b => b.dataset.id===id && b.dataset.direction===button.dataset.direction && !b.disabled); moved?.focus();
  },
  archive: async id => { const c=getCounter(id); if (!c) return; const archived=!c.archived; if (await commit(data => { requiredCounter(data,id).archived=archived; }, archived ? 'Contador arquivado' : 'Contador restaurado')) { selected=null; render(); } },
  delete: id => { const c=getCounter(id); if (!c) return; ask('Excluir contador?', `“${c.name}” e todo o histórico serão apagados. Essa ação não pode ser desfeita.`, 'Excluir', async () => { const ok=await commit(data => { data.counters=data.counters.filter(c => c.id!==id); },'Contador excluído'); if(ok) { selected=null; render(); } return ok; },true); },
  'remove-demo': () => ask('Remover demonstração?', 'Somente os contadores ainda marcados como exemplo serão excluídos. Os seus contadores serão preservados.', 'Remover', () => commit(data => { data.counters=data.counters.filter(c => !c.demo); },'Exemplos removidos'),true),
  theme: (id,button) => commit(data => { data.settings.theme=button.dataset.theme; }),
  export: exportBackup, import: () => $('#backup-file').click(), archives: archiveList,
  restore: async id => { if(await commit(data => { requiredCounter(data,id).archived=false; },'Contador restaurado')) archiveList(); },
  'open-archive': id => { closeSheet(); selected=id; render(); window.scrollTo(0,0); },
  install: () => { openSheet('Instalar no iPhone', '<p class="confirm-copy">1. Abra este app no Safari.\n2. Toque no botão Compartilhar.\n3. Escolha “Adicionar à Tela de Início”.\n4. Confirme em “Adicionar”.</p><p class="muted">Depois do primeiro carregamento completo, o app funciona offline. Safari e app instalado podem usar armazenamentos separados; use o backup para transferir seus dados se necessário.</p><button class="primary full" id="install-done">Entendi</button>'); $('#install-done').onclick=closeSheet; },
  'check-update': async () => { try { toast(await checkUpdates()); } catch(error) { toast(error.message); } }
};
async function handleAction(e) {
  const button=e.target.closest('[data-action]'); if (!button || button.disabled || busy || !state) return;
  try { await actions[button.dataset.action]?.(button.dataset.id,button); } catch(error) { toast(error.message); }
}
content.addEventListener('click',handleAction); sheetBody.addEventListener('click',handleAction);
$('#add').innerHTML=icon('plus'); $('#close-sheet').innerHTML=icon('close');
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML=icon(el.dataset.icon));
$('#add').onclick=() => { if(state) editor(); };
$('#close-sheet').onclick=closeSheet;
sheet.addEventListener('close',() => document.body.classList.remove('modal-open'));
sheet.addEventListener('click',e => { if(e.target===sheet) { const rect=sheet.getBoundingClientRect(); if(e.clientX<rect.left || e.clientX>rect.right || e.clientY<rect.top || e.clientY>rect.bottom) closeSheet(); } });
document.querySelectorAll('[data-page]').forEach(button => button.onclick=() => { if(!state) return; page=button.dataset.page; selected=null; reordering=false; render(); window.scrollTo(0,0); });
$('#backup-file').onchange=e => importFile(e.target.files[0]);
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',() => state && applyTheme());
async function refresh() { if(!state || busy) return; try { state=await readState(); applyTheme(); render(); } catch(error) { toast(error.message); } }
channel && (channel.onmessage=refresh);
document.addEventListener('visibilitychange',() => { if(!document.hidden) { refresh(); checkUpdates().catch(() => {}); } });
async function main() {
  try { state=await initialize(); applyTheme(); render(); setInterval(tick,1000); setupUpdates({ toast, isEditing:() => sheet.open }); }
  catch(error) { content.innerHTML=empty('Não foi possível abrir', escape(error.message),'<button class="primary" id="retry">Tentar novamente</button>'); $('#retry').onclick=() => location.reload(); }
}
main();
