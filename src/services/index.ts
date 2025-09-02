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
  }

  try {
    let userToken = await loadUserToken?.();
    await sendMessage(url, appId, userToken,language, trimmedCommand, chatId, (chunkMsg: string) =>{
      // Handle each chunk of the response here
      const chunkMsgs = chunkMsg.split("\n");
      for( var i = 0 ;i < chunkMsgs.length; i++ ){ 
        let chunkData = chunkMsgs[i].trim();
        if( chunkData.trim() !== "") {
          if( chunkData.startsWith("data:") ){
            chunkData = chunkData.substring(5);
          }
          if( chunkData.trim() === "" ){
            continue;
          }
          if( chunkData.trim() === "[DONE]" ){
            return;
          }else{

            try{
              const trunkJson = JSON.parse(chunkData);
              if( trunkJson["chunk"] ){
                onChunk?.({ "type": "response", "content": trunkJson["chunk"] });
              }
            }catch(e:any){
              onChunk?.({ "type": "error", "content": `Error: ${e.message}, server response:${chunkMsg}` });
            }
          }
        }
      }
    });
  } catch (error: any) {
    onChunk?.({"type":"error", "content":`Error: ${error.message}`});
  }
};