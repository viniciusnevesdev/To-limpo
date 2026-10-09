export const DAY = 86400000;
export const COLORS = ['#7259d6', '#3478f6', '#26976a', '#d77827', '#c95683', '#6b788c'];
export const CATEGORIES = ['Saúde', 'Vícios', 'Alimentação', 'Relacionamentos', 'Gastos', 'Hábitos', 'Personalizado'];
export function elapsed(start, now = Date.now()) { return Math.max(0, now - start); }
export function parts(ms) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
}
export function duration(ms, seconds = false) {
  const p = parts(ms);
  return `${p.days} ${p.days === 1 ? 'dia' : 'dias'}, ${p.hours} ${p.hours === 1 ? 'hora' : 'horas'} e ${p.minutes} ${p.minutes === 1 ? 'minuto' : 'minutos'}${seconds ? `, ${p.seconds} s` : ''}`;
}
const measure = (value, singular, plural) => `${value} ${value === 1 ? singular : plural}`;
export function cardTime(ms) {
  const safe = Math.max(0, ms), p = parts(safe);
  if (safe < DAY) return { value:p.hours, label:p.hours === 1 ? 'hora' : 'horas', detail:`${measure(p.minutes,'minuto','minutos')} e ${measure(p.seconds,'segundo','segundos')}`, interval:1000 };
  if (safe < 7 * DAY) return { value:p.days, label:p.days === 1 ? 'dia' : 'dias', detail:`${measure(p.hours,'hora','horas')} e ${measure(p.minutes,'minuto','minutos')}`, interval:60000 };
  return { value:p.days, label:p.days === 1 ? 'dia' : 'dias', detail:measure(p.hours,'hora','horas'), interval:3600000 };
}
export function stats(counter, now = Date.now()) {
  const previous = counter.history.map(h => h.end - h.start);
  const current = elapsed(counter.start, now);
  return { current, best: Math.max(current, ...previous), previousBest: Math.max(0, ...previous), average: previous.length ? previous.reduce((a, b) => a + b, 0) / previous.length : null, resets: previous.length };
}
export function addCalendar(start, months) {
  const date = new Date(start), day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, last));
  return date.getTime();
}
export function milestones(start, now = Date.now()) {
  return [...[1, 3, 7, 14, 30, 60, 90].map(d => ({ label: `${d} ${d === 1 ? 'dia' : 'dias'}`, at: start + d * DAY })), { label: '6 meses', at: addCalendar(start, 6) }, { label: '1 ano', at: addCalendar(start, 12) }].map(m => ({ ...m, reached: now >= m.at }));
}
export function restart(counter, at = Date.now()) {
  if (!Number.isSafeInteger(at) || at < counter.start || at > Date.now()) throw new Error('A ocorrência deve ficar entre o início atual e agora.');
  counter.history.push({ start: counter.start, end: at, newStart: at });
  counter.start = at;
  counter.demo = false;
}
export function initialState(now = Date.now()) {
  const samples = [['sem refrigerante', '🥤', 12, 21, COLORS[0], 'Alimentação'], ['sem gastar por impulso', '🛍️', 7, 14, COLORS[1], 'Gastos'], ['sem fumar', '🌿', 32, 48, COLORS[2], 'Saúde']];
  return { counters: samples.map(([name, emoji, days, record, color, category]) => {
    const start = now - days * DAY - 6 * 3600000 - 14 * 60000;
    const end = start - DAY;
    return { id: crypto.randomUUID(), name, emoji, color, category, description: 'Contador de demonstração. Você pode editar ou remover.', start, createdAt: end - record * DAY, archived: false, demo: true, history: [{ start: end - record * DAY, end, newStart: end }] };
  }), settings: { theme: 'system' } };
}
function invalid() { throw new Error('Backup inválido ou incompatível. Nenhum dado foi substituído.'); }
export function validateState(input, now = Date.now()) {
  if (!input || !Array.isArray(input.counters) || input.counters.length > 10000 || !input.settings || !['system', 'light', 'dark'].includes(input.settings.theme)) invalid();
  const ids = new Set();
  const timestamp = value => Number.isSafeInteger(value) && value >= 0 && value <= now;
  const text = (value, max) => typeof value === 'string' && value.length <= max;
  const counters = input.counters.map(c => {
    if (!c || !text(c.id, 100) || !c.id || ids.has(c.id) || !text(c.name, 80) || !c.name.trim() || !text(c.description, 1000) || !text(c.emoji, 32) || !text(c.category, 80) || !/^#[0-9a-f]{6}$/i.test(c.color) || !timestamp(c.start) || !timestamp(c.createdAt) || typeof c.archived !== 'boolean' || typeof c.demo !== 'boolean' || !Array.isArray(c.history) || c.history.length > 10000) invalid();
    ids.add(c.id);
    let lastEnd = 0;
    const history = c.history.map(h => {
      if (!h || !timestamp(h.start) || !timestamp(h.end) || !timestamp(h.newStart) || h.end < h.start || h.newStart < h.end || h.start < lastEnd) invalid();
      lastEnd = h.newStart;
      return { start: h.start, end: h.end, newStart: h.newStart };
    });
    if (c.start < lastEnd) invalid();
    return { id: c.id, name: c.name.trim(), description: c.description, emoji: c.emoji, category: c.category, color: c.color, start: c.start, createdAt: c.createdAt, archived: c.archived, demo: c.demo, history };
  });
  return { counters, settings: { theme: input.settings.theme } };
}
export function parseBackup(input) {
  if (!input || input.app !== 'to-limpo' || input.version !== 1) invalid();
  return validateState(input.data);
}
export function backup(state) { return { app: 'to-limpo', version: 1, exportedAt: new Date().toISOString(), data: validateState(state) }; }
