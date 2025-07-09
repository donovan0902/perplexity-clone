# Chatbot Setup Instructions

## Environment Variables

1. Create a `.env.local` file in the root of the project
2. Add your OpenAI API key:

```
OPENAI_API_KEY=your-openai-api-key-here
```

## Running the Application

1. Make sure dependencies are installed:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- Simple chat interface with message history
- Streaming responses from OpenAI
- Dark mode support
- Responsive design

## Customization

You can modify:
- The AI model in `app/api/chat/route.ts` (default: gpt-3.5-turbo)
- The UI styling in `app/components/Chat.tsx`
- Add system prompts or additional parameters to the AI model 