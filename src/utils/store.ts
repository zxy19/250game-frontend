import { v4 as uuidv4 } from 'uuid';

export async function CreateLocalUrl(blob: Blob): Promise<string> {
    let request = window.indexedDB.open("files",2);
    let db: IDBDatabase = await new Promise((resolve, reject) => {
        request.onsuccess = (e) => resolve(request.result);
        request.onupgradeneeded = (e) => {
            console.log(e);
            let db: IDBDatabase = (e.target! as any).result as IDBDatabase;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'name' });
            }
        }
        request.onerror = reject;
    });
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');
    const file = { name: uuidv4(), blob: blob };
    new Promise((resolve, reject) => {
        let request = store.add(file);
        request.onsuccess = resolve;
        request.onerror = reject;
    })
    return "local:" + file.name;
}
export async function DeleteLocalUrl(name: string): Promise<void> {
    let id = name.substring(6);
    let request = window.indexedDB.open("files");
    let db: IDBDatabase = await new Promise((resolve, reject) => {
        request.onsuccess = (e) => resolve(request.result);
        request.onupgradeneeded = (e) => {
            let db: IDBDatabase = (e.target! as any).result as IDBDatabase;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'name' });
            }
        }
        request.onerror = reject;
    })
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');
    const fileRequest = store.delete(id);
    await new Promise((resolve, reject) => {
        fileRequest.onsuccess = resolve;
        fileRequest.onerror = reject
    });
    store.delete(id);
}
export async function GetLocalUrls(): Promise<string[]> {
    let request = window.indexedDB.open("files");
    let db: IDBDatabase = await new Promise((resolve, reject) => {
        request.onsuccess = (e) => resolve(request.result);
        request.onupgradeneeded = (e) => {
            let db: IDBDatabase = (e.target! as any).result as IDBDatabase;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'name' });
            }
        }
        request.onerror = reject;
    })
    const transaction = db.transaction('files');
    const store = transaction.objectStore('files');
    const fileRequest = store.getAll();
    const files: { name: string, blob: Blob }[] = await new Promise((resolve, reject) => {
        fileRequest.onsuccess = () => resolve(fileRequest.result);
        fileRequest.onerror = reject
    });
    return files.map(file => URL.createObjectURL(file.blob as Blob));
}
export async function GetLocalUrl(name: string): Promise<string> {
    let id = name.substring(6);
    let request = window.indexedDB.open("files");
    let db: IDBDatabase = await new Promise((resolve, reject) => {
        request.onsuccess = (e) => resolve(request.result);
        request.onupgradeneeded = (e) => {
            let db: IDBDatabase = (e.target! as any).result as IDBDatabase;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'name' });
            }
        }
        request.onerror = reject;
    })
    const transaction = db.transaction('files');
    const store = transaction.objectStore('files');
    const fileRequest = store.get(id);
    const file: { name: string, blob: Blob } = await new Promise((resolve, reject) => {
        fileRequest.onsuccess = () => resolve(fileRequest.result);
        fileRequest.onerror = reject
    });

    return URL.createObjectURL(file.blob as Blob);
}