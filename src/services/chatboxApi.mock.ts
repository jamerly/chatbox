import { type Message,type InitResponse } from './chatboxApi';

// Mock implementation of fetchWelcomeMessage
export const fetchWelcomeMessage = async (url: string, appId: string, userToken: string | undefined, language: string): Promise<InitResponse> => {
  console.log('Mock API: fetchWelcomeMessage called with:', { url, appId, userToken, language });
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return {"message": "Welcome to the Mock ChatBox! How can I help you today?" } as InitResponse;
};

// Mock implementation of queryChat
export const queryChat = async (url: string, appId: string, userToken: string | undefined, language: string): Promise<any> => {
  console.log('Mock API: queryChat called with:', { url, appId, userToken, language });
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { userMessage: "Hello", aiResponse: "Hi there! This is a mock response." },
    { userMessage: "What can you do?", aiResponse: "I can simulate conversations for development purposes." },
    { userMessage: "Show me a link", aiResponse: "Here's a link:\n ```USER_OPERATION\n{\"type\": \"link\", \"content\": \"Visit Google\", \"url\": \"https://www.google.com\"}\n```" },
    { userMessage: "Show me a button", aiResponse: "Here's a button:\n ```USER_OPERATION\n{\"type\": \"button\", \"content\": \"Click Me!\", \"action\": \"doSomething\"}\n```" },
    { userMessage: "Send a command", aiResponse: "Here's a command:\n ```USER_OPERATION\n{\"type\": \"command\", \"content\": \"Run /clear\", \"command\": \"/clear\"}\n```" }
  ];
};

// Mock implementation of sendMessage
export const sendMessage = async (url: string, appId: string, userToken: string | undefined, language: string, message: string, chatId?: string, onChunk?: (chunk: string) => void): Promise<void> => {
  console.log('Mock API: sendMessage called with:', { url, appId, userToken, language, message, chatId });
  const responseText = `Mock response to: "${message}"`;
  const words = responseText.split(' ');

  for (const word of words) {
    const chunk = {
      chunk: word + ' ',
    };
    const sseMessage = `data: ${JSON.stringify(chunk)}\n\n`;
    onChunk?.(sseMessage);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate chunk delay
  }
  onChunk?.('data: [DONE]\n\n');
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
