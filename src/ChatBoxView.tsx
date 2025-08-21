import React, { useRef, useEffect } from 'react';
import './App.css'; // Keep App.css for now, will refactor later

interface ChatBoxViewProps {
  messages: Message[];
  inputValue: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => Promise<void>;
  isProcessing: boolean;
  currentStyle: 'terminal' | 'chatbox'; // Pass currentStyle for prompt logic
}

// Re-declare Message type here or import from messageProcessor if needed
// In a real app, you'd import it: import { Message } from './messageProcessor';
type Message = {
  type: 'info' | 'command' | 'response' | 'error';
  content: string;
};


const ChatBoxView: React.FC<ChatBoxViewProps> = ({
  messages,
  inputValue,
  handleInputChange,
  handleKeyDown,
  isProcessing,
  currentStyle,
}) => {
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <> {/* Use a fragment as the container class is applied in App.tsx */}
      <div className="terminal-body" ref={chatBodyRef}> {/* Re-using terminal-body class for scrollable area */}
        {messages.map((msg, index) => (
          <p key={index} className={msg.type}>
            {msg.content}
          </p>
        ))}
      </div>
      <div className="terminal-input-line"> {/* Re-using terminal-input-line class for input area */}
        <input
          type="text"
          className="terminal-input-inline"
          autoFocus
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          placeholder="Type a message..."
        />
      </div>
    </>
  );
};

export default ChatBoxView;
