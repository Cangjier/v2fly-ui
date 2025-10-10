import React, { useEffect, useState } from 'react';
import { Table, Button, Input, message, Spin } from 'antd';
import { service, Subscription, PingResult } from '../service';
import { ColumnsType } from 'antd/es/table';
import { useModal } from '../utils';

interface TableData {
  key: string;
  url: string;
  isProtocol?: boolean;
  ping?: number;
  children?: TableData[];
}

const decodeUrl = (url: string) => {
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    return decodeURIComponent(url.substring(hashIndex + 1));
  }
  else if (url.startsWith("vmess://")) {
    let base64 = url.substring("vmess://".length);
    let json = JSON.parse(atob(base64));
    if (json.ps) {
      return json.ps;
    }
    else if (json.psn) {
      return json.psn;
    }
    else if (json.psv) {
      return json.psv;
    }
    else {
      return url;
    }
  }
  return url;
};

const Subscribers: React.FC = () => {
  const { showModal, modalContainer } = useModal();
  const [subscribers, setSubscribers] = useState<TableData[]>([]);
  const [newSubscriber, setNewSubscriber] = useState('');
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentProtocolUrl, setCurrentProtocolUrl] = useState<string | null>(null);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscriberByBase64Content = async (url: string) => {
    try {
      let base64ContentResult = '';
      let accept = await showModal(() => {
        const [base64Content, setBase64Content] = useState('');
        useEffect(() => {
          base64ContentResult = base64Content;
        }, [base64Content]);
        return <Input.TextArea rows={10} placeholder="请输入Base64内容" value={base64Content} onChange={(e) => setBase64Content(e.target.value)} />;
      }, {
        contentStyles: {
          padding: "40px 10px 10px 10px"
        }
      });
      if (accept) {
        await service.updateSubscriberByBase64Content(url, base64ContentResult);
      }
      message.success('更新订阅者成功');
    } catch (error) {
      message.error('更新订阅者失败');
    }
  };

  const handleRemoveSubscriber = async (url: string) => {
    try {
      await service.removeSubscribers([url]);
      message.success('删除订阅者成功');
    } catch (error) {
      message.error('删除订阅者失败');
    }
  };

  const handlePing = async (urls: string[]) => {
    setLoading(true);
    try {
      const pingResults = await service.ping(urls);
      const storedPingResults = JSON.parse(localStorage.getItem('pingResults') || '{}');
      pingResults.forEach(result => {
        storedPingResults[result.protocolUrl] = result.ping;
      });
      setSubscribers(prevSubscribers => prevSubscribers.map(sub => ({
        ...sub,
        ping: undefined,
        children: sub.children?.map(child => ({
          ...child,
          ping: storedPingResults[child.url] ?? undefined
        }))
      })));
      const now = new Date().toLocaleString();
      setLastPingTime(now);
      localStorage.setItem('pingResults', JSON.stringify(storedPingResults));
      localStorage.setItem('lastPingTime', now);
      message.success('Ping 成功');
    } catch (error) {
      message.error('Ping 失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchProtocol = async (protocolUrl: string) => {
    try {
      await service.switchToProtocolUrl(protocolUrl);
      setCurrentProtocolUrl(protocolUrl);
      message.success('切换协议地址成功');
    } catch (error) {
      message.error('切换协议地址失败');
    }
  };

  useEffect(() => {
    let func = async () => {
      await fetchSubscribers();
      const storedPingResults = localStorage.getItem('pingResults');
      const storedLastPingTime = localStorage.getItem('lastPingTime');
      if (storedPingResults) {
        const pingResults = JSON.parse(storedPingResults);
        setSubscribers(prevSubscribers => prevSubscribers.map(sub => ({
          ...sub,
          ping: undefined,
          children: sub.children?.map(child => ({
            ...child,
            ping: pingResults[child.url]
          }))
        })));
      }
      if (storedLastPingTime) {
        setLastPingTime(storedLastPingTime);
      }
      const currentProtocol = await service.getCurrentProtocolUrl();
      setCurrentProtocolUrl(currentProtocol);
    };
    func();
  }, []);

  const columns: ColumnsType<TableData> = [
    {
      title: 'URL',
      key: 'url',
      dataIndex: 'url',
      width: 600,
      render: (url: string, record: TableData) => (
        <div style={{
          fontWeight: currentProtocolUrl === record.url ? 'bold' : 'normal'
        }}>{decodeUrl(url)}</div>
      ),
    },
    {
      title: 'Ping',
      key: 'ping',
      dataIndex: 'ping',
      width: 100,
      render: (ping: number, record: TableData) => {
        if (record.isProtocol) {
          return ping !== undefined ? `${ping} ms` : '?'
        }
        return ''
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      render: (text: any, record: TableData) => (
        <>
          {record.isProtocol ? (
            <>
              <Button onClick={() => handlePing([record.url])} style={{ marginRight: 8 }}>Ping</Button>
              <Button onClick={() => handleSwitchProtocol(record.url)} style={{ marginRight: 8 }}>切换</Button>
            </>
          ) : (
            <>
              <Button onClick={() => handlePing(record.children?.map(child => child.url) || [])} style={{ marginRight: 8 }}>Ping</Button>
              <Button onClick={() => handleUpdateSubscriber(record.url)} style={{ marginRight: 8 }}>更新</Button>
              <Button onClick={() => handleUpdateSubscriberByBase64Content(record.url)} style={{ marginRight: 8 }}>Base64</Button>
              <Button onClick={() => handleRemoveSubscriber(record.url)} style={{ marginRight: 8 }}>删除</Button>
            </>
          )}
        </>
      ),
    },
    {
      title: '',
      key: 'spacer',
    },
  ];

  return (
    <div>
      {modalContainer}
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
      <Spin spinning={loading}>
        <Table
          dataSource={subscribers}
          columns={columns}
          style={{ marginTop: 16 }}
          expandable={{ defaultExpandAllRows: true }}
          scroll={{ x: 'max-content' }}
        />
      </Spin>
    </div>
  );
};

export default Subscribers;
