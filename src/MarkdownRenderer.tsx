import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkOP from './lib/remarkOp';
import UserOperationProcessor from "./UserOperationProcessor"

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
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm,remarkOP]}
      components={{
        code({ inline, className, children, ...props }: CustomCodeProps) {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match
          if (match && match[1].toUpperCase() === 'USER_OPERATION') {
            var command = ''
              const paramsStr = String(children);
              let params: any = {}
              try{
                params = JSON.parse(paramsStr)
              }catch(e){
                console.error('Error parsing JCMD params:', paramsStr)
                return (<pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        指令读取中...
                      </code>
                    </pre>)
              }
              return ( <UserOperationProcessor config={params} ></UserOperationProcessor>)
            }
          return inline ? (
            <code className={className} {...props}>
              22{children}
            </code>
          ) : (
            <pre>
              <code className={className} {...props}>
                33{children}
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
