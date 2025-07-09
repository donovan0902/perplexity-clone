import { HumanMessage, AIMessage } from '@langchain/core/messages';
// @ts-expect-error - mts extension
import { invokeAgent } from '../../../langgraph-agent/agent.mts';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
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
    const response = await invokeAgent(langchainMessages, threadId);
    
    // Extract the content from the response
    const content = response.content as string;
    
    // Return response in the format expected by useChat hook
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send the data in the format expected by Vercel AI SDK
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