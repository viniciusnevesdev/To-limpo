import test from 'node:test';
import assert from 'node:assert/strict';
import { DAY, initialState, parts, elapsed, stats, restart, validateState, parseBackup, backup, addCalendar, milestones } from '../model.js';
const now = Date.now() - 1000;
test('tempo é calculado pela data, incluindo segundos e dias completos', () => {
  assert.deepEqual(parts(32 * DAY + 6 * 3600000 + 14 * 60000 + 8000), {days:32,hours:6,minutes:14,seconds:8});
  assert.equal(elapsed(now - 12 * DAY, now), 12 * DAY);
  assert.equal(elapsed(now + DAY, now), 0);
});
test('reinício preserva a sequência anterior e calcula recorde e média', () => {
  const c=initialState(now).counters[0];
  const oldStart=c.start, previousCount=c.history.length;
  restart(c,now);
  assert.equal(c.history.length,previousCount+1);
  assert.deepEqual(c.history.at(-1),{start:oldStart,end:now,newStart:now});
  assert.equal(stats(c,now).current,0);
  assert.equal(stats(c,now).best,21*DAY);
  assert.equal(stats(c,now).average,(21*DAY+now-oldStart)/2);
  assert.equal(c.demo,false);
  assert.throws(() => restart(c,now-1));
  assert.throws(() => restart(c,Date.now()+DAY));
});
test('sequência atual participa do recorde, mas não da média das concluídas', () => {
  const c=initialState(now).counters[0]; c.start=now-30*DAY; c.history=[];
  const s=stats(c,now); assert.equal(s.best,30*DAY); assert.equal(s.average,null); assert.equal(s.resets,0);
});
test('backup preserva históricos, ordem, arquivados e tema', () => {
  const state=initialState(now); state.counters.reverse(); state.counters[0].archived=true; state.settings.theme='dark';
  const exported=backup(state);
  assert.deepEqual(parseBackup(JSON.parse(JSON.stringify(exported))),state);
});
test('rejeita versões incorretas, IDs repetidos, cores inseguras e datas inválidas', () => {
  const state=initialState(now);
  assert.throws(() => parseBackup({app:'outro',version:1,data:state}));
  assert.throws(() => parseBackup({app:'to-limpo',version:2,data:state}));
  for(const mutate of [s=>s.counters.push(s.counters[0]),s=>s.counters[0].start=Date.now()+DAY,s=>s.counters[0].color='red;display:none',s=>s.counters[0].history[0].end=0,s=>s.counters[0].start=0,s=>s.settings.theme='invalid',s=>s.counters[0].name='   ',s=>s.counters[0].start='2026-01-01']) {
    const broken=structuredClone(state); mutate(broken); assert.throws(() => validateState(broken));
  }
});
test('meses e anos respeitam o calendário e o fim do mês', () => {
  const start=new Date(2024,7,31,12).getTime();
  assert.equal(new Date(addCalendar(start,6)).getDate(),28);
  const leap=new Date(2024,1,29,12).getTime();
  assert.equal(new Date(addCalendar(leap,12)).getDate(),28);
  const list=milestones(start,start+7*DAY); assert.equal(list.filter(m=>m.reached).length,3);
});
