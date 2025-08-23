import React from 'react'
import './App.css'
import { processMessage, type Message } from './messageProcessor';
import { queryChat } from './services/chatboxApi';
import TerminalView from './TerminalView';
import ChatBoxView from './ChatBoxView';

interface AppProps {
  welcomeMessage: string;
  serverUrl: string;
  appId: string;
  language: string;
  closable: boolean;
  loadUserToken?: () => Promise<string>;
  onHeaderRendered?: (element: HTMLDivElement) => void;
  onMinimize?: (minimized: boolean) => void;
  onDestroy?: () => void; // Callback to signal parent to destroy/unmount the component
}

interface AppState {
  messages: Message[];
  inputValue: string;
  isProcessing: boolean;
  currentStyle: 'terminal' | 'chatbox';
  isMinimized: boolean;
  closable: boolean;
  chatId: string | undefined;
  alertMessage: string | null;
}

class App extends React.Component<AppProps, AppState> {
  private lastActive: number;
  private isDestroyed: boolean;
  private animationFrameId: number | null = null; // To store the requestAnimationFrame ID for cleanup

  constructor(props: AppProps) {
    super(props);
    this.state = {
      messages: [{ type: 'info', content: props.welcomeMessage }],
      inputValue: '',
      isProcessing: false,
      currentStyle: 'terminal',
      isMinimized: false,
      chatId: undefined,
      closable: props.closable,
      alertMessage: null,
    };

    this.lastActive = Date.now();
    this.isDestroyed = false;

    // Bind methods to the instance
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.checkInactivity = this.checkInactivity.bind(this);
    this.headerRef = this.headerRef.bind(this);
    this.toggleMinimize = this.toggleMinimize.bind(this);
  }

  componentDidMount() {
    this.loadHistory();
    if( this.props.closable ){
      this.checkInactivity();
    }
  }
  componentWillUnmount() {
    this.isDestroyed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ inputValue: event.target.value });
  }

  checkInactivity() {
    const MAX_INACTIVITY_TIME = 40 * 1000; // 40 seconds
    const WAITTING_TIME = 30 * 1000; // 10 seconds

    let waitSeconds = Date.now() - this.lastActive;

    if (waitSeconds >= WAITTING_TIME) {
        let leftSeconds = Math.ceil((MAX_INACTIVITY_TIME - waitSeconds) / 1000);
        this.setState({ alertMessage: `You have been inactive for a while, chat will close at ${leftSeconds} seconds` });
    } else {
        this.setState({ alertMessage: null }); // Clear message if active again
    }
    if (waitSeconds >= MAX_INACTIVITY_TIME) {
      // If inactive for too long, signal parent to destroy the component
      this.props.onDestroy?.();
      return; // Stop further checks as component is about to be destroyed
    }

    if (!this.isDestroyed && this.props.closable ) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.checkInactivity();
      });
    }
  }

  async handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      this.lastActive = Date.now();
      const command = this.state.inputValue.trim();
      if (!command) {
        this.setState({ inputValue: '' });
        return;
      }
      this.setState({ inputValue: '' });

      const currentMessages = JSON.parse(JSON.stringify(this.state.messages));
      currentMessages.push({ type: 'command', content: command });
      this.setState({ messages: [...currentMessages] });

      if (command === '/clear') {
        this.setState({ messages: [], chatId: undefined });
      } else {
        this.setState({ isProcessing: true });

        let lastMessage = "";
        await processMessage(
          command,
          this.props.serverUrl,
          this.props.appId,
          this.props.loadUserToken,
          this.props.language,
          this.state.chatId,
          (chunk: Message) => {
            this.setState(prevState => {
              const newMessages:any = [...prevState.messages];
              if (chunk.type === "response") {
                lastMessage += chunk.content;
                const updatedChunk = { type: 'response', content: lastMessage };
                // Find and update the last response message or add a new one
                const lastMsgIndex = newMessages.length - 1;
                if (lastMsgIndex >= 0 && newMessages[lastMsgIndex].type === 'response') {
                  newMessages[lastMsgIndex] = updatedChunk;
                } else {
                  newMessages.push(updatedChunk);
                }
              } else {
                newMessages.push(chunk);
              }
              return { messages: newMessages };
            });
          }
        );
        this.setState({ isProcessing: false });
      }
    }
  }

  headerRef(node: HTMLDivElement) {
    if (node && this.props.onHeaderRendered) {
      this.props.onHeaderRendered(node);
    } else if (!node && this.props.onHeaderRendered) {
      // When the component unmounts, node will be null. We don't need to do anything here.
      // Or, if we need to clean up, we can do it here.
    }
  }

  toggleMinimize() {
    this.setState(prevState => {
      const minimized = !prevState.isMinimized;
      if (this.props.onMinimize) {
        this.props.onMinimize(minimized);
      }
      return { isMinimized: minimized };
    });
  }

  loadHistory = async () => {
    const { serverUrl, appId, loadUserToken, language } = this.props;
    const userToken = await loadUserToken();
    const history = await queryChat(serverUrl, appId, userToken, language);
    for( const messageItem of history ){
      this.setState(prevState => ({
        messages: [...prevState.messages, { type: 'command', content: messageItem.userMessage }]
      }));
      this.setState(prevState => ({
        messages: [...prevState.messages, { type: 'response', content: messageItem.aiResponse }]
      }));
    }
  }

  render() {
    
    const { messages, inputValue, isProcessing, currentStyle, isMinimized, alertMessage } = this.state;
    const { closable } = this.props;
    return (
      <div className={`terminal-container ${currentStyle === 'chatbox' ? 'chatbox-style' : ''}`}>
        <div className="terminal-header" ref={this.headerRef}>
          <div className="terminal-buttons">
            {(this.props.onDestroy && closable) &&
              <span className="terminal-button close" onClick={this.props.onDestroy}></span>
            }
            <span className="terminal-button maximize" onClick={this.toggleMinimize}></span>
            <span className="terminal-button minimize" onClick={this.toggleMinimize}></span>
          </div>
          <div className="terminal-title">{currentStyle === 'terminal' ? '' : 'Gemini'}</div>
        </div>
        <button className="switch-style" onClick={() => this.setState(prevState => ({ currentStyle: prevState.currentStyle === 'terminal' ? 'chatbox' : 'terminal' }))} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 1000 }}>
          {currentStyle === 'terminal' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#abb2bf' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          ) : (
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
              handleInputChange={this.handleInputChange}
              handleKeyDown={this.handleKeyDown}
              isProcessing={isProcessing}
              alertMessage={alertMessage}
              currentStyle={currentStyle}
            />
          ) : (
            <ChatBoxView
              messages={messages}
              inputValue={inputValue}
              handleInputChange={this.handleInputChange}
              handleKeyDown={this.handleKeyDown}
              isProcessing={isProcessing}
              alertMessage={alertMessage}
              currentStyle={currentStyle}
            />
          )
        )}
      </div>
    );
  }
}

export default App;
