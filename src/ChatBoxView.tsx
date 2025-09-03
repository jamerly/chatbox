import React, { Component, createRef } from 'react';
import { queryChat, fetchWelcomeMessage, processMessage, type Message } from './services';
import MarkdownRenderer from './MarkdownRenderer';
import './chatbox.css'; // Keep App.css for now, will refactor later

interface ChatBoxViewProps {
  serverUrl?: string | null | undefined;
  appId: string;
  loadUserToken?: (() => Promise<string | undefined>) | undefined;
  closable?: boolean | undefined;
  language?: string | undefined;
  onDestroy?: (() => void) | undefined;
  agentName?: string | undefined;
  onMinimize?: (() => void) | undefined;
  onInit?: ((welcomeMessage: string | null) => void) | undefined;
  onInitError?:((e: string ) => void) | undefined;
  onUserAction?:((e: any ) => void) | undefined;
}

interface ChatBoxViewState {
  messages: Message[];
  chatInput: string;
  isMenuOpen: boolean;
  chatId: string | undefined;
  isProcessing: boolean;
  isMinimized: boolean;
  greetingMessage:string | null;
  loading:boolean;
  initFailed:boolean;
}

class ChatBoxView extends Component<ChatBoxViewProps, ChatBoxViewState> {
  private chatBodyRef = createRef<HTMLDivElement>();

  constructor(props: ChatBoxViewProps) {
    super(props);
    this.state = {
      messages: [],
      chatInput: '',
      isMenuOpen: false,
      chatId: undefined,
      isProcessing: false,
      isMinimized: false,
      greetingMessage: null,
      loading:true,
      initFailed:false,
    };
  }

  getServerHost() {
    const { serverUrl } = this.props;
    return serverUrl || 'https://api.tiein.ai';
  }

  componentDidMount() {
    const { appId, language } = this.props;
    if (!appId) {
      console.error('App ID is required for ChatBoxSDK initialization.');
      return;
    }
    this.loadInit(appId, language);
  }
  componentDidUpdate(prevProps: ChatBoxViewProps, prevState: ChatBoxViewState) {
    if (this.state.messages.length !== prevState.messages.length && this.chatBodyRef.current) {
      this.chatBodyRef.current.scrollTop = this.chatBodyRef.current.scrollHeight;
    }
  }
  
  private loadInit = async (appId: string, language?: string) => {
    try{
      const { loadUserToken } = this.props;
      let userToken = loadUserToken ? await loadUserToken() : undefined;
      const welcomeMessage = await fetchWelcomeMessage(this.getServerHost(), appId, userToken, language || "en-US");
      this.setState({ greetingMessage: welcomeMessage.message });
      
      this.setState(prevState => ({
        messages: [{ type: 'info', content: welcomeMessage.message }],
      }));
      this.loadHistory();
    }catch(e){
       this.setState({
        initFailed:true,
        loading:false
      })
      const onInitError = this.props.onInitError;
      onInitError?.(String(e));
    }
    
  };

  private loadHistory = async () => {
    const onInit = this.props.onInit;
    const {  appId, loadUserToken, language } = this.props;
    const userToken = await loadUserToken?.();
    try{
      const history = await queryChat(this.getServerHost(), appId, userToken, language || "en-US");
      for (const messageItem of history) {
        this.setState(prevState => ({
          messages: [...prevState.messages, { type: 'command', content: messageItem.userMessage }],
        }));
        this.setState(prevState => ({
          messages: [...prevState.messages, { type: 'response', content: messageItem.aiResponse }],
        }));
      }
      this.setState({
        initFailed:false,
        loading:false
      })
      if( history.length > 0 ){
        onInit?.(this.state.greetingMessage);
      }else{
        onInit?.(null);
      }
    }catch(e){
      console.error(e)
      onInit?.(null);
    }
    
  };

