const useMock = import.meta.env.MODE === 'mock';

const api = useMock ? await import('./chatboxApi.mock') : await import('./chatboxApi');

export const {
  fetchWelcomeMessage,
  queryChat,
  sendMessage
} = api;
