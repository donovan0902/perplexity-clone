// agent.mts

// IMPORTANT - Set your API keys as environment variables before running
// For testing only - remove these before committing!

import { TavilySearch } from "@langchain/tavily";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Define the tools for the agent to use
const agentTools = [new TavilySearch({ maxResults: 3 })];
const agentModel = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
export const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});

// Export a function to invoke the agent
export async function invokeAgent(
  messages: BaseMessage[], 
  threadId: string = "default"
) {
  const response = await agent.invoke(
    { messages },
    { configurable: { thread_id: threadId } },
  );
  
  return response;
}
