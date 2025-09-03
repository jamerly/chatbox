import { type InitResponse, type Message, type ChatHistoryItem } from "./chatboxApi"

export { type InitResponse, type Message, type ChatHistoryItem };

const useMock = import.meta.env.MODE === 'mock';


const apiPromise = useMock ? import('./chatboxApi.mock') : import('./chatboxApi');

export const fetchWelcomeMessage = async (url:string, appId: string, userToken: string | undefined, language: string): Promise<InitResponse> => {
  const api = await apiPromise;
  return api.fetchWelcomeMessage(url, appId, userToken, language);
};

export const queryChat = async (url: string, appId: string, userToken: string | undefined, language: string): Promise<ChatHistoryItem[]> => {
  const api = await apiPromise;
  return api.queryChat(url, appId, userToken, language);
};

export const sendMessage = async (url: string, appId: string, userToken: string | undefined, language: string, message: string, chatId?: string, onChunk?: (chunk: string) => void): Promise<void> => {
  const api = await apiPromise;
  return api.sendMessage(url, appId, userToken, language, message, chatId, onChunk);
};



export const processMessage = async (command: string, url: string, appId: string, language: string, loadUserToken?: () => Promise<string>, chatId?: string, onChunk?: (chunk: Message) => void): Promise<void> => {
  const trimmedCommand = command.trim();

  if (trimmedCommand === '/clear') {
    onChunk?.({ "type": 'command', "content": 'clear' });
    return;
  }

  try {
    const userToken = await loadUserToken?.();
    let buffer = '';
    await sendMessage(url, appId, userToken, language, trimmedCommand, chatId, (chunkMsg: string) => {
      buffer += chunkMsg;
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last partial message in buffer

      for (const line of lines) {
        if (line.trim().startsWith('data:')) {
          const jsonStr = line.trim().substring(5).trim();
          if (jsonStr === '[DONE]') {
            return;
          }
          if (jsonStr) {
            try {
              const trunkJson = JSON.parse(jsonStr);
              if (trunkJson.chunk) {
                onChunk?.({ type: 'response', content: trunkJson.chunk });
              }
            } catch (e) {
              console.warn("Could not parse line: ", jsonStr);
            }
          }
        }
      }
    });
  } catch (error: any) {
    onChunk?.({ "type": "error", "content": `Error: ${error.message}` });
  }
};
