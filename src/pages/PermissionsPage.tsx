import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Layout, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { permissionService, type PermissionForm } from '@/services/permission.service';
import type { PermissionItem, PermissionType } from '@/types';

const typeLabels: Record<PermissionType, string> = { menu: 'Menu', button: 'Button', api: 'API' };
const typeColors: Record<PermissionType, string> = { menu: 'blue', button: 'gold', api: 'purple' };

function flatten(nodes: PermissionItem[]): PermissionItem[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
}

export default function PermissionsPage() {
  const navigate = useNavigate();
  const [tree, setTree] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PermissionItem>();
  const [form] = Form.useForm<PermissionForm>();
  const allPermissions = useMemo(() => flatten(tree), [tree]);

  const load = async () => {
    setLoading(true);
    try { setTree(await permissionService.tree()); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const openForm = (permission?: PermissionItem, parentId?: number) => {
    setEditing(permission);
    form.resetFields();
    form.setFieldsValue(permission ? { ...permission } : { type: 'menu', parentId: parentId ?? 0, status: 1, sortOrder: 0 });
    setModalOpen(true);
  };
  const save = async () => {
    const values = await form.validateFields();
    if (editing) await permissionService.update({ ...values, id: editing.id });
    else await permissionService.create(values);
    setModalOpen(false); await load(); message.success(editing ? 'Permission updated' : 'Permission created');
  };
  const remove = async (id: number) => { await permissionService.remove(id); await load(); message.success('Permission deleted'); };
  const columns: ColumnsType<PermissionItem> = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Code', dataIndex: 'code' },
    { title: 'Type', dataIndex: 'type', render: (type: PermissionType) => <Tag color={typeColors[type]}>{typeLabels[type]}</Tag> },
    { title: 'Route / API', render: (_, item) => item.type === 'api' ? item.apiUrl || '-' : item.menuUrl || '-' },
    { title: 'Method', dataIndex: 'method', render: (value) => value || '-' },
    { title: 'Status', dataIndex: 'status', render: (value) => <Tag color={value === 1 ? 'green' : 'red'}>{value === 1 ? 'Enabled' : 'Disabled'}</Tag> },
    { title: 'Actions', render: (_, item) => <Space><Button title="Add child permission" type="text" icon={<PlusOutlined />} onClick={() => openForm(undefined, item.id)} /><Button title="Edit permission" type="text" icon={<EditOutlined />} onClick={() => openForm(item)} /><Popconfirm title="Delete this permission?" onConfirm={() => void remove(item.id)}><Button title="Delete permission" type="text" danger icon={<DeleteOutlined />} /></Popconfirm></Space> },
  ];
  const type = Form.useWatch('type', form) ?? 'menu';

  return <Layout className="workspace-layout"><header className="workspace-header"><Typography.Title level={4}>Knowledge Base</Typography.Title><Button onClick={() => navigate('/')}>Back to dashboard</Button></header><main className="workspace-main"><div className="page-title-row"><div><Typography.Title level={3}>Permissions</Typography.Title><Typography.Text type="secondary">Manage menu, button, and API resources</Typography.Text></div><Space><Button icon={<ReloadOutlined />} onClick={() => void load()} /><Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>New permission</Button></Space></div><Table className="documents-table" rowKey="id" loading={loading} columns={columns} dataSource={tree} pagination={false} expandable={{ defaultExpandAllRows: true }} /></main><Modal title={editing ? 'Edit permission' : 'New permission'} open={modalOpen} onOk={() => void save()} onCancel={() => setModalOpen(false)}><Form form={form} layout="vertical"><Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="Code" name="code" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="Type" name="type" rules={[{ required: true }]}><Select options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))} /></Form.Item><Form.Item label="Parent" name="parentId"><Select options={[{ value: 0, label: 'Root permission' }, ...allPermissions.filter((item) => item.id !== editing?.id).map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))]} /></Form.Item>{type === 'api' ? <><Form.Item label="API URL" name="apiUrl"><Input placeholder="/api/example" /></Form.Item><Form.Item label="Method" name="method"><Select allowClear options={['GET', 'POST', 'PUT', 'DELETE', '*'].map((value) => ({ value, label: value }))} /></Form.Item></> : <Form.Item label="Menu URL" name="menuUrl"><Input placeholder="/example" /></Form.Item>}<Form.Item label="Icon" name="icon"><Input /></Form.Item><Form.Item label="Description" name="description"><Input.TextArea rows={2} /></Form.Item><Space size="large"><Form.Item label="Sort" name="sortOrder"><InputNumber min={0} /></Form.Item><Form.Item label="Status" name="status"><Select style={{ width: 120 }} options={[{ value: 1, label: 'Enabled' }, { value: 0, label: 'Disabled' }]} /></Form.Item></Space></Form></Modal></Layout>;
}
