import { createClientId } from '@/lib/create-client-id';
import type { CreateTightnessTestInput } from '@/types/tightness-test';

const DB_NAME = 'batalha-naval-offline';
const DB_VERSION = 1;
const STORE_NAME = 'tightness-tests';

export const offlineTightnessTestQueueQueryKey = [
  'offline-tightness-test-queue',
] as const;

export type QueuedTightnessTest = {
  id: string;
  payload: CreateTightnessTestInput;
  label: string;
  queuedAt: string;
  status: 'pending' | 'failed';
  lastError?: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error ?? new Error('IndexedDB error'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = callback(store);

        request.onerror = () => reject(request.error ?? new Error('IndexedDB error'));
        request.onsuccess = () => resolve(request.result as T);
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB error'));
      }),
  );
}

export async function listQueuedTightnessTests(): Promise<QueuedTightnessTest[]> {
  const items = await runTransaction<QueuedTightnessTest[]>('readonly', (store) =>
    store.getAll(),
  );

  return items.sort((left, right) => left.queuedAt.localeCompare(right.queuedAt));
}

export async function enqueueTightnessTest(input: {
  payload: CreateTightnessTestInput;
  label?: string;
}): Promise<QueuedTightnessTest> {
  const item: QueuedTightnessTest = {
    id: createClientId(),
    payload: input.payload,
    label: input.label ?? `OF ${input.payload.ofNumber}`,
    queuedAt: new Date().toISOString(),
    status: 'pending',
  };

  await runTransaction('readwrite', (store) => store.add(item));
  return item;
}

export async function removeQueuedTightnessTest(id: string): Promise<void> {
  await runTransaction('readwrite', (store) => store.delete(id));
}

export async function markQueuedTightnessTestFailed(
  id: string,
  lastError: string,
): Promise<void> {
  const item = await runTransaction<QueuedTightnessTest | undefined>(
    'readonly',
    (store) => store.get(id),
  );

  if (!item) {
    return;
  }

  await runTransaction('readwrite', (store) =>
    store.put({
      ...item,
      status: 'failed',
      lastError,
    }),
  );
}
