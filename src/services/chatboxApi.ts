// chatbox/src/services/chatboxApi.ts

// Minimal ServerResponse interface for this SDK
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  code: number | null;
  data: T;
}

// Minimal HttpService for this SDK
class HttpService {
  static async get<T = any>(url: string, headers: HeadersInit = {}): Promise<T> {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }
    const apiResponse: ApiResponse<T> = await response.json();
    if (apiResponse.success) {
      return apiResponse.data;
    } else {
      throw new Error(apiResponse.message || 'API error');
    }
  }

  static async post<T = any>(url: string, data: any, headers: HeadersInit = {}): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }
    const apiResponse: ApiResponse<T> = await response.json();
    if (apiResponse.success) {
      return apiResponse.data;
    } else {
      throw new Error(apiResponse.message || 'API error');
    }
  }
}

export const fetchWelcomeMessage = async (url:string, appId: string, language: string): Promise<string> => {
  const responseData = await HttpService.get<string>(`${url}/api/chatbases/init`, {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Id': appId,
    'X-Accept-Language': language,
  });

  let accumulatedResponse = '';
  const jsonStrings = responseData.replace("[DONE]","").split('}{').map((s, index, arr) => {
    if (index === 0) return s + '}';
    if (index === arr.length - 1) return '{' + s;
    return '{' + s + '}';
  });

  for (const jsonStr of jsonStrings) {
    try {
      if (jsonStr.trim() === '[DONE]') {
        break;
      }
      const parsed = JSON.parse(jsonStr);
      if (parsed.chunk) {
        accumulatedResponse += parsed.chunk;
      }
    } catch (e) {
      console.error('Error parsing welcome message chunk:', jsonStr, e);
    }
  }
  if( accumulatedResponse.startsWith("\"")){
    accumulatedResponse = accumulatedResponse.substring(1);
  }
  if( accumulatedResponse.endsWith("\"")){
    accumulatedResponse = accumulatedResponse.substring(0, accumulatedResponse.length - 1);
  }
  return accumulatedResponse;
};

export const sendMessage = async (url: string, appId: string, language: string, message: string, chatId?: string, onChunk?: (chunk: string) => void): Promise<void> => {
  const requestBody: { message: string; chatId?: string } = { message };
  if (chatId) {
    requestBody.chatId = chatId;
  }
  const response = await fetch(`${url}/api/chatbases/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Id': appId,
      'X-Accept-Language': language,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Network response was not ok');
  }

  const reader = response.body?.getReader();
  if( !reader ){
    throw new Error('Failed to get reader from response body');
  }
  const decoder = new TextDecoder();
  let done = false;
  while( !done ){
    const { value, done: readerDone } = await reader.read();
    if( readerDone ){
      done = true;
      continue;
    }
    const chunk = decoder.decode(value, { stream: true });
    onChunk?.(chunk);
  }
};