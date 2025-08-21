import { useState, useRef, useEffect } from 'react' // Import useRef and useEffect
import './App.css'
import { processMessage,type Message } from './messageProcessor'; // Import processMessage and Message
import TerminalView from './TerminalView'; // Import TerminalView
import ChatBoxView from './ChatBoxView'; // Import ChatBoxView

interface AppProps {
  onHeaderRendered?: (element: HTMLDivElement) => void;
  onMinimize?: (minimized: boolean) => void;
}

function App({ onHeaderRendered, onMinimize }: AppProps) {
  const [messages, setMessages] = useState<Message[]>([ // Use Message type for messages state
    { type: 'info', content: 'Welcome to the Gemini CLI!' },
    { type: 'info', content: 'Type "help" for a list of commands.' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // New state for processing status
  const [currentStyle, setCurrentStyle] = useState<'terminal' | 'chatbox'>('terminal'); // New state for current style
  const [isMinimized, setIsMinimized] = useState(false); // New state for minimized status
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => { // Make handleKeyDown async
    if (event.key === 'Enter') {
      const command = inputValue.trim();
      if (!command) { // Don't process empty commands
        setInputValue('');
        return;
      }

      setMessages((prevMessages) => [...prevMessages, { type: 'command', content: command }]);

      if (command === '/clear') {
        setMessages([]); // Clear all messages
      } else {
        setIsProcessing(true); // Start processing
        const responseMessages = await processMessage(command);
        let delay = 0;
        for (let i = 0; i < responseMessages.length; i++) {
          const msg = responseMessages[i];
          setTimeout(() => {
            setMessages((prevMessages) => [...prevMessages, msg]);
            if (i === responseMessages.length - 1) {
              setIsProcessing(false); // End processing after the last message
            }
          }, delay);
          delay += 100; // Add 100ms delay between each streamed message
        }
      }
      setInputValue('');
    }
  };


  const headerRef = (node: HTMLDivElement) => {
    if (node && onHeaderRendered) {
      onHeaderRendered(node);
    } else if (!node && onHeaderRendered) {
      // When the component unmounts, node will be null. We don't need to do anything here.
      // Or, if we need to clean up, we can do it here.
    }
  };

  const toggleMinimize = () => {
    const minimized = !isMinimized;
    setIsMinimized(minimized);
    if (onMinimize) {
      onMinimize(minimized);
    }
  }

  return (
    <div className={`terminal-container ${currentStyle === 'chatbox' ? 'chatbox-style' : ''}`}>
      <div className="terminal-header" ref={headerRef}>
        <div className="terminal-buttons">
          <span className="terminal-button close"></span>
          <span className="terminal-button maximize" onClick={() => toggleMinimize()}></span>
          <span className="terminal-button minimize" onClick={() => toggleMinimize()}></span>
        </div>
        <div className="terminal-title">{currentStyle === 'terminal' ? '' : 'Gemini'}</div>
      </div>
      <button className="switch-style" onClick={() => setCurrentStyle(currentStyle === 'terminal' ? 'chatbox' : 'terminal')} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 1000 }}>
        {currentStyle === 'terminal' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#abb2bf' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        ):(
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#00ff00' }}>
            <path d="M10 17l5-5-5-5"/>
          </svg>
        )}
      </button>
      {!isMinimized && (
        currentStyle === 'terminal' ? (
          <TerminalView
            messages={messages}
            inputValue={inputValue}
            handleInputChange={handleInputChange}
            handleKeyDown={handleKeyDown}
            isProcessing={isProcessing}
            currentStyle={currentStyle} // Pass currentStyle for prompt logic
          />
        ) : (
          <ChatBoxView
            messages={messages}
            inputValue={inputValue}
            handleInputChange={handleInputChange}
            handleKeyDown={handleKeyDown}
            isProcessing={isProcessing}
            currentStyle={currentStyle} // Pass currentStyle
          />
        )
      )}
    </div>
  )
}

export default App