// chatbox/src/services/chatboxApi.ts

// Minimal ServerResponse interface for this SDK
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  code: number | null;
  data: T;
}

interface InitResponse {
  sessionId: string;
  message: string;
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

export const fetchWelcomeMessage = async (url:string, appId: string, userToken: string | undefined, language: string): Promise<string> => {
  let sessionId = localStorage.getItem("chatbox_session_id");
  const responseData = await HttpService.get<InitResponse>(`${url}/api/chatbases/client/init`, {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Id': appId,
    'X-Accept-Language': language,
    'X-Session-Id': sessionId || '',
    'Authorization': `Bearer ${userToken}`
  });

  if( responseData.sessionId ){
    localStorage.setItem("chatbox_session_id", responseData.sessionId);
  }
  return responseData.message;
};

export const queryChat = async (url: string, appId: string, userToken: string | undefined, language: string): Promise<any> => {
  let sessionId = localStorage.getItem("chatbox_session_id");
  const responseData = await HttpService.get<{ answer: string }>(`${url}/api/chatbases/client/history`, {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Id': appId,
    'X-Accept-Language': language,
    'X-Session-Id': sessionId || '',
    'Authorization': `Bearer ${userToken}`
  });
  return responseData;
};

export const sendMessage = async (url: string, appId: string, userToken: string | undefined, language: string, message: string, chatId?: string, onChunk?: (chunk: string) => void): Promise<void> => {
  const requestBody: { message: string; chatId?: string } = { message };
  if (chatId) {
    requestBody.chatId = chatId;
  }
  let sessionId = localStorage.getItem("chatbox_session_id")
  if( sessionId ==null ){
    console.warn("No session ID found");
    onChunk?.(JSON.stringify({ type: 'error', content: 'No session lost, please refresh the page.' }));
    return
  }
  const response = await fetch(`${url}/api/chatbases/client/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Id': appId,
      'X-Accept-Language': language,
      'X-Session-Id': sessionId || '',
      'Authorization': `Bearer ${userToken}`
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