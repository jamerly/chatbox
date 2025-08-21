export type Message = {
  type: 'info' | 'command' | 'response' | 'error';
  content: string;
};

// Simulate a server response with a delay
const mockServerResponse = (command: string): Promise<Message[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sseMessages: Message[] = [
        { type: 'response', content: `SSE Mock: Processing command "${command}"...` },
        { type: 'response', content: 'SSE Event 1: Data received.' },
        { type: 'response', content: 'SSE Event 2: Analyzing input.' },
        { type: 'response', content: 'SSE Event 3: Generating response.' },
        { type: 'response', content: `SSE Final: Result for "${command}".` },
      ];
      resolve(sseMessages);
    }, 500); // Simulate initial latency before all mock SSE messages are "received"
  });
};

// Built-in command handlers
const builtInCommands: { [key: string]: (command: string) => Promise<Message[]> } = {
  '/help': async () => {
    return [
      { type: 'response', content: 'Available commands:\n/help - Display this help message\n/clear - Clear the terminal\nAny other text will be processed by the server (mocked).' },
    ];
  },
  '/clear': async () => {
    // This command will be handled by App.tsx to clear the messages
    return [];
  },
};

export const processMessage = async (command: string): Promise<Message[]> => {
  const trimmedCommand = command.trim();

  // Check for built-in commands
  if (builtInCommands[trimmedCommand]) {
    return builtInCommands[trimmedCommand](trimmedCommand);
  }

  // If not a built-in command, process via mock server
  return mockServerResponse(trimmedCommand);
};