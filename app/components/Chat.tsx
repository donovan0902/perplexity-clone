'use client';

import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Source {
  title: string;
  url: string;
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  // Function to extract sources and content from a message
  const parseMessageContent = (content: string): { text: string; sources: Source[] } => {
    const sourcesMatch = content.match(/<!--SOURCES:(.*?)-->/);
    
    if (sourcesMatch) {
      try {
        const sources = JSON.parse(sourcesMatch[1]);
        const text = content.replace(/<!--SOURCES:.*?-->/g, '').trim();
        return { text, sources };
      } catch (e) {
        console.error('Error parsing sources:', e);
      }
    }
    
    return { text: content, sources: [] };
  };

  // Custom markdown components
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const markdownComponents = {
    // Style code blocks
    code: ({ inline, children, ...props }: any) => {
      if (inline) {
        return (
          <code 
            className="px-1.5 py-0.5 text-sm font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-4">
          <code 
            className="text-sm font-mono text-gray-800 dark:text-gray-200"
            {...props}
          >
            {children}
          </code>
        </pre>
      );
    },
    // Style links
    a: ({ href, children, ...props }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline"
        {...props}
      >
        {children}
      </a>
    ),
    // Style headings
    h1: ({ children, ...props }: any) => (
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-4" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-5 mb-3" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4 mb-2" {...props}>
        {children}
      </h3>
    ),
    // Style lists
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside space-y-1 my-3 text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside space-y-1 my-3 text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="ml-4" {...props}>
        {children}
      </li>
    ),
    // Style blockquotes
    blockquote: ({ children, ...props }: any) => (
      <blockquote 
        className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4"
        {...props}
      >
        {children}
      </blockquote>
    ),
    // Style paragraphs
    p: ({ children, ...props }: any) => (
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 last:mb-0" {...props}>
        {children}
      </p>
    ),
    // Style strong/bold text
    strong: ({ children, ...props }: any) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>
        {children}
      </strong>
    ),
    // Style tables
    table: ({ children, ...props }: any) => (
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 my-4" {...props}>
        {children}
      </table>
    ),
    th: ({ children, ...props }: any) => (
      <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-medium" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props}>
        {children}
      </td>
    ),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="w-full max-w-4xl mx-auto h-screen flex flex-col">
      {/* Messages Container with bottom padding for sticky input */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
            <h1 className="text-2xl font-light mb-4">Ask anything</h1>
            <p className="text-sm">Start a conversation by typing a message below</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => {
              const { text, sources } = message.role === 'assistant' 
                ? parseMessageContent(message.content)
                : { text: message.content, sources: [] };
                
              return (
                <div key={message.id} className="group">
                  {message.role === 'user' ? (
                    // User message - styled as a question
                    <div className="mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 prose prose-gray dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Assistant message - styled as an answer
                    <div className="mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="prose prose-gray dark:prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={markdownComponents}
                            >
                              {text}
                            </ReactMarkdown>
                          </div>
                          
                          {/* Render sources */}
                          {sources.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors group/link"
                                  title={source.title}
                                >
                                  <span className="font-medium">{idx + 1}</span>
                                  <span className="max-w-[200px] truncate">
                                    {source.title}
                                  </span>
                                  <svg className="w-3 h-3 opacity-50 group-hover/link:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Add a separator between Q&A pairs */}
                  {message.role === 'assistant' && index < messages.length - 1 && (
                    <hr className="my-8 border-gray-200 dark:border-gray-700" />
                  )}
                </div>
              );
            })}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="group">
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Input Form at bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10">
        <form
          onSubmit={handleSubmit}
          className="p-4"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask a follow-up..."
                className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-lg"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 