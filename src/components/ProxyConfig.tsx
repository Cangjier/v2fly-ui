import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { service, VPNConfig } from '../service';

const ProxyConfig: React.FC = () => {
  const [config, setConfig] = useState<VPNConfig>({ port: '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await service.getConfig();
      setConfig(data);
    } catch (error) {
      message.error('获取配置失败');
    }
  };

  const handleSaveConfig = async (values: VPNConfig) => {
    try {
      await service.setConfig(values);
      message.success('保存配置成功');
    } catch (error) {
      message.error('保存配置失败');
    }
  };

  return (
    <Form
      initialValues={config}
      onFinish={handleSaveConfig}
      layout="vertical"
      style={{ maxWidth: 400 }}
    >
      <Form.Item label="端口" name="port" rules={[{ required: true, message: '请输入端口' }]}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">保存配置</Button>
      </Form.Item>
    </Form>
  );
};

export default ProxyConfig;
