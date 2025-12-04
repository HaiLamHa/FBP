'use client';

export interface StoredImageState {
  base64: string | null;
  keywords: string[] | null;
}

const DB_NAME = 'itwasntme_gallery_db';
const DB_VERSION = 1;
const STORE_NAME = 'images';

const openImageDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('Failed to open IndexedDB.'));
  });

const createEmptySlots = (slotCount: number): StoredImageState[] =>
  Array.from({ length: slotCount }, () => ({ base64: null, keywords: null }));

export const loadStoredImages = async (
  slotCount: number
): Promise<StoredImageState[]> => {
  try {
    const db = await openImageDb();
    return await new Promise(resolve => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const fallback: StoredImageState[] = createEmptySlots(slotCount);

        const records = request.result as { id: number }[] | undefined;
        if (!records) {
          resolve(fallback);
          return;
        }

        const filled = [...fallback];
        for (const record of records) {
          const id = typeof record.id === 'number' ? record.id : -1;
          if (id >= 0 && id < slotCount) {
            const anyRecord = record as StoredImageState & { id: number };
            filled[id] = {
              base64:
                typeof anyRecord.base64 === 'string' ? anyRecord.base64 : null,
              keywords: Array.isArray(anyRecord.keywords)
                ? anyRecord.keywords
                : null,
            };
          }
        }
        resolve(filled);
      };

      request.onerror = () => resolve(createEmptySlots(slotCount));
    });
  } catch (error) {
    console.error('Error loading images from IndexedDB:', error);
    return createEmptySlots(slotCount);
  }
};

export const saveStoredImages = async (
  images: StoredImageState[]
): Promise<void> => {
  try {
    const db = await openImageDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      images.forEach((image, index) => {
        store.put({
          id: index,
          base64: image.base64,
          keywords: image.keywords,
        });
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error('Failed to save images.'));
    });
  } catch (error) {
    console.error('Error saving images to IndexedDB:', error);
  }
};

export const clearStoredImages = async (): Promise<void> => {
  try {
    const db = await openImageDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(request.error ?? new Error('Failed to clear stored images.'));
    });
  } catch (error) {
    console.error('Error clearing IndexedDB images:', error);
  }
};
