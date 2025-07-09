'use client';

import { useChat } from '@ai-sdk/react';

interface Source {
  title: string;
  url: string;
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

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

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
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
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                          {text}
                        </h2>
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
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {text}
                            </p>
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
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
                className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 