import { useCallback, useEffect, useRef, useState } from 'react';
import { documentService } from '@/services/document.service';
import { draftStorage, type DraftData } from '@/utils/draft-storage';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'unsaved';
export interface AutoSaveFormData { title: string; content: string; summary: string; categoryId?: number; isPublic: number; saveOption: 'submit_review' | 'draft'; }

interface Options { documentId?: number; formData: AutoSaveFormData; enabled?: boolean; interval?: number; onDocumentCreated?: (id: number) => void; }

export function useAutoSave({ documentId, formData, enabled = true, interval = 30_000, onDocumentCreated }: Options) {
  const [currentDocumentId, setCurrentDocumentId] = useState<number | undefined>(documentId);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [recoveryDraft, setRecoveryDraft] = useState<DraftData | null>(null);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const formRef = useRef(formData);
  const documentIdRef = useRef<number | undefined>(documentId);
  const changedRef = useRef(false);
  const savingRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    formRef.current = formData;
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    changedRef.current = true;
    setSaveStatus('unsaved');
  }, [formData]);
  useEffect(() => {
    if (!enabled) return;
    const draft = draftStorage.load(documentId) ?? (!documentId ? draftStorage.findLatest() : null);
    if (draft) { setRecoveryDraft(draft); setRecoveryOpen(true); }
  }, [documentId, enabled]);

  const save = useCallback(async () => {
    if (!enabled || savingRef.current || !changedRef.current) return;
    savingRef.current = true; setSaveStatus('saving');
    const data = formRef.current;
    try {
      const id = await documentService.autoSaveDocument({ id: documentIdRef.current, title: data.title || undefined, content: data.content, summary: data.summary, categoryId: data.categoryId });
      if (!documentIdRef.current) { documentIdRef.current = id; setCurrentDocumentId(id); onDocumentCreated?.(id); }
      const draft = { ...data, documentId: String(id) };
      draftStorage.save(id, draft); draftStorage.save(undefined, draft);
      changedRef.current = false; setLastSavedAt(new Date()); setSaveStatus('saved');
    } catch {
      draftStorage.save(documentIdRef.current, { ...data, documentId: documentIdRef.current ? String(documentIdRef.current) : undefined });
      setSaveStatus('error');
    } finally { savingRef.current = false; }
  }, [enabled, onDocumentCreated]);

  useEffect(() => { if (!enabled) return; const timer = window.setInterval(() => void save(), interval); return () => window.clearInterval(timer); }, [enabled, interval, save]);
  useEffect(() => {
    const beforeUnload = () => { if (changedRef.current) draftStorage.save(documentIdRef.current, { ...formRef.current, documentId: documentIdRef.current ? String(documentIdRef.current) : undefined }); };
    window.addEventListener('beforeunload', beforeUnload); return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);

  const acceptRecovery = () => { setRecoveryOpen(false); if (recoveryDraft?.documentId) { const id = Number(recoveryDraft.documentId); documentIdRef.current = id; setCurrentDocumentId(id); } return recoveryDraft; };
  const dismissRecovery = () => { setRecoveryOpen(false); setRecoveryDraft(null); draftStorage.removeAll(); void documentService.dismissAutoSaveDrafts(); };
  const clearDraft = () => { draftStorage.remove(documentIdRef.current); draftStorage.remove(); changedRef.current = false; setSaveStatus('idle'); };
  return { saveStatus, lastSavedAt, currentDocumentId, recoveryDraft, recoveryOpen, acceptRecovery, dismissRecovery, clearDraft, saveNow: save };
}
