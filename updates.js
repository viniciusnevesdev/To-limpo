let registration, requested = false, reloaded = false, hooks;
let controllerSeen = false;
function announce(active = false) {
  const banner=document.querySelector('#update-banner');
  banner.hidden=false;
  banner.querySelector('span').textContent=active ? 'Nova versão pronta' : 'Nova versão disponível';
  document.querySelector('#update-now').onclick=() => {
    if(hooks.isEditing()) { hooks.toast('Feche ou salve a janela aberta antes de atualizar.'); return; }
    requested=true;
    if(active) location.reload(); else registration?.waiting?.postMessage({type:'SKIP_WAITING'});
  };
}
export async function setupUpdates(options) {
  hooks=options;
  if(!('serviceWorker' in navigator)) return;
  controllerSeen = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',() => {
    if(requested && !reloaded) { reloaded=true; location.reload(); }
    else if(controllerSeen && registration?.active && navigator.serviceWorker.controller) announce(true);
    controllerSeen = true;
  });
  try {
    const wasControlled=!!navigator.serviceWorker.controller;
    registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
    if(registration.waiting) announce();
    registration.addEventListener('updatefound',() => {
      const worker=registration.installing;
      worker?.addEventListener('statechange',() => {
        if(worker.state==='installed' && (wasControlled || navigator.serviceWorker.controller)) announce();
      });
    });
  } catch { hooks.toast('O modo offline não pôde ser preparado. Tente buscar atualização quando estiver online.'); }
}
export async function checkUpdates() {
  if(!navigator.onLine) return 'Você está offline. Tente novamente quando estiver conectado.';
  if(!('serviceWorker' in navigator)) return 'Este navegador não oferece suporte ao modo offline.';
  if(!registration) throw new Error('O modo offline ainda não está pronto. Reabra o app online.');
  await registration.update();
  if(registration.waiting) { announce(); return 'Nova versão disponível. Toque em Atualizar.'; }
  return registration.installing ? 'Verificando a nova versão…' : 'Você está usando a versão mais recente.';
}
