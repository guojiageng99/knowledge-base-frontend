import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import type { SaveStatus } from '@/hooks/useAutoSave';

export default function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;
  const options = {
    saving: { text: 'Saving...', icon: <LoadingOutlined />, color: '#b45309' },
    saved: { text: 'Saved', icon: <CheckCircleOutlined />, color: '#15803d' },
    unsaved: { text: 'Unsaved changes', icon: null, color: '#64748b' },
    error: { text: 'Saved locally', icon: <ExclamationCircleOutlined />, color: '#b91c1c' },
  } as const;
  const option = options[status as keyof typeof options];
  return <Typography.Text style={{ color: option.color }}>{option.icon} {option.text}</Typography.Text>;
}
