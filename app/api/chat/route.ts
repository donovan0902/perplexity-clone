import { HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
// @ts-expect-error - mts extension
import { invokeAgent } from '../../../langgraph-agent/agent.mts';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Source {
  title: string;
  url: string;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert the messages from Vercel AI format to LangChain format
  const langchainMessages = messages.map((msg: Message) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else if (msg.role === 'assistant') {
      return new AIMessage(msg.content);
    }
    // Handle system messages if needed
    return new HumanMessage(msg.content);
  });

  try {
    // Get a unique thread ID from the request headers or generate one
    const threadId = req.headers.get('x-thread-id') || crypto.randomUUID();
    
    // Invoke the agent with the conversation history
    const agentState = await invokeAgent(langchainMessages, threadId);
    
    // Extract sources from the agent state
    const sources: Source[] = [];
    
    // Look through all messages in the state to find Tavily search results
    if (agentState && agentState.messages) {
      for (const message of agentState.messages) {
        if (message instanceof ToolMessage && message.name === 'tavily_search') {
          try {
            const toolContent = JSON.parse(message.content as string);
            if (toolContent.results) {
              for (const result of toolContent.results) {
                sources.push({
                  title: result.title,
                  url: result.url
                });
              }
            }
          } catch (e) {
            console.error('Error parsing tool message:', e);
          }
        }
      }
    }
    
    // Get the last message (the AI's response)
    const lastMessage = agentState.messages[agentState.messages.length - 1];
    let content = lastMessage.content as string;
    
    // Add sources as a special JSON block at the end if available
    if (sources.length > 0) {
      content += '\n\n<!--SOURCES:' + JSON.stringify(sources) + '-->';
    }
    
    // Return response in the format expected by useChat hook
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send the message content with sources in a hidden format
        controller.enqueue(encoder.encode(`0:"${content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error invoking agent:', error);
    return new Response('Error processing request', { status: 500 });
  }
} 