import type { PerfilInicial } from '../components/Signup';

const databaseName = 'unilink-onboarding';
const storeName = 'pending-profile';
const profileKey = 'profile';

interface StoredProfile {
  nombre: string;
  centroUniversitario: string;
  gustos: PerfilInicial['gustos'];
}

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('No se pudo abrir el almacenamiento local.'));
    };
  });

export async function savePendingProfile(profile: PerfilInicial): Promise<void> {
  const storedProfile: StoredProfile = {
    nombre: profile.nombre,
    centroUniversitario: profile.centroUniversitario,
    gustos: profile.gustos,
  };
  window.localStorage.setItem('unilink.pending-profile', JSON.stringify(storedProfile));

  if (!profile.fotoArchivo) return;
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = database
      .transaction(storeName, 'readwrite')
      .objectStore(storeName)
      .put(profile.fotoArchivo, profileKey);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject(request.error ?? new Error('No se pudo guardar la foto temporalmente.'));
    };
  });
}

export async function getPendingProfile(): Promise<PerfilInicial | null> {
  const rawProfile = window.localStorage.getItem('unilink.pending-profile');
  if (!rawProfile) return null;

  const storedProfile = JSON.parse(rawProfile) as StoredProfile;
  let fotoArchivo: File | null = null;
  const database = await openDatabase();
  fotoArchivo = await new Promise<File | null>((resolve, reject) => {
    const request = database
      .transaction(storeName, 'readonly')
      .objectStore(storeName)
      .get(profileKey);
    request.onsuccess = () => {
      resolve(request.result instanceof File ? request.result : null);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('No se pudo recuperar la foto.'));
    };
  });

  return { ...storedProfile, fotoArchivo };
}

export async function clearPendingProfile(): Promise<void> {
  window.localStorage.removeItem('unilink.pending-profile');
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = database
      .transaction(storeName, 'readwrite')
      .objectStore(storeName)
      .delete(profileKey);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject(request.error ?? new Error('No se pudo limpiar el registro temporal.'));
    };
  });
}
