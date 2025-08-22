import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { fetchWelcomeMessage } from './services/chatboxApi';

declare global {
  interface Window {
    ChatBoxSDK: {
      init: (options?: { serverUrl?: string, target?: HTMLElement, defaultWidth?: string, defaultHeight?: string, appId?: string }) => void;
    };
  }
}

const ChatBoxSDK = {
  init: async (options?: { serverUrl?: string, target?: HTMLElement, defaultWidth?: string, defaultHeight?: string, appId?: string }) => {
    const serverUrl = options?.serverUrl || 'https://api.example.com';
    const appId = options?.appId;
    console.log('appId', appId);

    if (!appId) {
      console.error('App ID is required for ChatBoxSDK initialization.');
      return;
    }

    let welcomeMessage: string = '';
    try {
      welcomeMessage = await fetchWelcomeMessage(serverUrl,appId, navigator.language || "en-US");
    } catch (error) {
      console.error('Failed to fetch welcome message:', error);
      return;
    }

    let container = options?.target;

    if (!container) {
      container = document.createElement('div');
      container.className = 'terminal-container';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.width = options?.defaultWidth || '400px';
      container.style.height = options?.defaultHeight || '600px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }

    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App 
          welcomeMessage={welcomeMessage}
          serverUrl={serverUrl}
          appId={appId}
          language={navigator.language || "en-US"}
          onHeaderRendered={(headerElement) => makeDraggable(container, headerElement)}
          onMinimize={(minimized)=>{
            console.log('Minimized:', minimized);
            if( minimized ){
              container.classList.add('minimized');
            }else{
              container.classList.remove('minimized');
            }
          }}
        />
      </React.StrictMode>
    );
  },
};

function makeDraggable(element: HTMLElement, handle: HTMLElement) {
  if (!handle) {
    return;
  }
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  handle.onmousedown = dragMouseDown;
  // handle.style.cursor = 'grab'; // Set initial cursor for dragging

  let isResizing = false;
  let currentResizer: string | null = null;

  element.addEventListener('mousedown', function(e) {
    const rect = element.getBoundingClientRect();
    const resizeHandleSize = 10; // pixels

    if (e.clientX < rect.left + resizeHandleSize && e.clientY < rect.top + resizeHandleSize) {
      isResizing = true;
      currentResizer = 'top-left';
    } else if (e.clientX > rect.right - resizeHandleSize && e.clientY > rect.bottom - resizeHandleSize) {
      isResizing = true;
      currentResizer = 'bottom-right';
    } else if (e.clientX < rect.left + resizeHandleSize) {
      isResizing = true;
      currentResizer = 'left';
    } else if (e.clientX > rect.right - resizeHandleSize) {
      isResizing = true;
      currentResizer = 'right';
    } else if (e.clientY < rect.top + resizeHandleSize) {
      isResizing = true;
      currentResizer = 'top';
    } else if (e.clientY > rect.bottom - resizeHandleSize) {
      isResizing = true;
      currentResizer = 'bottom';
    }

    if (isResizing) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragOrResizeElement;
      document.onmousemove = elementResize;
    }
  });

  element.addEventListener('mousemove', function(e) {
    const rect = element.getBoundingClientRect();
    const resizeHandleSize = 10; // pixels

    if (isResizing) {
      // Do nothing, resizing takes precedence
      return;
    }

    if (e.clientX < rect.left + resizeHandleSize && e.clientY < rect.top + resizeHandleSize) {
      element.style.cursor = 'nwse-resize';
    } else if (e.clientX > rect.right - resizeHandleSize && e.clientY > rect.bottom - resizeHandleSize) {
      element.style.cursor = 'nwse-resize';
    } else if (e.clientX < rect.left + resizeHandleSize || e.clientX > rect.right - resizeHandleSize) {
      element.style.cursor = 'ew-resize';
    } else if (e.clientY < rect.top + resizeHandleSize || e.clientY > rect.bottom - resizeHandleSize) {
      element.style.cursor = 'ns-resize';
    } else {
      element.style.cursor = 'default';
    }
  });

  function dragMouseDown(e: MouseEvent) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragOrResizeElement;
    document.onmousemove = elementDrag;
    handle.style.cursor = 'grabbing';
  }

  function elementDrag(e: MouseEvent) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function elementResize(e: MouseEvent) {
    e = e || window.event;
    e.preventDefault();

    const dx = e.clientX - pos3;
    const dy = e.clientY - pos4;
    pos3 = e.clientX;
    pos4 = e.clientY;

    if (currentResizer === 'bottom-right') {
      element.style.width = (element.offsetWidth + dx) + 'px';
      element.style.height = (element.offsetHeight + dy) + 'px';
    } else if (currentResizer === 'bottom') {
      element.style.height = (element.offsetHeight + dy) + 'px';
    } else if (currentResizer === 'right') {
      element.style.width = (element.offsetWidth + dx) + 'px';
    } else if (currentResizer === 'top-left') {
      element.style.width = (element.offsetWidth - dx) + 'px';
      element.style.left = (element.offsetLeft + dx) + 'px';
      element.style.height = (element.offsetHeight - dy) + 'px';
      element.style.top = (element.offsetTop + dy) + 'px';
    } else if (currentResizer === 'left') {
      element.style.width = (element.offsetWidth - dx) + 'px';
      element.style.left = (element.offsetLeft + dx) + 'px';
    } else if (currentResizer === 'top') {
      element.style.height = (element.offsetHeight - dy) + 'px';
      element.style.top = (element.offsetTop + dy) + 'px';
    }
  }

  function closeDragOrResizeElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    isResizing = false;
    currentResizer = null;
    element.style.cursor = 'default';
    handle.style.cursor = 'default';
  }
}

window.ChatBoxSDK = ChatBoxSDK;

export default ChatBoxSDK;
