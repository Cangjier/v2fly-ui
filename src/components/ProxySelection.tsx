import React, { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import { service, PingResult } from '../service';

const ProxySelection: React.FC = () => {
  const [pingResults, setPingResults] = useState<PingResult[]>([]);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);

  useEffect(() => {
    const cachedPingResults = localStorage.getItem('pingResults');
    const cachedPingTime = localStorage.getItem('lastPingTime');
    if (cachedPingResults) {
      setPingResults(JSON.parse(cachedPingResults));
    }
    if (cachedPingTime) {
      setLastPingTime(cachedPingTime);
    }
  }, []);

  const fetchPingResults = async () => {
    try {
      const subscribers = await service.getSubscribers();
      const protocolUrls = subscribers.flatMap(sub => sub.protocolUrls);
      const data = await service.ping(protocolUrls);
      setPingResults(data);
      const currentTime = new Date().toLocaleString();
      setLastPingTime(currentTime);
      localStorage.setItem('pingResults', JSON.stringify(data));
      localStorage.setItem('lastPingTime', currentTime);
    } catch (error) {
      message.error('获取 Ping 结果失败');
    }
  };

  const handleSwitchToProtocol = async (protocolUrl: string) => {
    try {
      await service.switchToProtocolUrl(protocolUrl);
      message.success('切换代理成功');
    } catch (error) {
      message.error('切换代理失败');
    }
  };

  const columns = [
    {
      title: '协议 URL',
      dataIndex: 'protocolUrl',
      key: 'protocolUrl',
    },
    {
      title: 'Ping',
      dataIndex: 'ping',
      key: 'ping',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: PingResult) => (
        <Button onClick={() => handleSwitchToProtocol(record.protocolUrl)}>切换</Button>
      ),
    },
  ];

  return (
    <div>
      <Button onClick={fetchPingResults}>Ping</Button>
      {lastPingTime && <p>上次 Ping 时间: {lastPingTime}</p>}
      <Table dataSource={pingResults} columns={columns} rowKey="protocolUrl" />
    </div>
  );
};

export default ProxySelection;
