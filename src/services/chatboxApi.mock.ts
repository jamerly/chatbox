// src/services/chatboxApi.mock.ts

import type { Message } from '../messageProcessor';

// Mock implementation of fetchWelcomeMessage
export const fetchWelcomeMessage = async (url: string, appId: string, userToken: string | undefined, language: string): Promise<string> => {
  console.log('Mock API: fetchWelcomeMessage called with:', { url, appId, userToken, language });
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return "Welcome to the Mock ChatBox! How can I help you today?";
};

// Mock implementation of queryChat
export const queryChat = async (url: string, appId: string, userToken: string | undefined, language: string): Promise<any> => {
  console.log('Mock API: queryChat called with:', { url, appId, userToken, language });
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { userMessage: "Hello", aiResponse: "Hi there! This is a mock response." },
    { userMessage: "What can you do?", aiResponse: "I can simulate conversations for development purposes." }
  ];
};

// Mock implementation of sendMessage
export const sendMessage = async (url: string, appId: string, userToken: string | undefined, language: string, message: string, chatId?: string, onChunk?: (chunk: string) => void): Promise<void> => {
  console.log('Mock API: sendMessage called with:', { url, appId, userToken, language, message, chatId });
  const mockResponse: Message = { type: 'response', content: `Mock response to: "${message}"` };
  
  // Simulate streaming response
  const chunks = JSON.stringify(mockResponse).split('');
  for (let i = 0; i < chunks.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate chunk delay
    onChunk?.(chunks[i]);
  }
};

// Mock implementation of uploadFile
export const uploadFile = async (url: string, appId: string, userToken: string | undefined, file: File): Promise<any> => {
  console.log('Mock API: uploadFile called with:', { url, appId, userToken, file });
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: "File uploaded successfully (mock).", data: { fileId: `mock-${Date.now()}`, name: file.name } };
};

// Mock implementation of deleteFile
export const deleteFile = async (url: string, appId: string, userToken: string | undefined, fileId: string): Promise<any> => {
  console.log('Mock API: deleteFile called with:', { url, appId, userToken, fileId });
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: "File deleted successfully (mock)." };
};

// Mock implementation of listFiles
export const listFiles = async (url: string, appId: string, userToken: string | undefined): Promise<any> => {
  console.log('Mock API: listFiles called with:', { url, appId, userToken });
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true,
    message: "Files listed successfully (mock).",
    data: [
      { fileId: 'mock-1', name: 'mock-document-1.pdf' },
      { fileId: 'mock-2', name: 'mock-image.png' }
    ]
  };
};
