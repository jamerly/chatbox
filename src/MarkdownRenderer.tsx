import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkOP from './lib/remarkOp';
import UserOperationProcessor from "./UserOperationProcessor"
import UserOperationHistoryProcessor  from './UserOperationHistoryProcessor';

interface UserOperation {
  type: string;
  content: string;
  url?: string;
  command?: string;
}

const parseUserOperation = (text: string): UserOperation | null => {
  try {
    const operation = JSON.parse(text);
    return operation;
  } catch (e) {
    console.error("Failed to parse USER_OPERATION JSON:", e);
    return null;
  }
};

interface CustomCodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
  
}

interface MarkdownRendererProps {
  content: string;
  onUserAction?:((e: any ) => void) | undefined;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content,onUserAction }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm,remarkOP]}
      components={{
        code({ inline, className, children, ...props }: CustomCodeProps) {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match
          if (match && match[1].toUpperCase().startsWith('USER_OPERATION') ) {
            var command = match[1]
            const paramsStr = String(children);
            let params: any = {}
            try{
              params = JSON.parse(paramsStr)
            }catch(e){
              return (<pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                    <code className={className} {...props}>
                      Reading command...
                    </code>
                  </pre>)
            }
            if( command === 'USER_OPERATION' ){
              return ( <UserOperationProcessor config={params} onUserAction={onUserAction} ></UserOperationProcessor>)
            }
            return ( <UserOperationHistoryProcessor config={params}></UserOperationHistoryProcessor>)
            
          }
          return inline ? (
            <code className={className} {...props}>
              {children}
            </code>
          ) : (
            <pre>
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
