import React, { useEffect, useState } from 'react';
import { Table, Button, Input, message } from 'antd';
import { service, Subscription, PingResult } from '../service';

interface TableData {
  key: string;
  url: string;
  isProtocol?: boolean;
  ping?: number;
  children?: TableData[];
}

const Subscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<TableData[]>([]);
  const [newSubscriber, setNewSubscriber] = useState('');
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    try {
      const data = await service.getSubscribers();
      console.log(data);
      const tableData = data?.map((sub, index) => ({
        key: `${index}`,
        url: sub.url,
        children: sub.protocolUrls.map((url, idx) => ({ key: `${index}-${idx}`, url, isProtocol: true })),
      })) ?? [];
      setSubscribers(tableData);
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

  const handleRemoveProtocolUrl = async (protocolUrl: string) => {
    try {
      await service.removeSubscribers([protocolUrl]);
      fetchSubscribers();
      message.success('删除协议地址成功');
    } catch (error) {
      message.error('删除协议地址失败');
    }
  };

  const handleUpdateSubscriber = async (url: string) => {
    try {
      const updatedSubscribers = await service.updateSubscribers([url]);
      const updatedTableData = updatedSubscribers.map((sub, index) => ({
        key: `${index}`,
        url: sub.url,
        children: sub.protocolUrls.map((url, idx) => ({ key: `${index}-${idx}`, url, isProtocol: true })),
      }));
      setSubscribers((prevSubscribers) => {
        const updatedMap = new Map(updatedTableData.map(item => [item.url, item]));
        return prevSubscribers.map(item => updatedMap.get(item.url) || item);
      });
      message.success('更新订阅者成功');
    } catch (error) {
      message.error('更新订阅者失败');
    }
  };

  const handlePing = async (urls: string[]) => {
    try {
      const pingResults = await service.ping(urls);
      const pingMap = new Map(pingResults.map(result => [result.protocolUrl, result.ping]));
      setSubscribers(prevSubscribers => prevSubscribers.map(sub => ({
        ...sub,
        ping: pingMap.get(sub.url),
        children: sub.children?.map(child => ({
          ...child,
          ping: pingMap.get(child.url)
        }))
      })));
      const now = new Date().toLocaleString();
      setLastPingTime(now);
      localStorage.setItem('pingResults', JSON.stringify(pingResults));
      localStorage.setItem('lastPingTime', now);
      message.success('Ping 成功');
    } catch (error) {
      message.error('Ping 失败');
    }
  };

  useEffect(() => {
    fetchSubscribers();
    const storedPingResults = localStorage.getItem('pingResults');
    const storedLastPingTime = localStorage.getItem('lastPingTime');
    if (storedPingResults) {
      const pingResults: PingResult[] = JSON.parse(storedPingResults);
      const pingMap = new Map(pingResults.map(result => [result.protocolUrl, result.ping]));
      setSubscribers(prevSubscribers => prevSubscribers.map(sub => ({
        ...sub,
        ping: pingMap.get(sub.url),
        children: sub.children?.map(child => ({
          ...child,
          ping: pingMap.get(child.url)
        }))
      })));
    }
    if (storedLastPingTime) {
      setLastPingTime(storedLastPingTime);
    }
  }, []);

  const columns = [
    {
      title: 'URL',
      key: 'url',
      dataIndex: 'url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: 'Ping',
      key: 'ping',
      dataIndex: 'ping',
      render: (ping: number) => (ping !== undefined ? `${ping} ms` : '未 Ping'),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: TableData) => (
        <>
          {record.isProtocol ? (
            <Button onClick={() => handlePing([record.url])} style={{ marginRight: 8 }}>Ping</Button>
          ) : (
            <>
              <Button onClick={() => handleUpdateSubscriber(record.url)} style={{ marginRight: 8 }}>更新</Button>
              <Button onClick={() => handlePing(record.children?.map(child => child.url) || [])}>Ping</Button>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
      }}>
        <Input
          value={newSubscriber}
          onChange={(e) => setNewSubscriber(e.target.value)}
          placeholder="输入新的订阅者 URL"
          style={{ width: 300, marginRight: 8 }}
        />
        <Button type="primary" onClick={handleAddSubscriber}>添加订阅者</Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        {lastPingTime ? `上次 Ping 时间: ${lastPingTime}` : '还没有 Ping 过哦'}
      </div>
      <Table
        dataSource={subscribers}
        columns={columns}
        style={{ marginTop: 16 }}
        expandable={{
          expandedRowRender: record => (
            <Table
              dataSource={record.children}
              columns={columns}
              pagination={false}
            />
          ),
        }}
      />
    </div>
  );
};

export default Subscribers;