  private sendMessage = async () => {
    const { chatInput, messages, chatId } = this.state;
    const { appId, language } = this.props;
    let loadUserToken : () => Promise<string>;
    if( !!this.props.loadUserToken ){
      loadUserToken = this.props.loadUserToken as () => Promise<string>;
    }else{
      loadUserToken = ():Promise<string> => Promise.resolve("");
    }
    const command = chatInput.trim();
    if (!command) {
      this.setState({ chatInput: '' });
      return;
    }
    this.setState({ chatInput: '' });

    const newMessages = [...messages, { type: 'command' as const, content: command }];
    this.setState({ messages: newMessages });
    if (command === '/clear') {
      this.setState({ messages: [], chatId: undefined });
    } else {
      this.setState({ isProcessing: true });
      let lastMessage = "";
      await processMessage(
        command,
        this.getServerHost(),
        appId,
        language || "en-US",
        loadUserToken,
        chatId,
        (chunk: Message) => {
          const newMessages: any = [...this.state.messages];
          if (chunk.type === "response") {
            lastMessage += chunk.content;
            const updatedChunk = { type: 'response', content: lastMessage };
            const lastMsgIndex = newMessages.length - 1;
            if (lastMsgIndex >= 0 && newMessages[lastMsgIndex].type === 'response') {
              newMessages[lastMsgIndex] = updatedChunk;
            } else {
              newMessages.push(updatedChunk);
            }
          } else {
            newMessages.push(chunk);
          }
          this.setState({
            messages: newMessages
          });
        }
      );
      this.setState({ isProcessing: false });
    }
  };

