import { sendMessage } from './services/chatboxApi';

export type Message = {
  type: 'info' | 'command' | 'response' | 'error';
  content: string;
};

export const processMessage = async (command: string, url: string, appId: string, loadUserToken?: () => Promise<string>, language: string, chatId?: string, onChunk?: (chunk: Message) => void): Promise<void> => {
  const trimmedCommand = command.trim();

  if (trimmedCommand === '/clear') {
    onChunk?.({ "type": 'command', "content": 'clear' });
  }

  try {
    let userToken = await loadUserToken?.();
    await sendMessage(url, appId, userToken,language, trimmedCommand, chatId, chunkMsg =>{
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
              debugger
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