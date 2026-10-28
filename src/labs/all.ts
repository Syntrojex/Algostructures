import type { Lab } from './core';
import { arrayLab } from './arrayLab';
import { sllLab, dllLab, cllLab } from './listLabs';
import { stackLab, queueLab } from './stackQueueLabs';
import { bstLab, heapLab, maxHeapLab, hashLab } from './treeHashLabs';
import { recursionLab } from './recursionLab';
import { avlLab } from './avlLab';

export const LABS: Record<string, Lab> = {
  array: arrayLab,
  sll: sllLab,
  dll: dllLab,
  cll: cllLab,
  stack: stackLab,
  queue: queueLab,
  bst: bstLab,
  avl: avlLab,
  heap: heapLab,
  maxheap: maxHeapLab,
  hash: hashLab,
  recursion: recursionLab,
};
