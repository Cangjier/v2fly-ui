import axios from 'axios';

export interface Subscription {
    url: string,
    protocolUrls: string[]
}

export interface PingResult {
    protocolUrl: string,
    ping: number
}

export interface VPNConfig {
    port: string
}

const apiClient = axios.create({
    baseURL: 'http://124.71.207.90:7898/api/v1',
    timeout: 10000,
});

const getSubscribers = async (): Promise<Subscription[]> => {
    const response = await apiClient.get('/get_subscribers');
    return response.data;
};

const addSubscribers = async (subscribers: string[]): Promise<void> => {
    await apiClient.post('/add_subscribers', subscribers);
};

const removeSubscribers = async (subscribers: string[]): Promise<void> => {
    await apiClient.post('/remove_subscribers', subscribers);
};

const updateSubscribers = async (subscribers: string[]): Promise<Subscription[]> => {
    const response = await apiClient.post('/update_subscribers', subscribers);
    return response.data;
};

const switchToProtocolUrl = async (protocolUrl: string): Promise<void> => {
    await apiClient.post('/switch_to_protocol_url', protocolUrl);
};

const ping = async (protocolUrls: string[]): Promise<PingResult[]> => {
    const response = await apiClient.post('/ping', protocolUrls);
    return response.data;
};

const switchToFastestProtocolUrl = async (): Promise<void> => {
    await apiClient.post('/switch_to_fastest_protocol_url');
};

const getCurrentProtocolUrl = async (): Promise<string> => {
    const response = await apiClient.get('/get_current_protocol_url');
    return response.data;
};

const getConfig = async (): Promise<VPNConfig> => {
    const response = await apiClient.get('/get_config');
    return response.data;
};

const setConfig = async (config: VPNConfig): Promise<void> => {
    await apiClient.post('/set_config', config);
};

const restart = async (): Promise<void> => {
    await apiClient.post('/restart');
};

export const service = {
    getSubscribers,
    addSubscribers,
    removeSubscribers,
    updateSubscribers,
    switchToProtocolUrl,
    ping,
    switchToFastestProtocolUrl,
    getCurrentProtocolUrl,
    getConfig,
    setConfig,
    restart
};