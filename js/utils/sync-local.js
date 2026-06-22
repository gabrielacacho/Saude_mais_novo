/** Sincroniza o texto de local entre header, mapa e título de eventos */

let localAtual = 'Urca';
const listeners = new Set();

export function getLocal() {
  return localAtual;
}

export function setLocal(valor, origem = '') {
  const texto = (valor ?? '').toString();
  if (texto === localAtual) return;
  localAtual = texto;
  listeners.forEach((fn) => fn(texto, origem));
}

export function onLocalChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Atualiza todos os inputs com o mesmo id/classe sem disparar loop */
export function bindLocalInputs(seletores, origem) {
  seletores.forEach((el) => {
    if (!el || el.dataset.syncing === '1') return;
    el.dataset.syncing = '1';
    el.value = localAtual;
    delete el.dataset.syncing;
  });

  seletores.forEach((el) => {
    if (!el || el.dataset.bound === '1') return;
    el.dataset.bound = '1';
    el.addEventListener('input', () => {
      if (el.dataset.syncing === '1') return;
      setLocal(el.value, origem);
    });
    el.addEventListener('change', () => {
      if (el.dataset.syncing === '1') return;
      setLocal(el.value, origem);
    });
  });
}

export function refreshLocalInputs(seletores) {
  seletores.forEach((el) => {
    if (!el) return;
    el.dataset.syncing = '1';
    el.value = localAtual;
    delete el.dataset.syncing;
  });
}
