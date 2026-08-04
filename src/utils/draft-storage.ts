const DRAFT_PREFIX = 'kb_draft_';

export interface DraftData {
  documentId?: string;
  title: string;
  content: string;
  summary: string;
  categoryId?: number;
  isPublic: number;
  saveOption: 'submit_review' | 'draft';
  savedAt: number;
}

function keyFor(documentId?: string | number) { return documentId ? `${DRAFT_PREFIX}${documentId}` : `${DRAFT_PREFIX}new`; }

export const draftStorage = {
  save(documentId: string | number | undefined, data: Omit<DraftData, 'savedAt'>) {
    try { localStorage.setItem(keyFor(documentId), JSON.stringify({ ...data, savedAt: Date.now() })); } catch { /* local storage is only a fallback */ }
  },
  load(documentId?: string | number): DraftData | null {
    try { const raw = localStorage.getItem(keyFor(documentId)); return raw ? JSON.parse(raw) as DraftData : null; } catch { return null; }
  },
  remove(documentId?: string | number) { try { localStorage.removeItem(keyFor(documentId)); } catch { /* no-op */ } },
  removeAll() {
    try { Object.keys(localStorage).filter((key) => key.startsWith(DRAFT_PREFIX)).forEach((key) => localStorage.removeItem(key)); } catch { /* no-op */ }
  },
  findLatest(): DraftData | null {
    try {
      return Object.keys(localStorage).filter((key) => key.startsWith(DRAFT_PREFIX)).map((key) => {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) as DraftData : null;
      }).filter((draft): draft is DraftData => draft !== null).sort((left, right) => right.savedAt - left.savedAt)[0] ?? null;
    } catch { return null; }
  },
};