  private handleKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await this.sendMessage();
    }
  };

  private handleNewChat = () => {
    this.setState({ messages: [], chatId: undefined, isMenuOpen: false });
    localStorage.setItem("chatbox_chat_token", "");
  };

  private handleEndChat = () => {
    localStorage.setItem("chatbox_chat_token", "");
    this.props.onDestroy?.();
    this.setState({ isMenuOpen: false });
  };

  private toggleMinimize = () => {
    this.setState(prevState => ({ isMinimized: !prevState.isMinimized }), () => {
      setTimeout(() => {
        this.props.onMinimize?.();
      }, 50);
    });
  };

  render() {
    const { messages, chatInput, isProcessing, isMenuOpen, isMinimized } = this.state;
    const { closable, onDestroy, agentName } = this.props;

    if (isMinimized) {
      return null; // Or render a minimized view if desired
    }

    return (
      <div className="chatbox-container">
        {this.state.loading && <div className="chatbox-loadding">Loading</div>}
        {!this.state.loading && this.state.initFailed &&<div className='chatbox-loadding chatbox-failed'>Chatbox initialization failed.</div>}
        {!this.state.loading && !this.state.initFailed &&
          <>
          <div className="chatbox-header">
            <div className="chatbox-buttons">
              {onDestroy && closable ? (
                <span className="chatbox-button close" onClick={onDestroy}></span>
              ) : null}
              <span className="chatbox-button maximize" onClick={this.toggleMinimize}></span>
              <span className="chatbox-button minimize" onClick={this.toggleMinimize}></span>
            </div>
            <div className="chatbox-title">
                <svg version="1.1" viewBox="0 0 1536 1024" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><path transform="translate(1122,257)" d="m0 0h18l31 2 30 5 26 7 25 10 16 8 18 10 16 12 11 9 14 13 7 8 8 9 10 13 12 17 11 19 9 17 10 25 7 23 5 22 3 29v25l-2 21-5 26-7 23-6 16-10 21-12 20-10 14-8 10-11 13-22 22-11 9-18 13-16 10-16 9-20 9-19 7-26 7-24 4-20 2h-46l-14 15-25 25-8 7-15 13-13 10-18 13-18 12-15 9-24 13-23 10-27 10-32 9-31 6-26 3-13 1h-54l-31-3-30-5-34-9-24-8-24-10-25-12-21-12-22-14-16-12-14-11-11-10-8-7-13-12-8-8 1-3 15-6 17-8 14-8 16-10 16-12 7-5 4 2 24 15 32 17 27 12 25 9 23 7 29 6 22 3 12 1h47l29-3 28-5 21-6 22-8 20-9 18-10 24-16 14-11 11-9 8-7-4-5-10-8-14-12-16-15-7-7-8-7-96-96-4 2-45 45-10 8-14 7-13 4-21 2-17-1-17-4-13-5-12-7-14-11-3-3 2-4 12-13 11-11 7-8 9-9 7-8 10-10 7-8 10-10 7-8 8-8 7-8 7-7 7-8 10-10 7-8 11-11 7-8 16-17 7-7 7-8 14-14 7-8 54-54h2l2-4 8-7 29-29 8-7 8-9 8-7 10-9 18-12 11-7 17-8 21-8 21-6 21-4 18-2zm0 116-27 4-19 6-13 5-17 9-11 8-14 12-44 44-8 7-45 45-8 7-8 8 6 7 8 7 30 28 16 15 7 7 8 7 8 8 8 7 10 10 8 7 11 11 13 10 15 9 16 7 15 5 21 4 8 1h36l22-3 21-6 15-6 17-10 12-9 14-13 9-11 7-10 10-18 8-21 4-18 2-15v-29l-3-20-6-21-8-18-8-14-11-14-5-6h-2l-1-3-8-7-14-10-14-8-15-6-21-6-25-3z" fill="#FFFFFF"></path><path transform="translate(638,108)" d="m0 0h42l28 2 35 5 26 6 32 10 25 10 20 9 27 14 24 15 16 12 14 11 12 11 14 14 10 13 1 4-19 10-18 11-14 10-16 13-14 12h-4l-10-9-16-12-19-13-15-9-20-11-24-10-24-8-31-7-23-3-17-1h-38l-21 2-22 4-24 6-25 9-24 11-18 10-15 10-15 11-11 9-1 2 5 2 14 11 13 12 12 11 104 104 4-1 14-14 8-7 18-18 13-9 13-6 19-5 13-1h10l16 2 17 5 16 8 16 12-1 4-21 21-7 8-15 15-7 8-10 10-1 2h-2l-2 4-13 13-7 8-11 11-7 8-9 9-7 8-7 7-7 8-10 10-7 8-8 8-7 8-16 17-12 13-14 15-12 13-6 7h-2l-2 4-8 8-7 8-7 7-7 8-15 16-9 10-18 18-22 18-18 12-16 9-17 8-19 7-20 6-22 4-20 2h-25l-21-2-22-4-26-8-23-10-17-9-17-11-13-10-14-12-19-19-9-11-8-10-12-18-9-16-11-23-9-27-6-27-2-14-1-14v-30l3-26 6-27 7-22 8-20 10-20 13-21 12-16 12-14 23-23 14-11 12-9 13-8 14-8 19-9 30-10 23-5 15-2 36-2 13-16 9-10 14-15 8-7 10-9 17-13 18-13 27-16 17-9 25-11 25-9 31-9 27-6 30-4zm-314 265-23 3-15 4-15 6-14 7-16 11-16 15-12 15-9 15-7 15-6 19-3 16-1 9v35l3 19 5 17 7 16 9 16 10 13 10 11 11 9 13 10 17 9 19 7 20 4 11 1h22l22-3 15-4 19-8 13-8 9-7 15-15 9-11 7-7 9-11 14-15 7-8 12-14 15-16 11-12 7-8 7-7 3-5-56-56-7-8-24-24-2-3h-2l-2-4-16-16-14-10-16-9-21-8-20-4-10-1z" fill="#FFFFFF"></path></svg>
                {agentName || 'ChatBox'}
              </div>
              <div className="chatbox-menu-container">
                <button className="chatbox-menu-button" onClick={() => this.setState(prevState => ({ isMenuOpen: !prevState.isMenuOpen }))}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                  </svg>
                </button>
                {isMenuOpen && (
                  <div className="chatbox-menu">
                    <button onClick={this.handleNewChat}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>New Chat</span>
                    </button>
                    <button onClick={this.handleEndChat}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                        <line x1="12" y1="2" x2="12" y2="12"></line>
                      </svg>
                      <span>End Chat</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="chatbox-body" ref={this.chatBodyRef}>
              {messages.map((msg, index) => (
                <div key={index} className={msg.type === 'warn' ? 'message-warn-special' : msg.type}>
                  {msg.type === 'response' ? (
                    <MarkdownRenderer content={msg.content} onUserAction={this.props.onUserAction} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="chatbox-footer">
              <div className='chatbox-input'>
                <textarea
                  className="chatbox-input-inline"
                  autoFocus
                  value={chatInput}
                  onChange={(e) => this.setState({ chatInput: e.target.value })}
                  onKeyDown={this.handleKeyDown}
                  disabled={isProcessing}
                  placeholder="Type a message..."
                  rows={3}
                ></textarea>
                <button onClick={this.sendMessage} disabled={isProcessing} className="send-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
              <div className='chatbox-input-tips'>
                Powered by TieIn.ai
              </div>
            </div>
          </>}
        </div>
        
      );
    }
  }

export default ChatBoxView;
