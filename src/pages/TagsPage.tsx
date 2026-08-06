import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { tagService, type TagForm } from '@/services/tag.service';
import type { TagItem } from '@/types';

export default function TagsPage() {
  const [rows, setRows] = useState<TagItem[]>([]); const [total, setTotal] = useState(0); const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false); const [modalOpen, setModalOpen] = useState(false); const [editing, setEditing] = useState<TagItem>();
  const [form] = Form.useForm<TagForm>();
  const load = async () => { setLoading(true); try { const page = await tagService.page({ current: 1, size: 50, tagName: keyword || undefined }); setRows(page.records ?? []); setTotal(page.total ?? 0); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const openForm = (tag?: TagItem) => { setEditing(tag); form.resetFields(); if (tag) form.setFieldsValue({ ...tag, id: tag.id }); else form.setFieldsValue({ tagType: 1, status: 1 }); setModalOpen(true); };
  const save = async () => { const values = await form.validateFields(); if (editing) await tagService.update({ ...values, id: editing.id }); else await tagService.create(values); setModalOpen(false); await load(); message.success(editing ? '标签已更新' : '标签已创建'); };
  const remove = async (id: string) => { await tagService.remove(id); await load(); message.success('标签已删除'); };
  const columns: ColumnsType<TagItem> = [
    { title: '名称', dataIndex: 'tagName' }, { title: '编码', dataIndex: 'tagCode' }, { title: '分类', dataIndex: 'categoryName', render: (value) => value || '-' },
    { title: '文档数', dataIndex: 'docCount', render: (value) => value ?? 0 }, { title: '状态', dataIndex: 'status', render: (value) => <Tag color={value === 1 ? 'green' : 'default'}>{value === 1 ? '启用' : '停用'}</Tag> },
    { title: '操作', render: (_, tag) => <Space><Button type="text" icon={<EditOutlined />} aria-label="编辑标签" onClick={() => openForm(tag)} /><Popconfirm title="确定删除这个标签吗？" onConfirm={() => void remove(tag.id)}><Button type="text" danger icon={<DeleteOutlined />} aria-label="删除标签" /></Popconfirm></Space> },
  ];
  return <AppShell index="03 / 标签" title="标签" description="用轻量标签补充分类目录，帮助文档快速筛选和归档。" actions={<Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>新建标签</Button>}>
    <section className="panel-surface"><Space style={{ marginBottom: 16 }}><Input value={keyword} onChange={(e) => setKeyword(e.target.value)} onPressEnter={() => void load()} placeholder="搜索标签名称" prefix={<SearchOutlined />} allowClear /><Button type="primary" icon={<SearchOutlined />} onClick={() => void load()}>查询</Button><Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); void load(); }}>刷新</Button></Space><Table rowKey="id" loading={loading} columns={columns} dataSource={rows} pagination={{ total, pageSize: 50 }} /></section>
    <Modal title={editing ? '编辑标签' : '新建标签'} open={modalOpen} onOk={() => void save()} onCancel={() => setModalOpen(false)} okText="保存" cancelText="取消"><Form form={form} layout="vertical"><Form.Item label="名称" name="tagName" rules={[{ required: true, message: '请输入标签名称' }]}><Input /></Form.Item><Form.Item label="编码" name="tagCode"><Input /></Form.Item><Form.Item label="分类 ID" name="categoryId"><Input /></Form.Item><Form.Item label="类型" name="tagType"><InputNumber min={1} className="full-width" /></Form.Item><Form.Item label="颜色" name="color"><Input placeholder="#1677ff" /></Form.Item><Form.Item label="状态" name="status"><Select options={[{ value: 1, label: '启用' }, { value: 0, label: '停用' }]} /></Form.Item></Form></Modal>
  </AppShell>;
}
