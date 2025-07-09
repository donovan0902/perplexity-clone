import Chat from './components/Chat';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Dollar Store Perplexity
        </h1>
        <Chat />
      </div>
    </div>
  );
}
