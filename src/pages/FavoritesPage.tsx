import { DeleteOutlined, EyeOutlined, ReloadOutlined, StarFilled } from '@ant-design/icons';
import { Button, Empty, Input, List, Popconfirm, Space, Spin, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoriteService } from '@/services/favorite.service';
import { useFavoriteStore } from '@/stores';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favoriteDocuments, isLoading, loadFavorites } = useFavoriteStore();
  const [keyword, setKeyword] = useState('');
  useEffect(() => { void loadFavorites(); }, [loadFavorites]);
  const filtered = useMemo(() => favoriteDocuments.filter((item) =>
    !keyword || `${item.documentTitle} ${item.documentSummary ?? ''}`.toLowerCase().includes(keyword.toLowerCase())), [favoriteDocuments, keyword]);

  const remove = async (documentId: number) => {
    await favoriteService.removeFavorite(documentId);
    await loadFavorites();
  };

  return <main className="detail-main">
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={2} style={{ margin: 0 }}><StarFilled /> My favorites</Typography.Title>
        <Button icon={<ReloadOutlined />} onClick={() => void loadFavorites()}>Refresh</Button>
      </Space>
      <Input.Search placeholder="Search favorites" allowClear onChange={(event) => setKeyword(event.target.value)} />
      {isLoading ? <Spin /> : filtered.length === 0 ? <Empty description="No favorites" /> : <List
        dataSource={filtered}
        renderItem={(item) => <List.Item actions={[
          <Button key="view" type="text" icon={<EyeOutlined />} onClick={() => navigate(`/documents/${item.documentId}`)} />,
          <Popconfirm key="remove" title="Remove this favorite?" onConfirm={() => void remove(item.documentId)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>,
        ]}>
          <List.Item.Meta title={<a onClick={() => navigate(`/documents/${item.documentId}`)}>{item.documentTitle}</a>} description={item.documentSummary} />
        </List.Item>}
      />}
    </Space>
  </main>;
}
