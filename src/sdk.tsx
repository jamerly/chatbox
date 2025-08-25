import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { fetchWelcomeMessage } from './services/chatboxApi';

declare global {
  interface Window {
    ChatBoxSDK: {
      init: (options?: { 
        serverUrl?: string, 
        target?: HTMLElement, 
        defaultWidth?: string, 
        defaultHeight?: string,
        closable?: boolean,
        loadUserToken?: () => Promise<string>,
        appId?: string 
        }) => void;
    };
  }
}

const ChatBoxSDK = {
  init: async (options?: { 
    serverUrl?: string, 
    target?: HTMLElement, 
    defaultWidth?: string, 
    defaultHeight?: string, 
    closable?: boolean,
    loadUserToken?: () => Promise<string>,
    appId?: string 
  }) => {
    const serverUrl = options?.serverUrl || 'https://api.tiein.ai';
    const appId = options?.appId;
    const loadUserToken = options?.loadUserToken;
    const closable = options?.closable ?? true;
    let destroyed = false;
    if (!appId) {
      console.error('App ID is required for ChatBoxSDK initialization.');
      return;
    }

    let welcomeMessage: string = '';
    try {
      let userToken = loadUserToken ? await loadUserToken() : undefined;
      welcomeMessage = await fetchWelcomeMessage(serverUrl, appId, userToken, navigator.language || "en-US");
    } catch (error) {
      console.error('Failed to initialize ChatBoxSDK:', error);
      return;
    }

    let container = options?.target;

    if (!container) {
      container = document.createElement('div');
      container.className = 'chatbox-container';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.width = options?.defaultWidth || '400px';
      container.style.height = options?.defaultHeight || '600px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }

    const root = ReactDOM.createRoot(container);
    root.render(<>{ !destroyed &&
      <React.StrictMode>
        <App 
          container={container}
          welcomeMessage={welcomeMessage}
          serverUrl={serverUrl}
          appId={appId}
          loadUserToken={loadUserToken}
          language={navigator.language || "en-US"}
          
          closable={closable}
          onDestroy={() => {
            destroyed = true;
            setTimeout(() => { 
              container.classList.add('minimized');
              setTimeout(() => {
                root.unmount();
                document.body.removeChild(container);
              }, 500);
            }, 500);
          }}
        />
      </React.StrictMode>}</>
    );
  },
};



window.ChatBoxSDK = ChatBoxSDK;

export default ChatBoxSDK;
