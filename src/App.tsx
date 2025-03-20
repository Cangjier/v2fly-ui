import { useState } from 'react'
import { Layout, Menu } from 'antd';
import Subscribers from './components/Subscribers';
import ProxyConfig from './components/ProxyConfig';

const { Header, Sider, Content } = Layout;

function App() {
  const [selectedKey, setSelectedKey] = useState('subscribers');

  const renderContent = () => {
    switch (selectedKey) {
      case 'subscribers':
        return <Subscribers />;
      case 'proxyConfig':
        return <ProxyConfig />;
      default:
        return <Subscribers />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['subscribers']}
          onSelect={({ key }) => setSelectedKey(key)}
        >
          <Menu.Item key="subscribers">订阅者管理</Menu.Item>
          <Menu.Item key="proxyConfig">代理配置</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: '16px', overflowY: 'auto' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
