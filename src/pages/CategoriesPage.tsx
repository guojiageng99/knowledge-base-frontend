import { DeleteOutlined, EditOutlined, FolderAddOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, InputNumber, Layout, Modal, Popconfirm, Select, Space, Tree, Typography, message } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService, type CategoryForm } from '@/services/category.service';
import type { CategoryTree } from '@/types';

function flatten(nodes: CategoryTree[]): CategoryTree[] { return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]); }
function toTreeData(nodes: CategoryTree[]): DataNode[] { return nodes.map((node) => ({ key: String(node.id), title: node.name, children: toTreeData(node.children ?? []) })); }

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [selectedId, setSelectedId] = useState<number>();
  const [editing, setEditing] = useState<CategoryTree>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<CategoryForm>();
  const all = useMemo(() => flatten(categories), [categories]);
  const selected = all.find((item) => item.id === selectedId);

  const load = async () => setCategories(await categoryService.getTree());
  useEffect(() => { void load(); }, []);
  const openForm = (parentId?: number, category?: CategoryTree) => { setEditing(category); form.setFieldsValue(category ? { ...category, sortOrder: category.sortOrder } : { parentId, status: 1, sortOrder: 0 }); setModalOpen(true); };
  const save = async () => { const values = await form.validateFields(); if (editing) await categoryService.update({ ...values, id: editing.id }); else await categoryService.create(values); setModalOpen(false); form.resetFields(); await load(); message.success('Category saved'); };
  const remove = async (id: number) => { await categoryService.remove(id); setSelectedId(undefined); await load(); message.success('Category deleted'); };

  return <Layout className="workspace-layout"><header className="workspace-header"><Typography.Title level={4}>Knowledge Base</Typography.Title><Button onClick={() => navigate('/')}>Back to dashboard</Button></header><main className="workspace-main"><div className="page-title-row"><div><Typography.Title level={3}>Categories</Typography.Title><Typography.Text type="secondary">Manage the document category tree</Typography.Text></div><Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>New category</Button></div><div className="management-grid"><Card title="Category tree" extra={<Button icon={<FolderAddOutlined />} disabled={!selected} onClick={() => openForm(selected?.id)}>Add child</Button>}><Tree treeData={toTreeData(categories)} defaultExpandAll selectedKeys={selectedId ? [String(selectedId)] : []} onSelect={(keys) => setSelectedId(Number(keys[0]))} /></Card><Card title="Category details">{selected ? <Space direction="vertical" size="middle" className="full-width"><Typography.Title level={4}>{selected.name}</Typography.Title><Typography.Text>Code: {selected.code || '-'}</Typography.Text><Typography.Text>Status: {selected.status === 1 ? 'Enabled' : 'Disabled'}</Typography.Text><Typography.Text>Description: {selected.description || '-'}</Typography.Text><Space><Button icon={<EditOutlined />} onClick={() => openForm(selected.parentId, selected)}>Edit</Button><Popconfirm title="Delete this category?" onConfirm={() => void remove(selected.id)}><Button danger icon={<DeleteOutlined />}>Delete</Button></Popconfirm></Space></Space> : <Typography.Text type="secondary">Select a category to view details.</Typography.Text>}</Card></div></main><Modal title={editing ? 'Edit category' : 'New category'} open={modalOpen} onOk={() => void save()} onCancel={() => setModalOpen(false)}><Form form={form} layout="vertical"><Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="Code" name="code"><Input /></Form.Item><Form.Item label="Description" name="description"><Input.TextArea rows={3} /></Form.Item><Form.Item label="Sort" name="sortOrder"><InputNumber min={0} /></Form.Item><Form.Item label="Status" name="status"><Select options={[{ value: 1, label: 'Enabled' }, { value: 0, label: 'Disabled' }]} /></Form.Item><Form.Item label="Remark" name="remark"><Input.TextArea rows={2} /></Form.Item></Form></Modal></Layout>;
}
