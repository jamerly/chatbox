import { useState, useRef, useEffect } from 'react'
import './App.css'
import { processMessage, type Message } from './messageProcessor';
import TerminalView from './TerminalView';
import ChatBoxView from './ChatBoxView';

interface AppProps {
  welcomeMessage: string;
  serverUrl: string;
  appId: string;
  language: string;
  onHeaderRendered?: (element: HTMLDivElement) => void;
  onMinimize?: (minimized: boolean) => void;
}

function App({ welcomeMessage, serverUrl, appId, language, onHeaderRendered, onMinimize }: AppProps) {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'info', content: welcomeMessage },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<'terminal' | 'chatbox'>('terminal');
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatId, setChatId] = useState<string | undefined>(undefined); // New state for chatId

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const command = inputValue.trim();
      if (!command) {
        setInputValue('');
        return;
      }
      setInputValue('');
      const currentMessage = JSON.parse( JSON.stringify(messages) );
      currentMessage.push({ type: 'command', content: command });
      setMessages([...currentMessage]);

      if (command === '/clear') {
        setMessages([]);
        setChatId(undefined); // Clear chatId on /clear
      } else {
        setIsProcessing(true);
        
        let lastMessage = "";
        await processMessage(command, serverUrl, appId, language, chatId, (chunk: Message) => {
          if( chunk.type === "response" ){
            lastMessage += chunk.content;
            chunk = { type: 'response', content: lastMessage };
          }else{
            currentMessage.push(chunk);
          }
          setMessages([...currentMessage, chunk]);
        });
        setIsProcessing(false);
      }
      
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
        ): (
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
            currentStyle={currentStyle}
          />
        ) : (
          <ChatBoxView
            messages={messages}
            inputValue={inputValue}
            handleInputChange={handleInputChange}
            handleKeyDown={handleKeyDown}
            isProcessing={isProcessing}
            currentStyle={currentStyle}
          />
        )
      )}
    </div>
  )
}

export default App
