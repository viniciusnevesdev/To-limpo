import { initialState, validateState } from './model.js';
let database;
export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('to-limpo', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('state');
    request.onerror = () => reject(new Error('Não foi possível abrir o armazenamento. Verifique se o navegador permite dados locais.'));
    request.onblocked = () => reject(new Error('Feche outras abas deste app e tente novamente.'));
    request.onsuccess = () => {
      database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };
  });
}
export function readState() {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('state', 'readonly');
    const request = transaction.objectStore('state').get('main');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
// Read, modify and commit together: tabs cannot overwrite each other's changes.
export function updateState(mutator) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('state', 'readwrite');
    const store = transaction.objectStore('state');
    const request = store.get('main');
    let result, failure;
    request.onsuccess = () => {
      try {
        const current = request.result || initialState();
        result = validateState(mutator(current) || current);
        store.put(result, 'main');
      } catch (error) { failure = error; transaction.abort(); }
    };
    transaction.oncomplete = () => resolve(result);
    transaction.onabort = transaction.onerror = () => reject(failure || new Error('Não foi possível salvar. Os dados anteriores foram preservados.'));
  });
}
export async function initialize() {
  await openDatabase();
  return updateState(state => state);
}
