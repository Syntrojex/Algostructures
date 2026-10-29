import type { Lab } from './core';

/* Each lab file is its own chunk: opening the Stack lab does not download the Heap lab. */
const LOADERS: Record<string, () => Promise<Lab>> = {
  array: () => import('./arrayLab').then(m => m.arrayLab),
  sll: () => import('./listLabs').then(m => m.sllLab),
  dll: () => import('./listLabs').then(m => m.dllLab),
  cll: () => import('./listLabs').then(m => m.cllLab),
  stack: () => import('./stackQueueLabs').then(m => m.stackLab),
  queue: () => import('./stackQueueLabs').then(m => m.queueLab),
  bst: () => import('./treeHashLabs').then(m => m.bstLab),
  avl: () => import('./avlLab').then(m => m.avlLab),
  heap: () => import('./treeHashLabs').then(m => m.heapLab),
  maxheap: () => import('./treeHashLabs').then(m => m.maxHeapLab),
  hash: () => import('./treeHashLabs').then(m => m.hashLab),
  recursion: () => import('./recursionLab').then(m => m.recursionLab),
};

export function loadLab(id: string): Promise<Lab | null> {
  const load = LOADERS[id];
  return load ? load() : Promise.resolve(null);
}
