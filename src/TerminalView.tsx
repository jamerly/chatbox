import React, { useRef, useEffect } from 'react';
import './App.css'; // Keep App.css for now, will refactor later

interface TerminalViewProps {
  messages: Message[];
  inputValue: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => Promise<void>;
  isProcessing: boolean;
  alertMessage: string | null; // New prop for alert messages
  currentStyle: 'terminal' | 'chatbox'; // Pass currentStyle to conditionally render prompt
}

// Re-declare Message type here or import from messageProcessor if needed
// For now, let's assume it's imported or defined globally for simplicity
// In a real app, you'd import it: import { Message from './messageProcessor';
type Message = {
  type: 'info' | 'command' | 'response' | 'error';
  content: string;
};


const TerminalView: React.FC<TerminalViewProps> = ({
  messages,
  inputValue,
  handleInputChange,
  handleKeyDown,
  isProcessing,
  alertMessage,
  currentStyle,
}) => {
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [messages, inputValue]);

  const handleTerminalBodyClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <> {/* Use a fragment as the container is in App.tsx */}
      <div className="terminal-body" ref={terminalBodyRef} onClick={handleTerminalBodyClick}> {/* Attach the ref and onClick handler here */}
        {messages.map((msg, index) => (
          <p key={index} className={msg.type}>
            {currentStyle !== 'chatbox' && msg.type === 'command' && <span className="prompt">guest@chatbox:~$ </span>} {msg.content}
          </p>
        ))}
        {alertMessage && <p className="message-warn-special">{alertMessage}</p>}
        <div className="terminal-input-line"> {/* New div for the input line */}
          <span className="prompt">guest@chatbox:~$ </span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input-inline"
            autoFocus
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
          />
        </div>
      </div>
    </>
  );
};

export default TerminalView;
