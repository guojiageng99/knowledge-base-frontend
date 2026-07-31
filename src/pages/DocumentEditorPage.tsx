import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Form, Input, Layout, message, Select, Space, Spin, Switch, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocumentStore } from '@/stores';
import type { DocumentForm } from '@/types';

const { TextArea } = Input;

export default function DocumentEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const documentId = id ? Number(id) : undefined;
  const [form] = Form.useForm<DocumentForm>();
  const { currentDocument, isLoading, fetchDocument, createDocument, updateDocument } = useDocumentStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (documentId) void fetchDocument(documentId);
  }, [documentId, fetchDocument]);

  useEffect(() => {
    if (documentId && currentDocument?.id === documentId) {
      form.setFieldsValue(currentDocument);
    }
  }, [currentDocument, documentId, form]);

  const save = async (status: number) => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (documentId) await updateDocument(documentId, { ...values, status });
      else await createDocument({ ...values, status });
      message.success(documentId ? '文档已更新' : '文档已创建');
      navigate('/documents');
    } finally {
      setSaving(false);
    }
  };

  return <Layout className="workspace-layout">
    <header className="workspace-header"><Typography.Title level={4}>知识库</Typography.Title><Button onClick={() => navigate('/documents')}>返回列表</Button></header>
    <main className="editor-main"><div className="page-title-row"><div><Typography.Title level={3}>{documentId ? '编辑文档' : '创建文档'}</Typography.Title><Typography.Text type="secondary">正文会存储至 MongoDB，元数据保存在 MySQL。</Typography.Text></div><Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/documents')}>返回</Button></div>
      <Spin spinning={isLoading || saving}><Form form={form} layout="vertical" initialValues={{ documentType: 1, source: 1, allowComment: 1, isTop: 0, isRecommend: 0 }}>
        <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入文档标题' }]}><Input size="large" placeholder="输入清晰的文档标题" /></Form.Item>
        <Form.Item label="摘要" name="summary"><TextArea rows={3} maxLength={500} showCount placeholder="一句话概述文档内容" /></Form.Item>
        <div className="form-grid"><Form.Item label="分类 ID" name="categoryId"><Input type="number" placeholder="可选" /></Form.Item><Form.Item label="标签" name="tags"><Input placeholder="使用逗号分隔" /></Form.Item><Form.Item label="来源" name="source"><Select options={[{ value: 1, label: '原创' }, { value: 2, label: '转载' }]} /></Form.Item></div>
        <Form.Item label="正文" name="content"><TextArea className="document-content-input" rows={18} placeholder="支持 Markdown 文本" /></Form.Item>
        <div className="form-switches"><Form.Item label="允许评论" name="allowComment" valuePropName="checked" getValueFromEvent={(checked: boolean) => checked ? 1 : 0}><Switch /></Form.Item><Form.Item label="置顶" name="isTop" valuePropName="checked" getValueFromEvent={(checked: boolean) => checked ? 1 : 0}><Switch /></Form.Item><Form.Item label="推荐" name="isRecommend" valuePropName="checked" getValueFromEvent={(checked: boolean) => checked ? 1 : 0}><Switch /></Form.Item></div>
        <Space><Button icon={<SaveOutlined />} onClick={() => void save(0)}>保存草稿</Button><Button type="primary" icon={<SaveOutlined />} onClick={() => void save(1)}>发布文档</Button><Button onClick={() => navigate('/documents')}>取消</Button></Space>
      </Form></Spin>
    </main>
  </Layout>;
}
