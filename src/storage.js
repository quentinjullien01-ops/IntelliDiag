// ═══ STORAGE MODULE ═══
// Mission data → localStorage (JSON, small)
// Photos → IndexedDB (blobs, large)

const DB_NAME = 'diag-ia-db';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';

// ── IndexedDB for photos ──
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePhoto(id, file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readwrite');
    tx.objectStore(PHOTO_STORE).put({ id, file, timestamp: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readonly');
    const req = tx.objectStore(PHOTO_STORE).get(id);
    req.onsuccess = () => resolve(req.result?.file || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhotos(ids) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readwrite');
    const store = tx.objectStore(PHOTO_STORE);
    ids.forEach(id => store.delete(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── localStorage for mission data ──
const IDX_KEY = 'diag-ia:missions-index';

export function loadMissionsIndex() {
  try {
    const raw = localStorage.getItem(IDX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMissionsIndex(index) {
  localStorage.setItem(IDX_KEY, JSON.stringify(index));
}

export function loadMission(id) {
  try {
    const raw = localStorage.getItem(`diag-ia:mission:${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveMission(mission) {
  localStorage.setItem(`diag-ia:mission:${mission.id}`, JSON.stringify(mission));
}

export function deleteMission(id) {
  localStorage.removeItem(`diag-ia:mission:${id}`);
}
