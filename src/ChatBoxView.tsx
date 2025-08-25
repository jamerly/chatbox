import React, { useRef, useEffect } from 'react';
import './App.css'; // Keep App.css for now, will refactor later

interface ChatBoxViewProps {
  messages: Message[];
  inputValue: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => Promise<void>;
  isProcessing: boolean;
  alertMessage: string | null;
  onSendMessage: () => void;
}

// Re-declare Message type here or import from messageProcessor if needed
// In a real app, you'd import it: import { Message } from './messageProcessor';
type Message = {
  type: 'info' | 'command' | 'response' | 'error' | 'warn';
  content: string;
};


const ChatBoxView: React.FC<ChatBoxViewProps> = ({
  messages,
  inputValue,
  handleInputChange,
  handleKeyDown,
  isProcessing,
  alertMessage,
  onSendMessage,
}) => {
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <> {/* Use a fragment as the container class is applied in App.tsx */}
      <div className="chatbox-body" ref={chatBodyRef}> {/* Re-using terminal-body class for scrollable area */}
        {messages.map((msg, index) => (
          <p key={index} className={msg.type === 'warn' ? 'message-warn-special' : msg.type}>
            {msg.content}
          </p>
        ))}
        {alertMessage && <p className="message-warn-special">{alertMessage}</p>}
      </div>
      <div className="chatbox-footer"> {/* Re-using terminal-input-line class for input area */}
        
        <div className='chatbox-input'>
          <textarea
            className="chatbox-input-inline"
            autoFocus
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder="Type a message..."
            rows={3}
          ></textarea>
          <button onClick={onSendMessage} disabled={isProcessing} className="send-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div className='chatbox-input-tips'>
          Powered by TieIn.ai
        </div>
      </div>
    </>
  );
};

export default ChatBoxView;
