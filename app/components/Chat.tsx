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
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            Start a conversation by typing a message below
          </div>
        ) : (
          messages.map((message) => {
            const { text, sources } = message.role === 'assistant' 
              ? parseMessageContent(message.content)
              : { text: message.content, sources: [] };
              
            return (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {text}
                    </div>
                  </div>
                </div>
                
                {/* Render sources as buttons */}
                {sources.length > 0 && (
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[80%] flex flex-wrap gap-2">
                      {sources.map((source, index) => (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors"
                          title={source.title}
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 dark:border-gray-700 p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!input.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 