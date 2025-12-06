'use client';

import { ChatHistoryItem } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: ChatHistoryItem;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* User Question */}
      <div className="flex justify-end">
        <div className="w-full max-w-3xl">
          <div className="rounded-lg bg-purple-600 px-4 py-3 text-white shadow-sm">
            <p className="whitespace-pre-wrap text-sm">{message.question}</p>
          </div>
          <p className="mt-1 text-right text-xs text-gray-500">
            {formatDate(message.createdAt)}
          </p>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex justify-start">
        <div className="w-full max-w-3xl">
          <div className="rounded-lg bg-white px-4 py-3 text-gray-900 shadow-sm border border-gray-100 prose prose-sm max-w-none prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2 prose-pre:bg-gray-800 prose-pre:p-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const {children, className, node, ref, ...rest} = props
                  const match = /language-(\w+)/.exec(className || '')
                  return match ? (
                    <SyntaxHighlighter
                      {...rest}
                      PreTag="div"
                      children={String(children).replace(/\n$/, '')}
                      language={match[1]}
                      style={vscDarkPlus}
                      className="rounded-md !m-0"
                    />
                  ) : (
                    <code {...rest} className={`${className} bg-gray-100 rounded px-1 py-0.5`}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.answer}
            </ReactMarkdown>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {formatDate(message.createdAt)}
            </p>
            <p className="text-xs text-gray-500">{message.tokens} tokens</p>
          </div>
        </div>
      </div>
    </div>
  );
}
