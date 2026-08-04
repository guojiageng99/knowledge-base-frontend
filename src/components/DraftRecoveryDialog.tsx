import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import type { DraftData } from '@/utils/draft-storage';

interface Props { open: boolean; draft: DraftData | null; onAccept: () => void; onDismiss: () => void; }

export default function DraftRecoveryDialog({ open, draft, onAccept, onDismiss }: Props) {
  if (!draft) return null;
  const preview = draft.content.slice(0, 120) || 'No content';
  return <Modal open={open} title={<><ExclamationCircleOutlined style={{ color: '#d97706', marginRight: 8 }} />Recover unsaved draft?</>}
    onCancel={onDismiss} footer={<><Button danger onClick={onDismiss}>Discard</Button><Button type="primary" onClick={onAccept}>Recover</Button></>}>
    <p>This draft was saved locally at {new Date(draft.savedAt).toLocaleString()}.</p>
    <p><strong>{draft.title || 'Untitled document'}</strong></p>
    <p>{preview}{draft.content.length > preview.length ? '...' : ''}</p>
  </Modal>;
}
