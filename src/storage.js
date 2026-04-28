const DB_NAME = 'diag-ia-db';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('photos')) {
        req.result.createObjectStore('photos', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePhoto(id, file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    tx.objectStore('photos').put({ id, file, timestamp: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const req = tx.objectStore('photos').get(id);
    req.onsuccess = () => resolve(req.result?.file || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhotos(ids) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    ids.forEach(id => tx.objectStore('photos').delete(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function loadMissionsIndex() {
  try { return JSON.parse(localStorage.getItem('diag-ia:idx') || '[]'); } catch { return []; }
}
export function saveMissionsIndex(idx) { localStorage.setItem('diag-ia:idx', JSON.stringify(idx)); }
export function loadMission(id) {
  try { return JSON.parse(localStorage.getItem('diag-ia:m:' + id) || 'null'); } catch { return null; }
}
export function saveMission(m) { localStorage.setItem('diag-ia:m:' + m.id, JSON.stringify(m)); }
export function deleteMission(id) { localStorage.removeItem('diag-ia:m:' + id); }
