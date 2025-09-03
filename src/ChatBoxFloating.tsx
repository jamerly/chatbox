import { useState } from "react";
import ChatBoxView from "./ChatBoxView";
import "./chatbox.floating.css"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
interface ChatBoxFloatingProps {
  serverUrl?: string | null | undefined;
  appId: string;
  loadUserToken?: (() => Promise<string | undefined>) | undefined;
  closable?: boolean | undefined;
  onUserAction?:((e: any ) => void) | undefined;
}

const ChatBoxFloating: React.FC<ChatBoxFloatingProps> = ( options: ChatBoxFloatingProps) => {
  const [showGreetingBubble, setShowGreetingBubble] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [greetingMessage, setGreetingMessage] = useState<string | null>(null);
  const [loadSucceed, setLoadSucceed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  const onUserAction = options.onUserAction;
  return (<div className="chatbox-floating">
    {showGreetingBubble && !!greetingMessage && isMinimized && loadSucceed && (
        <div className="greeting-bubble">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{greetingMessage}</ReactMarkdown>
          <span className="greeting-bubble-close" onClick={() => setShowGreetingBubble(false)}>
            &times;
          </span>
        </div>
      )}
      <div className="minimized-icon" style={{ display: isMinimized ? 'flex' : 'none' }} onClick={toggleMinimize}>
        <svg version="1.1" viewBox="0 0 1536 1024" width="42" height="24" xmlns="http://www.w3.org/2000/svg">
          <path transform="translate(1122,257)" d="m0 0h18l31 2 30 5 26 7 25 10 16 8 18 10 16 12 11 9 14 13 7 8 8 9 10 13 12 17 11 19 9 17 10 25 7 23 5 22 3 29v25l-2 21-5 26-7 23-6 16-10 21-12 20-10 14-8 10-11 13-22 22-11 9-18 13-16 10-16 9-20 9-19 7-26 7-24 4-20 2h-46l-14 15-25 25-8 7-15 13-13 10-18 13-18 12-15 9-24 13-23 10-27 10-32 9-31 6-26 3-13 1h-54l-31-3-30-5-34-9-24-8-24-10-25-12-21-12-22-14-16-12-14-11-11-10-8-7-13-12-8-8 1-3 15-6 17-8 14-8 16-10 16-12 7-5 4 2 24 15 32 17 27 12 25 9 23 7 29 6 22 3 12 1h47l29-3 28-5 21-6 22-8 20-9 18-10 24-16 14-11 11-9 8-7-4-5-10-8-14-12-16-15-7-7-8-7-96-96-4 2-45 45-10 8-14 7-13 4-21 2-17-1-17-4-13-5-12-7-14-11-3-3 2-4 12-13 11-11 7-8 9-9 7-8 10-10 7-8 10-10 7-8 8-8 7-8 7-7 7-8 10-10 7-8 11-11 7-8 16-17 7-7 7-8 14-14 7-8 54-54h2l2-4 8-7 29-29 8-7 8-9 8-7 10-9 18-12 11-7 17-8 21-8 21-6 21-4 18-2zm0 116-27 4-19 6-13 5-17 9-11 8-14 12-44 44-8 7-45 45-8 7-8 8 6 7 8 7 30 28 16 15 7 7 8 7 8 8 8 7 10 10 8 7 11 11 13 10 15 9 16 7 15 5 21 4 8 1h36l22-3 21-6 15-6 17-10 12-9 14-13 9-11 7-10 10-18 8-21 4-18 2-15v-29l-3-20-6-21-8-18-8-14-11-14-5-6h-2l-1-3-8-7-14-10-14-8-15-6-21-6-25-3z" fill="#FFFFFF"/>
          <path transform="translate(638,108)" d="m0 0h42l28 2 35 5 26 6 32 10 25 10 20 9 27 14 24 15 16 12 14 11 12 11 14 14 10 13 1 4-19 10-18 11-14 10-16 13-14 12h-4l-10-9-16-12-19-13-15-9-20-11-24-10-24-8-31-7-23-3-17-1h-38l-21 2-22 4-24 6-25 9-24 11-18 10-15 10-15 11-11 9-1 2 5 2 14 11 13 12 12 11 104 104 4-1 14-14 8-7 18-18 13-9 13-6 19-5 13-1h10l16 2 17 5 16 8 16 12-1 4-21 21-7 8-15 15-7 8-10 10-1 2h-2l-2 4-13 13-7 8-11 11-7 8-9 9-7 8-7 7-7 8-10 10-7 8-8 8-7 8-16 17-12 13-14 15-12 13-6 7h-2l-2 4-8 8-7 8-7 7-7 8-15 16-9 10-18 18-22 18-18 12-16 9-17 8-19 7-20 6-22 4-20 2h-25l-21-2-22-4-26-8-23-10-17-9-17-11-13-10-14-12-19-19-9-11-8-10-12-18-9-16-11-23-9-27-6-27-2-14-1-14v-30l3-26 6-27 7-22 8-20 10-20 13-21 12-16 12-14 23-23 14-11 12-9 13-8 14-8 19-9 30-10 23-5 15-2 36-2 13-16 9-10 14-15 8-7 10-9 17-13 18-13 27-16 17-9 25-11 25-9 31-9 27-6 30-4zm-314 265-23 3-15 4-15 6-14 7-16 11-16 15-12 15-9 15-7 15-6 19-3 16-1 9v35l3 19 5 17 7 16 9 16 10 13 10 11 11 9 13 10 17 9 19 7 20 4 11 1h22l22-3 15-4 19-8 13-8 9-7 15-15 9-11 7-7 9-11 14-15 7-8 12-14 15-16 11-12 7-8 7-7 3-5-56-56-7-8-24-24-2-3h-2l-2-4-16-16-14-10-16-9-21-8-20-4-10-1z" fill="#FFFFFF"/>
        </svg>
      </div>
      {!isMinimized && (
          <ChatBoxView
            appId="testAppId"
            onMinimize={toggleMinimize}
            onInit={(message: string | null) => {
              setLoadSucceed(true);
              setGreetingMessage(message);
              setShowGreetingBubble(true);
            }}
            onUserAction={onUserAction}
            onInitError={ e=>{
              console.error(e);
              setLoadSucceed(false);
              setTimeout(()=>{
                setIsMinimized(true)
              },1000)
            }}
          />
        )
      }
  </div>);
}

export default ChatBoxFloating;