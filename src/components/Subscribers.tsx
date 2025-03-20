import React, { useEffect, useState } from 'react';
import { Table, Button, Input, message } from 'antd';
import { service, Subscription } from '../service';

const Subscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscription[]>([]);
  const [newSubscriber, setNewSubscriber] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const data = await service.getSubscribers();
      setSubscribers(data);
    } catch (error) {
      message.error('获取订阅者失败');
    }
  };

  const handleAddSubscriber = async () => {
    try {
      await service.addSubscribers([newSubscriber]);
      setNewSubscriber('');
      fetchSubscribers();
      message.success('添加订阅者成功');
    } catch (error) {
      message.error('添加订阅者失败');
    }
  };

  const handleRemoveSubscriber = async (url: string) => {
    try {
      await service.removeSubscribers([url]);
      fetchSubscribers();
      message.success('删除订阅者成功');
    } catch (error) {
      message.error('删除订阅者失败');
    }
  };

  const columns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: Subscription) => (
        <Button onClick={() => handleRemoveSubscriber(record.url)}>删除</Button>
      ),
    },
  ];

  return (
    <div>
      <Input
        value={newSubscriber}
        onChange={(e) => setNewSubscriber(e.target.value)}
        placeholder="输入新的订阅者 URL"
        style={{ width: 300, marginRight: 8 }}
      />
      <Button type="primary" onClick={handleAddSubscriber}>添加订阅者</Button>
      <Table dataSource={subscribers} columns={columns} rowKey="url" style={{ marginTop: 16 }} />
    </div>
  );
};

export default Subscribers;
