import React from 'react';
import ReactDOM from 'react-dom/client';
import './chatbox.css';
import ChatBoxView from './ChatBoxView';
import ChatBoxFloating from './ChatBoxFloating';

declare global {
  interface Window {
    ChatBoxSDK: {
      init: (options?: { 
        serverUrl?: string, 
        target?: HTMLElement, 
        // zIndex?: string,
        // closable?: boolean,
        loadUserToken?: () => Promise<string>,
        onUserAction?:((e: any ) => void) | undefined;
        appId?: string 
        }) => void;
    };
  }
}

const ChatBoxSDK = {
  init: async (options?: { 
    serverUrl?: string, 
    target?: HTMLElement, 
    // zIndex?: string,
    // closable?: boolean,
    loadUserToken?: () => Promise<string>,
    onUserAction?:((e: any ) => void) | undefined;
    appId?: string 
  }) => {
    const appId = options?.appId;
    const loadUserToken = options?.loadUserToken;
    const serverUrl = options?.serverUrl;
    const onUserAction = options?.onUserAction;
    // const closable = options?.closable ?? true;
    let destroyed = false;
    if (!appId) {
      console.error('App ID is required for ChatBoxSDK initialization.');
      return;
    }

    // let agentName: string | undefined;

    let container = options?.target;
    let isFloating = false;

    if (!container) {
      container = document.createElement('div');
      document.body.appendChild(container);
      isFloating = true;
    }

    const root = ReactDOM.createRoot(container);
    root.render(<>{ !destroyed &&
      <React.StrictMode>
        { isFloating ? <ChatBoxFloating
          serverUrl={serverUrl}
          appId={appId}
          onUserAction={onUserAction}
          loadUserToken={loadUserToken}
        /> : <ChatBoxView
          serverUrl={serverUrl}
          appId={appId}
          onUserAction={onUserAction}
          loadUserToken={loadUserToken}
        />}
      </React.StrictMode>}</>
    );
  },
};



window.ChatBoxSDK = ChatBoxSDK;

export default ChatBoxSDK;
