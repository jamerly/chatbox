const useMock = import.meta.env.MODE === 'mock';

const apiPromise = useMock ? import('./chatboxApi.mock') : import('./chatboxApi');

export const fetchWelcomeMessage = async (...args: any[]) => {
  const api = await apiPromise;
  return api.fetchWelcomeMessage(...args);
};

export const queryChat = async (...args: any[]) => {
  const api = await apiPromise;
  return api.queryChat(...args);
};

export const sendMessage = async (...args: any[]) => {
  const api = await apiPromise;
  return api.sendMessage(...args);
};