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

export interface WebMessage {
    success: boolean,
    data?: any,
    message: string
}

const apiClient = axios.create({
    baseURL: 'http://124.71.207.90:7898/api/v1',
    timeout: 10000,
});

const getSubscribers = async (): Promise<Subscription[]> => {
    const response = await apiClient.get('/get_subscribers');
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
    return result.data;
};

const addSubscribers = async (subscribers: string[]): Promise<void> => {
    const response = await apiClient.post('/add_subscribers', subscribers);
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
};

const removeSubscribers = async (subscribers: string[]): Promise<void> => {
    const response = await apiClient.post('/remove_subscribers', subscribers);
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
};

const updateSubscribers = async (subscribers: string[]): Promise<Subscription[]> => {
    const response = await apiClient.post('/update_subscribers', subscribers);
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
    return result.data;
};

const switchToProtocolUrl = async (protocolUrl: string): Promise<void> => {
    const response = await apiClient.post('/switch_to_protocol_url', protocolUrl);
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
};

const ping = async (protocolUrls: string[]): Promise<PingResult[]> => {
    const response = await apiClient.post('/ping', protocolUrls);
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
    return result.data;
};

const switchToFastestProtocolUrl = async (): Promise<void> => {
    const response = await apiClient.post('/switch_to_fastest_protocol_url');
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
};

const getCurrentProtocolUrl = async (): Promise<string> => {
    const response = await apiClient.get('/get_current_protocol_url');
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
    return result.data;
};

const getConfig = async (): Promise<VPNConfig> => {
    const response = await apiClient.get('/get_config');
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
    return result.data;
};

const setConfig = async (config: VPNConfig): Promise<void> => {
    const response = await apiClient.post('/set_config', config);
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
};

const restart = async (): Promise<void> => {
    const response = await apiClient.post('/restart');
    const result: WebMessage = response.data;
    if (!result.success) throw new Error(result.message);
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